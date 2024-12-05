import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import mammoth from "mammoth";

// Component to render the content of a DOCX file in a web-friendly HTML format
const DocxViewer = () => {
  const {  rawFile } = useSelector((state) => state.fileUpload);
  const [htmlContent, setHtmlContent] = useState("");

  // Reference to the viewer container for potential future use
  const viewerRef = useRef(null);

  // Effect to handle conversion of DOCX file to HTML when the rawFile changes
  useEffect(() => {
    // Function to convert DOCX Blob to HTML using Mammoth.js
    const convertDocxToHtml = async (blob) => {
      try {
        // Read the Blob data as an ArrayBuffer (required by Mammoth.js)
        const arrayBuffer = await blob.arrayBuffer();

        // Use Mammoth.js to convert the ArrayBuffer into HTML
        const { value: html } = await mammoth.convertToHtml({ arrayBuffer });

        // Update the state with the converted HTML
        setHtmlContent(html);
      } catch (error) {
        console.error("Error rendering DOCX with Mammoth:", error);
      }
    };

    // Check if the rawFile is a valid DOCX file Blob
    if (
      rawFile instanceof Blob &&
      rawFile.type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      // Trigger conversion if the file is valid
      convertDocxToHtml(rawFile);
    }
  }, [rawFile]);

  // If no file is uploaded, display a message to the user
  if (!rawFile) {
    return (
      <p className="text-center text-gray-500">
        No DOCX document uploaded to view.
      </p>
    );
  }

  // Render the converted HTML content inside a styled container
  return (
    <div
      ref={viewerRef} 
      className="w-full h-[600px] overflow-scroll max-w-4xl mx-auto p-4 border border-gray-300 rounded-md shadow-lg bg-white"
    >
      <div
        className="prose prose-sm"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    </div>
  );
};

export default DocxViewer;
