import React from "react";
import { render, screen, cleanup } from "@testing-library/react";
import { Provider } from "react-redux";
import createTestStore from "./TestingStore";
import PDFViewer from "../components/PDFViewer";

beforeAll(() => {
  global.URL.createObjectURL = jest.fn(() => "mocked-object-url");
  global.URL.revokeObjectURL = jest.fn();
});

afterEach(() => {
  cleanup();
  jest.clearAllMocks();
});

describe("PDFViewer Component", () => {
  let store;

  beforeEach(() => {
    store = createTestStore({
      fileUpload: { rawFile: null },
    });
  });


  it("renders the PDF viewer when a valid file is uploaded", () => {
    const mockFile = new Blob(["Mock PDF Content"], {
      type: "application/pdf",
    });
    store = createTestStore({
      fileUpload: { rawFile: mockFile },
    });

    render(
      <Provider store={store}>
        <PDFViewer />
      </Provider>
    );

    // Check that the Viewer component renders and URL.createObjectURL is called
    expect(screen.getByTestId("viewer-container")).toBeInTheDocument();
    expect(global.URL.createObjectURL).toHaveBeenCalledWith(mockFile);
  });

  it("cleans up the object URL when unmounted", () => {
    const mockFile = new Blob(["Mock PDF Content"], {
      type: "application/pdf",
    });
    store = createTestStore({
      fileUpload: { rawFile: mockFile },
    });

    const { unmount } = render(
      <Provider store={store}>
        <PDFViewer />
      </Provider>
    );

    unmount();

    // Verify that URL.revokeObjectURL is called with the correct object URL
    expect(global.URL.revokeObjectURL).toHaveBeenCalledWith(
      "mocked-object-url"
    );
  });
});
