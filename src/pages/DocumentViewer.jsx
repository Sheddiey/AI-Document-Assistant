import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { pdfjs } from "react-pdf";
import PDFViewer from "../components/PDFViewer";
import DocxViewer from "../components/DocxViewer";
import TextViewer from "../components/TextViewer";
import Suggestions from "../components/Suggestion";

const DocumentViewer = () => {
  const { fileType } = useSelector((state) => state.fileUpload);

  useEffect(() => {
    pdfjs.GlobalWorkerOptions.workerSrc =
      "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.worker.min.js";
  }, []);

  const renderDocument = () => {
    switch (fileType.toLowerCase() || "") {
      case "pdf":
        return <PDFViewer />;
      case "docx":
        return <DocxViewer />;
      case "txt":
        return <TextViewer />;

      default:
        return <p>Unsupported file format: {fileType}</p>;
    }
  };

  return (
    <div className="bg-[#dfe0e2]">
      <div className="min-h-screen w-[95%] pb-10 mx-auto ">
        <div className="grid md:grid-cols-2 grid-cols-1 gap-5">
          <div className="">
            <h2 className="font-semibold text-3xl text-center p-4 text-blue-800">
              Original Document
            </h2>
            {renderDocument()}
          </div>
          <div>
            <h2 className="font-semibold text-3xl text-center p-4 text-blue-800">
              Improved Document
            </h2>
            <div className="p- border border-gray-300 rounded-md shadow-lg">
              <Suggestions />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentViewer;
