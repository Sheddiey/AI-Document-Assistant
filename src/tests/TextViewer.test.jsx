import React from "react";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import createTestStore from "./TestingStore";
import TextViewer from "../components/TextViewer";

describe("TextViewer", () => {
  beforeAll(() => {
    // Mock the FileReader API
    global.FileReader = class {
      constructor() {
        this.onload = null;
        this.onerror = null;
      }
      readAsText() {
        if (this.onload) {
          this.onload({ target: { result: "Hello, world!" } });
        }
      }
    };
  });

  it("displays a message when no file is uploaded", () => {
    const store = createTestStore({
      fileUpload: { rawFile: null, fileContent: "", name: "" },
    });

    render(
      <Provider store={store}>
        <TextViewer />
      </Provider>
    );

    expect(
      screen.getByText(/No text document uploaded to view./)
    ).toBeInTheDocument();
  });

  it("displays file content when a valid file is uploaded", () => {
    const store = createTestStore({
      fileUpload: {
        rawFile: new Blob(["Hello, world!"], { type: "text/plain" }),
        fileContent: "",
        name: "",
      },
    });

    render(
      <Provider store={store}>
        <TextViewer />
      </Provider>
    );

    expect(screen.getByText(/Hello, world!/)).toBeInTheDocument();
  });
});
