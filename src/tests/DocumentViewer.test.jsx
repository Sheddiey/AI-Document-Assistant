import React from "react";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import DocumentViewer from "../pages/DocumentViewer";
import { pdfjs } from "react-pdf";

jest.mock("../components/PDFViewer", () => () => <div>PDF Viewer</div>);
jest.mock("../components/DocxViewer", () => () => <div>DOCX Viewer</div>);
jest.mock("../components/TextViewer", () => () => <div>Text Viewer</div>);
jest.mock("../components/Suggestion", () => () => <div>Suggestions Component</div>);

const mockStore = configureStore([]);

describe("DocumentViewer Component", () => {
  let store;

  beforeEach(() => {
    store = mockStore({
      fileUpload: { fileType: "" }, // Default file type
    });

    jest.spyOn(pdfjs.GlobalWorkerOptions, "workerSrc", "set").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders the component with default UI", () => {
    render(
      <Provider store={store}>
        <DocumentViewer />
      </Provider>
    );

    expect(
      screen.getByText("Original Document")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Improved Document")
    ).toBeInTheDocument();
    expect(screen.getByText("Suggestions Component")).toBeInTheDocument();
  });

  it("renders the PDFViewer component for PDF files", () => {
    store = mockStore({
      fileUpload: { fileType: "pdf" },
    });

    render(
      <Provider store={store}>
        <DocumentViewer />
      </Provider>
    );

    expect(screen.getByText("PDF Viewer")).toBeInTheDocument();
  });

  it("renders the DocxViewer component for DOCX files", () => {
    store = mockStore({
      fileUpload: { fileType: "docx" },
    });

    render(
      <Provider store={store}>
        <DocumentViewer />
      </Provider>
    );

    expect(screen.getByText("DOCX Viewer")).toBeInTheDocument();
  });

  it("renders the TextViewer component for TXT files", () => {
    store = mockStore({
      fileUpload: { fileType: "txt" },
    });

    render(
      <Provider store={store}>
        <DocumentViewer />
      </Provider>
    );

    expect(screen.getByText("Text Viewer")).toBeInTheDocument();
  });

  it("renders an error message for unsupported file types", () => {
    store = mockStore({
      fileUpload: { fileType: "unsupported" },
    });

    render(
      <Provider store={store}>
        <DocumentViewer />
      </Provider>
    );

    expect(
      screen.getByText("Unsupported file format: unsupported")
    ).toBeInTheDocument();
  });

  it("sets the PDF.js worker source in useEffect", () => {
    render(
      <Provider store={store}>
        <DocumentViewer />
      </Provider>
    );

    expect(pdfjs.GlobalWorkerOptions.workerSrc).toBe(
      "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.worker.min.js"
    );
  });
});
