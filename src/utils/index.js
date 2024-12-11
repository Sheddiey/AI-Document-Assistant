import * as mammoth from "mammoth";
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.entry';
import { diffWords } from "diff";
import { Document, Packer, Paragraph, TextRun } from "docx";
import jsPDF from "jspdf";
import { saveAs } from "file-saver";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

// Extract text from PDF Blob for text-based viewers
export const extractTextFromPDF = async (file) => {
  const fileReader = new FileReader();
  return new Promise((resolve, reject) => {
    fileReader.onload = async (e) => {
      const typedArray = new Uint8Array(e.target.result);
      try {
        const pdf = await pdfjsLib.getDocument(typedArray).promise;
        let extractedText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map((item) => item.str).join(' ');
          extractedText += pageText + '\n';
        }
        resolve(extractedText);
      } catch (err) {
        reject(err);
      }
    };
    fileReader.onerror = () => reject(fileReader.error);
    fileReader.readAsArrayBuffer(file);
  });
};

// Extract text from DOCX Blob using Mammoth
export const extractTextFromWord = async (fileBlob) => {
  if (!(fileBlob instanceof Blob)) {
    throw new Error("Invalid file format. Expected a Blob object.");
  }

  const arrayBuffer = await fileBlob.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });

  return result.value; // Raw text for text-based viewers or indexing.
};

// Extract text from .TXT Blob
export const extractTextFromTxt = (fileBlob) => {
  if (!(fileBlob instanceof Blob)) {
    throw new Error("Invalid file format. Expected a Blob object.");
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(reader.result); // Return plain text.
    reader.onerror = reject;
    reader.readAsText(fileBlob);
  });
};

// Generic utility to extract file metadata
export const extractFileMetadata = (file) => {
  if (!(file instanceof File || file instanceof Blob)) {
    throw new Error("Invalid file format. Expected a File or Blob object.");
  }

  return {
    fileName: file.name || "Unknown",
    fileType: file.type || "Unknown",
    fileSize: file.size,
  };
};


export const analyzeTextHandler = async (text, openai) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful assistant that improves text for grammar, clarity, and readability." },
        { role: "user", content: `Improve the following text for grammar, clarity, and readability:\n\n${text}` },
      ],
      max_tokens: 500,
      temperature: 0.7,
    });
    return response.choices[0].message.content;
  } catch (error) {
    throw new Error("Failed to analyze text.");
  }
};

export const processAPIResponse = (response) => {
  return response
    .split("\n")
    .filter((s) => s.trim())
    .map((s) => ({ text: s }));
};

export const handleError = (error, context) => {
  const errorMessage = error.message || "An unknown error occurred.";
  return `Failed to ${context}. ${errorMessage}`;
};

export const saveAsTxt = (content, fileName) => {
  const updatedFileName = fileName ? fileName.replace(/(\.\w+)$/, "-updated.txt") : "updated-text.txt";
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  saveAs(blob, updatedFileName);
};

export const saveAsDocx = (content, fileName) => {
  const doc = new Document({
    sections: [{ children: [new Paragraph(new TextRun(content))] }],
  });

  Packer.toBlob(doc).then((blob) => {
    const updatedFileName = fileName ? fileName.replace(/(\.\w+)$/, "-updated.docx") : "updated-text.docx";
    saveAs(blob, updatedFileName);
  });
};

export const saveAsPdf = (content, fileName) => {
  const doc = new jsPDF();
  const lines = doc.splitTextToSize(content, 180);
  doc.text(lines, 10, 10);
  const updatedFileName = fileName ? fileName.replace(/(\.\w+)$/, "-updated.pdf") : "updated-text.pdf";
  doc.save(updatedFileName);
};

export const highlightChanges = (original, suggestion) => {
  const differences = diffWords(original, suggestion);
  return differences.map((part, index) => {
    if (part.added) {
      return (
        <span key={index} style={{ backgroundColor: "rgba(0, 255, 0, 0.3)" }}>
          {part.value}
        </span>
      );
    }
    if (!part.removed) {
      return <span key={index} style={{ whiteSpace: "pre-wrap" }}>{part.value}</span>;
    }
    return null;
  });
};