import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { MemoryRouter } from "react-router-dom";
import FileUpload from "../components/Upload";
import * as utils from "../utils";
import { message } from "antd";

jest.mock("../utils", () => ({
  extractTextFromPDF: jest.fn(),
  extractTextFromTxt: jest.fn(),
  extractTextFromWord: jest.fn(),
}));

jest.mock("antd", () => {
  const originalModule = jest.requireActual("antd");
  return {
    ...originalModule,
    message: {
      success: jest.fn(),
      error: jest.fn(),
      warning: jest.fn(),
      info: jest.fn(),
    },
  };
});

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
}));

const mockStore = configureStore([]);
const mockNavigate = jest.fn();

describe("FileUpload Component", () => {
  let store;

  beforeEach(() => {
    store = mockStore({});
    jest.clearAllMocks();
  });

  it("renders the component with the correct UI", () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <FileUpload />
        </MemoryRouter>
      </Provider>
    );

    expect(
      screen.getByText("Drag and drop your document here")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Accepted formats: .txt, .docx, .pdf")
    ).toBeInTheDocument();
  });

  it("shows a warning for unsupported file formats", () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <FileUpload />
        </MemoryRouter>
      </Provider>
    );

    const file = new File(["dummy content"], "file.csv", { type: "text/csv" });

    const input = screen.getByRole("button", {
      name: /drag and drop your document here/i,
    });
    fireEvent.change(input, { target: { files: [file] } });

    expect(message.warning).toHaveBeenCalledWith(
      "Unsupported file format: .csv"
    );
  });

  it("uploads and processes a valid PDF file", async () => {
    utils.extractTextFromPDF.mockResolvedValue("Extracted PDF content");

    render(
      <Provider store={store}>
        <MemoryRouter>
          <FileUpload />
        </MemoryRouter>
      </Provider>
    );

    const file = new File(["dummy content"], "file.pdf", {
      type: "application/pdf",
    });

    const input = screen.getByRole("button", {
      name: /drag and drop your document here/i,
    });
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() =>
      expect(utils.extractTextFromPDF).toHaveBeenCalledWith(file)
    );

    expect(message.success).toHaveBeenCalledWith(
      'File "file.pdf" uploaded successfully!'
    );
    expect(screen.getByText("Completed")).toBeInTheDocument();
  });

  it("removes the uploaded file on delete", () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <FileUpload />
        </MemoryRouter>
      </Provider>
    );

    const file = new File(["dummy content"], "file.txt", {
      type: "text/plain",
    });

    const input = screen.getByRole("button", {
      name: /drag and drop your document here/i,
    });
    fireEvent.change(input, { target: { files: [file] } });

    const deleteButton = screen.getByRole("button", { name: /delete/i });
    fireEvent.click(deleteButton);

    expect(message.info).toHaveBeenCalledWith("File removed successfully.");
    expect(screen.queryByText("file.txt")).not.toBeInTheDocument();
  });

  it("navigates to the next page when 'Continue' is clicked", async () => {
    utils.extractTextFromPDF.mockResolvedValue("Extracted PDF content");

    render(
      <Provider store={store}>
        <MemoryRouter>
          <FileUpload />
        </MemoryRouter>
      </Provider>
    );

    const file = new File(["dummy content"], "file.pdf", {
      type: "application/pdf",
    });

    const input = screen.getByRole("button", {
      name: /drag and drop your document here/i,
    });
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() =>
      expect(utils.extractTextFromPDF).toHaveBeenCalledWith(file)
    );

    const continueButton = screen.getByRole("button", { name: /continue/i });
    fireEvent.click(continueButton);

    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith("/document-viewer")
    );
  });
});
