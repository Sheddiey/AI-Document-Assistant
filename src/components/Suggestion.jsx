import React, { useState, useEffect } from "react";
import { Button, message, Spin, Typography, Select } from "antd";
import { useSelector } from "react-redux";
import { OpenAI } from "openai";
import {
  analyzeTextHandler,
  processAPIResponse,
  handleError,
  saveAsTxt,
  saveAsDocx,
  saveAsPdf,
  highlightChanges,
} from "../utils/index";

const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

const { Text, Title } = Typography;
const { Option } = Select;

const Suggestions = () => {
  const { fileContent, name } = useSelector((state) => state.fileUpload);

  const [suggestions, setSuggestions] = useState([]);
  const [updatedContent, setUpdatedContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState("txt");

  useEffect(() => {
    if (fileContent) {
      handleGenerateSuggestions();
    } else {
      message.warning("Please upload a valid file for analysis.");
    }
  }, [fileContent]);

  const handleGenerateSuggestions = async () => {
    setLoading(true);
    try {
      const gptResponse = await analyzeTextHandler(fileContent, openai);
      const formattedSuggestions = processAPIResponse(gptResponse);
      setSuggestions(formattedSuggestions);
      setUpdatedContent(gptResponse);
    } catch (error) {
      message.error(handleError(error, "generate suggestions"));
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAs = () => {
    if (selectedFormat === "txt") {
      saveAsTxt(updatedContent, name);
    } else if (selectedFormat === "docx") {
      saveAsDocx(updatedContent, name);
    } else if (selectedFormat === "pdf") {
      saveAsPdf(updatedContent, name);
    }
  };

  const handleReject = () => {
    setSuggestions([]);
    setShowThankYou(true);
    message.info("Suggestions rejected. Thank you!");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full bg-white py-4">
        <Spin size="large" />
        <Text className="ml-2">Generating suggestions...</Text>
      </div>
    );
  }

  if (showThankYou) {
    return (
      <div className="text-center bg-white py-4">
        <Text type="success" className="font-bold">
          Thank you for reviewing the suggestions!
        </Text>
      </div>
    );
  }

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
        <Select
          disabled={suggestions.length === 0}
          defaultValue="txt"
          style={{ width: 120 }}
          onChange={(value) => setSelectedFormat(value)}
        >
          <Option value="txt">TXT</Option>
          <Option value="docx">DOCX</Option>
          <Option value="pdf">PDF</Option>
        </Select>
        <Button
          onClick={handleReject}
          danger
          disabled={suggestions.length === 0}
        >
          Reject
        </Button>
        <Button
          onClick={handleSaveAs}
          type="primary"
          disabled={suggestions.length === 0}
        >
          Save as {selectedFormat.toUpperCase()}
        </Button>
      </div>
    </div>
  );
};

export default Suggestions;
