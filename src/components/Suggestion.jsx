import React, { useState, useEffect } from "react";
import { Button, message, Spin, Typography, Select } from "antd";
import { saveAs } from "file-saver";
import { useSelector } from "react-redux";
import { diffWords } from "diff";
import { Document, Packer, Paragraph, TextRun } from "docx";
import jsPDF from "jspdf";
import { OpenAI } from "openai";

// Initialize OpenAI client with API key and enable browser use
const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

const { Text, Title } = Typography;
const { Option } = Select;

const Suggestions = () => {
  // Retrieve file content and name from Redux store
  const { fileContent, name } = useSelector((state) => state.fileUpload);

  // State variables for suggestions, updated content, loading status, thank-you message, and selected file format
  const [suggestions, setSuggestions] = useState([]);
  const [updatedContent, setUpdatedContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState("txt");

  // Generate suggestions when file content changes
  useEffect(() => {
    if (fileContent) {
      handleGenerateSuggestions();
    } else {
      message.warning("Please upload a valid file for analysis.");
    }
  }, [fileContent]);

  // Function to handle generating suggestions by interacting with OpenAI API
  const handleGenerateSuggestions = async () => {
    setLoading(true);
    try {
      const gptResponse = await analyzeTextHandler(fileContent); // Analyze text using OpenAI
      processAPIResponse(gptResponse); // Process API response to update suggestions
    } catch (error) {
      handleError(error, "generate suggestions");
    } finally {
      setLoading(false); // Set loading to false after completion
    }
  };

  // Function to send text to OpenAI API for analysis
  const analyzeTextHandler = async (text) => {
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
      return response.choices[0].message.content; // Return the improved text
    } catch (error) {
      throw new Error("Failed to analyze text.");
    }
  };

  // Process API response to format suggestions and update content
  const processAPIResponse = (response) => {
    const formattedSuggestions = response
      .split("\n")
      .filter((s) => s.trim())
      .map((s) => ({ text: s })); // Split suggestions into lines

    setSuggestions(formattedSuggestions);
    setUpdatedContent(response);
  };

  // Handle and display errors
  const handleError = (error, context) => {
    const errorMessage = error.message || "An unknown error occurred.";
    message.error(`Failed to ${context}. ${errorMessage}`);
  };

  // Save the updated content in the selected file format
  const handleSaveAs = () => {
    if (selectedFormat === "txt") {
      saveAsTxt();
    } else if (selectedFormat === "docx") {
      saveAsDocx();
    } else if (selectedFormat === "pdf") {
      saveAsPdf();
    }
  };

  // Save updated content as a .txt file
  const saveAsTxt = () => {
    const updatedFileName = name ? name.replace(/(\.\w+)$/, "-updated.txt") : "updated-text.txt";
    const blob = new Blob([updatedContent], { type: "text/plain;charset=utf-8" });
    saveAs(blob, updatedFileName);
    message.success("File saved as TXT!");
  };

  // Save updated content as a .docx file
  const saveAsDocx = () => {
    const doc = new Document({
      sections: [{ children: [new Paragraph(new TextRun(updatedContent))] }],
    });

    Packer.toBlob(doc).then((blob) => {
      const updatedFileName = name ? name.replace(/(\.\w+)$/, "-updated.docx") : "updated-text.docx";
      saveAs(blob, updatedFileName);
      message.success("File saved as DOCX!");
    });
  };

  // Save updated content as a .pdf file
  const saveAsPdf = () => {
    const doc = new jsPDF();
    const lines = doc.splitTextToSize(updatedContent, 180); // Wrap text for PDF
    doc.text(lines, 10, 10);
    const updatedFileName = name ? name.replace(/(\.\w+)$/, "-updated.pdf") : "updated-text.pdf";
    doc.save(updatedFileName);
    message.success("File saved as PDF!");
  };

  // Handle rejecting suggestions and display a thank-you message
  const handleReject = () => {
    setSuggestions([]); // Clear suggestions
    setShowThankYou(true); // Show thank-you message
    message.info("Suggestions rejected. Thank you!");
  };

  // Highlight differences between original text and suggestions
  const highlightChanges = (original, suggestion) => {
    const differences = diffWords(original, suggestion);
    return differences.map((part, index) => {
      if (part.added) {
        return <span key={index} style={{ backgroundColor: "rgba(0, 255, 0, 0.3)" }}>{part.value}</span>; // Highlight additions
      }
      if (!part.removed) {
        return <span key={index} style={{ whiteSpace: "pre-wrap" }}>{part.value}</span>; // Keep unchanged text
      }
      return null; // Skip removed parts
    });
  };

  // Render loading spinner
  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Spin size="large" />
        <Text className="ml-2">Generating suggestions...</Text>
      </div>
    );
  }

  // Render thank-you message
  if (showThankYou) {
    return (
      <div className="text-center">
        <Text type="success" className="font-bold">
          Thank you for reviewing the suggestions!
        </Text>
      </div>
    );
  }

  // Main render function
  return (
    <div className="p-4 h-[600px] border rounded-md bg-gray-50">
      <Title level={4}>Suggested Improvements</Title>
      <div className="p-4 h-[500px] overflow-scroll border rounded bg-white shadow-sm">
        {suggestions.length > 0 ? (
          suggestions.map((suggestion, index) => (
            <div key={index} className="mb-4">
              <div>{highlightChanges(fileContent, suggestion.text)}</div>
            </div>
          ))
        ) : (
          <Text>No suggestions available.</Text>
        )}
      </div>
      <div className="flex justify-end mt-2 gap-4">
        <Select  disabled={suggestions.length === 0} defaultValue="txt" style={{ width: 120 }} onChange={(value) => setSelectedFormat(value)}>
          <Option value="txt">TXT</Option>
          <Option value="docx">DOCX</Option>
          <Option value="pdf">PDF</Option>
        </Select>
        <Button onClick={handleReject} danger disabled={suggestions.length === 0}>
          Reject
        </Button>
        <Button onClick={handleSaveAs} type="primary" disabled={suggestions.length === 0}>
          Save as {selectedFormat.toUpperCase()}
        </Button>
      </div>
    </div>
  );
};

export default Suggestions;
