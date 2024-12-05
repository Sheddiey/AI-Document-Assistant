import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const TextViewer = () => {
  const { rawFile } = useSelector((state) => state.fileUpload);
  const [textContent, setTextContent] = useState("");

  useEffect(() => {
    if (rawFile instanceof Blob) {
      const reader = new FileReader();

      reader.onload = (e) => {
        setTextContent(e.target.result); // Display the text content
      };

      reader.onerror = (error) => {
        console.error("Error reading text file:", error);
      };

      reader.readAsText(rawFile); // Correct method for text files
    } else {
      setTextContent(""); // Clear content if rawFile is invalid or null
    }
  }, [rawFile]);

  if (!rawFile) {
    return (
      <p className="text-center text-gray-500">
        No text document uploaded to view.
      </p>
    );
  }

  return (
    <div
      className="w-full h-[600px] overflow-scroll max-w-4xl mx-auto p-4 border border-gray-300 rounded-md shadow-lg bg-white"
    >
      <pre className="whitespace-pre-wrap text-sm text-gray-800">
        {textContent || "Unable to display content."}
      </pre>
    </div>
  );
};

export default TextViewer;
