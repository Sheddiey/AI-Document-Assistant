import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Viewer, Worker } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";

const PDFViewer = () => {
  const { rawFile } = useSelector((state) => state.fileUpload);
  const [pdfUrl, setPdfUrl] = useState(null);
  const newPlugin = defaultLayoutPlugin();

  useEffect(() => {
    // Create an object URL when the fileContent (Blob) is available
    if (rawFile instanceof Blob) {
      const url = URL.createObjectURL(rawFile);
      setPdfUrl(url);

      // Clean up the URL object when the component unmounts or file changes
      return () => URL.revokeObjectURL(url);
    }
  }, [rawFile]);

  if (!rawFile) {
    return <p>No PDF document uploaded to view.</p>;
  }

  return (
    <div data-testid="viewer-container" className="h-[600px]">
      <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
        {pdfUrl && <Viewer  fileUrl={pdfUrl} plugins={[newPlugin]} />}
      </Worker>
    </div>
  );
};

export default PDFViewer;
