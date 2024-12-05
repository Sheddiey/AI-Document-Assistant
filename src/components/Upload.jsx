import React, { useState } from "react";
import { Upload, message, Progress, Button } from "antd";
import { DeleteOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { useDispatch } from "react-redux";
import {
  uploadError,
  uploadSuccess,
  startUpload,
} from "../state/fileUploadSlice";
import SpinnerOverlay from "./Spinner";
import { extractTextFromPDF, extractTextFromTxt, extractTextFromWord } from "../utils";
import { useNavigate } from "react-router-dom";

// Supported file formats for upload
const acceptedFormats = [".docx", ".pdf", ".txt"];

const FileUpload = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [progress, setProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadCompleted, setUploadCompleted] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Validate and handle the upload process
  const beforeUpload = (file) => {
    const fileExtension = file.name
      .slice(file.name.lastIndexOf("."))
      .toLowerCase();
    if (!acceptedFormats.includes(fileExtension)) {
      const errorMessage = `Unsupported file format: ${fileExtension}`;
      dispatch(uploadError(errorMessage));
      message.warning(errorMessage);
      setUploadedFile(null);
      return false;
    }

    setUploadedFile({
      name: file.name,
      format: fileExtension.replace(".", "").toUpperCase(),
      size: file.size,
    });
    setUploadCompleted(false);
    handleFile(file);
    return false;
  };

  // Extract content and dispatch success/error actions
  const handleFile = async (file) => {
    dispatch(startUpload()); // Notify Redux store of upload start

    try {
      const fileType = file.name.split(".").pop().toLowerCase();
      setProgress(20); // Simulated initial progress

      let fileContent = null;

      // Extract content based on file type, or skip extraction for unsupported formats
      if (fileType === "pdf") {
        fileContent = await extractTextFromPDF(file);
      } else if (fileType === "docx") {
        fileContent = await extractTextFromWord(file);
      } else if (fileType === "txt") {
        fileContent = await extractTextFromTxt(file);
      }

      // Send the file directly to Redux store
      dispatch(
        uploadSuccess({
          content: fileContent, 
          name: file.name,
          type: fileType,
          size: Math.round(file.size / 1024), // Convert size to KB
          file, // Raw file object for further processing
        })
      );

      setProgress(100); // Update progress to complete
      setTimeout(() => {
        setUploadCompleted(true); // Mark upload as complete
        message.success(`File "${file.name}" uploaded successfully!`);
      }, 500);
    } catch (error) {
      // Handle file processing errors
      console.error("File processing error:", error);
      const errorMessage = `Error processing file: ${error.message}`;
      dispatch(uploadError(errorMessage));
      message.error(errorMessage);
    }
  };

  const handleDelete = () => {
    setUploadedFile(null);
    setProgress(0);
    setUploadCompleted(false);
    message.info("File removed successfully.");
  };

  const handleContinue = () => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      navigate("/document-viewer");
    }, 2000);
  };

  const uploadProps = {
    name: "file",
    beforeUpload,
    showUploadList: false,
    accept: acceptedFormats.join(","),
  };

  return (
    <>
      {processing && (
        <SpinnerOverlay text="Processing document, please wait..." />
      )}
      <div className="flex flex-col items-center w-full max-w-md mx-auto">
        <Upload.Dragger
          {...uploadProps}
          className="w-full"
          style={{
            border: "2px dashed #d9d9d9",
            padding: "16px",
            borderRadius: "8px",
          }}
          multiple={false}
        >
          <p>
            <span className="text-gray-500">
              Drag and drop your document here
            </span>
          </p>
          <p className="ant-upload-hint">
            Accepted formats: <strong>.txt, .docx, .pdf</strong>
          </p>
        </Upload.Dragger>

        {uploadedFile && (
          <div className="mt-4 p-2 border border-gray-300 rounded-md bg-gray-50 w-full flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 text-white bg-blue-500 rounded-md">
                  {uploadedFile.format}
                </span>
                <div>
                  <h4 className="font-bold text-gray-700 text-wrap">
                    {uploadedFile.name}
                  </h4>
                  {uploadCompleted ? (
                    <p className="text-green-500 flex items-center gap-1">
                      <CheckCircleOutlined /> Completed
                    </p>
                  ) : (
                    <p className="text-gray-600">
                      {Math.round(uploadedFile.size / 1024)} KB
                    </p>
                  )}
                </div>
              </div>
              <Button
                type="text"
                icon={<DeleteOutlined />}
                danger
                onClick={handleDelete}
              />
            </div>
            {!uploadCompleted && (
              <Progress
                percent={progress}
                size="small"
                status={progress === 100 ? "success" : "active"}
                className="w-full"
              />
            )}
          </div>
        )}

        <Button
          type="primary"
          disabled={!uploadedFile || !uploadCompleted}
          className="mt-4"
          onClick={handleContinue}
        >
          Continue
        </Button>
      </div>
    </>
  );
};

export default FileUpload;
