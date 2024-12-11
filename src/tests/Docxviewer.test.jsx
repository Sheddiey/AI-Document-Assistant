import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import createTestStore from "./TestingStore";
import DocxViewer from "../components/DocxViewer";
import mammoth from "mammoth";

jest.mock("mammoth", () => ({
  convertToHtml: jest.fn(),
}));

describe("DocxViewer Component", () => {
  let store;

  beforeEach(() => {
    // Mock Blob.arrayBuffer method for DOCX file processing
    Blob.prototype.arrayBuffer = jest
      .fn()
      .mockResolvedValue(new ArrayBuffer(8));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders fallback text when no file is uploaded", () => {
    store = createTestStore({
      fileUpload: { rawFile: null },
    });

    render(
      <Provider store={store}>
        <DocxViewer />
      </Provider>
    );

    expect(
      screen.getByText("No DOCX document uploaded to view.")
    ).toBeInTheDocument();
  });

  it("renders converted content for a valid DOCX file", async () => {
    const mockRawFile = new Blob(["Sample DOCX content"], {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });

    store = createTestStore({
      fileUpload: { rawFile: mockRawFile },
    });

    mammoth.convertToHtml.mockResolvedValue({
      value: "<p>Converted content</p>",
    });

    render(
      <Provider store={store}>
        <DocxViewer />
      </Provider>
    );

    // Verify that `mammoth.convertToHtml` is called
    await waitFor(() =>
      expect(mammoth.convertToHtml).toHaveBeenCalledWith({
        arrayBuffer: expect.any(ArrayBuffer),
      })
    );

    // Check that the converted content is rendered
    const content = await screen.findByText("Converted content");
    expect(content).toBeInTheDocument();
  });

  it("logs errors gracefully when conversion fails", async () => {
    const mockRawFile = new Blob(["Sample DOCX content"], {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });

    store = createTestStore({
      fileUpload: { rawFile: mockRawFile },
    });

    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    mammoth.convertToHtml.mockRejectedValue(new Error("Conversion failed"));

    render(
      <Provider store={store}>
        <DocxViewer />
      </Provider>
    );

    // Verify that the error is logged
    await waitFor(() =>
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error rendering DOCX with Mammoth:",
        expect.any(Error)
      )
    );

    consoleErrorSpy.mockRestore();
  });
});
