import * as mammoth from "mammoth";
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.entry';

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
