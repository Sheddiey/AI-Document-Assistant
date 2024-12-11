import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import FileUpload from "../components/Upload";
import { message } from "antd";
import { BrowserRouter } from "react-router-dom";
import createTestStore from "../utils/createTestStore";
import {
  extractTextFromPDF,
  extractTextFromWord,
} from "../utils";

jest.mock("../utils", () => ({
  extractTextFromPDF: jest.fn(),
  extractTextFromTxt: jest.fn(),
  extractTextFromWord: jest.fn(),
}));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
}));

jest.mock("antd", () => {
  const original = jest.requireActual("antd");
  return {
    ...original,
    message: {
      ...original.message,
      success: jest.fn(),
      error: jest.fn(),
      warning: jest.fn(),
      info: jest.fn(),
    },
  };
});

describe("FileUpload Component", () => {
  let store;

  beforeEach(() => {
    store = createTestStore({
      fileUpload: {
        uploadStatus: "idle",
        error: null,
        uploadedFile: null,
      },
    });

    jest.clearAllMocks();
  });

  test("renders drag-and-drop area and file upload hints", () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <FileUpload />
        </BrowserRouter>
      </Provider>
    );

    expect(
      screen.getByText(/Drag and drop your document here/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Accepted formats: .txt, .docx, .pdf/i)
    ).toBeInTheDocument();
  });

  test("displays a warning for unsupported file formats", async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <FileUpload />
        </BrowserRouter>
      </Provider>
    );

    const file = new File(["dummy content"], "example.xlsx", {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const input = screen.getByRole("button", { name: /Upload/i });
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() =>
      expect(message.warning).toHaveBeenCalledWith(
        "Unsupported file format: .xlsx"
      )
    );
  });

  test("uploads and processes a supported file (PDF)", async () => {
    extractTextFromPDF.mockResolvedValue("Extracted PDF content");

    render(
      <Provider store={store}>
        <BrowserRouter>
          <FileUpload />
        </BrowserRouter>
      </Provider>
    );

    const file = new File(["dummy content"], "example.pdf", {
      type: "application/pdf",
    });

    const input = screen.getByRole("button", { name: /Upload/i });
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => expect(extractTextFromPDF).toHaveBeenCalledWith(file));
    expect(message.success).toHaveBeenCalledWith(
      'File "example.pdf" uploaded successfully!'
    );
  });

  test("handles errors during file processing", async () => {
    extractTextFromWord.mockRejectedValue(new Error("Processing error"));

    render(
      <Provider store={store}>
        <BrowserRouter>
          <FileUpload />
        </BrowserRouter>
      </Provider>
    );

    const file = new File(["dummy content"], "example.docx", {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });

    const input = screen.getByRole("button", { name: /Upload/i });
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() =>
      expect(message.error).toHaveBeenCalledWith("Error processing file: Processing error")
    );
  });

  test("removes the uploaded file when delete button is clicked", async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <FileUpload />
        </BrowserRouter>
      </Provider>
    );

    const file = new File(["dummy content"], "example.txt", {
      type: "text/plain",
    });

    const input = screen.getByRole("button", { name: /Upload/i });
    fireEvent.change(input, { target: { files: [file] } });

    await screen.findByText("example.txt");

    const deleteButton = screen.getByRole("button", { name: /delete/i });
    fireEvent.click(deleteButton);

    expect(screen.queryByText("example.txt")).not.toBeInTheDocument();
    expect(message.info).toHaveBeenCalledWith("File removed successfully.");
  });

  test("navigates to document viewer when 'Continue' is clicked", async () => {
    const mockNavigate = jest.fn();
    jest.spyOn(require("react-router-dom"), "useNavigate").mockReturnValue(mockNavigate);

    render(
      <Provider store={store}>
        <BrowserRouter>
          <FileUpload />
        </BrowserRouter>
      </Provider>
    );

    const file = new File(["dummy content"], "example.pdf", {
      type: "application/pdf",
    });

    const input = screen.getByRole("button", { name: /Upload/i });
    fireEvent.change(input, { target: { files: [file] } });

    await screen.findByText(/Continue/i);

    const continueButton = screen.getByText(/Continue/i);
    fireEvent.click(continueButton);

    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith("/document-viewer")
    );
  });
});
