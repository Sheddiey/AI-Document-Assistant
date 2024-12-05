import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import Suggestions from "../components/Suggestion";
import * as openai from "openai";
import { message } from "antd";
import { saveAs } from "file-saver";

jest.mock("openai", () => ({
  OpenAI: jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn(),
      },
    },
  })),
}));

jest.mock("file-saver", () => ({
  saveAs: jest.fn(),
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

const mockStore = configureStore([]);

describe("Suggestions Component", () => {
  let store;

  beforeEach(() => {
    store = mockStore({
      fileUpload: { fileContent: "Original text.", name: "test-file.txt" },
    });
    jest.clearAllMocks();
  });

  it("renders the header and no suggestions by default", () => {
    render(
      <Provider store={store}>
        <Suggestions />
      </Provider>
    );

    expect(screen.getByText("Suggested Improvements")).toBeInTheDocument();
    expect(screen.getByText("No suggestions available.")).toBeInTheDocument();
  });

  it("shows a warning if no file content is provided", async () => {
    store = mockStore({ fileUpload: { fileContent: "", name: "" } });

    render(
      <Provider store={store}>
        <Suggestions />
      </Provider>
    );

    await waitFor(() =>
      expect(message.warning).toHaveBeenCalledWith(
        "Please upload a valid file for analysis."
      )
    );
  });

  it("generates suggestions when file content is provided", async () => {
    openai.OpenAI.prototype.chat.completions.create.mockResolvedValue({
      choices: [{ message: { content: "Improved text." } }],
    });

    render(
      <Provider store={store}>
        <Suggestions />
      </Provider>
    );

    const suggestion = await screen.findByText("Improved text.");
    expect(suggestion).toBeInTheDocument();
  });

  it("saves updated content as a TXT file", async () => {
    render(
      <Provider store={store}>
        <Suggestions />
      </Provider>
    );

    const saveButton = await screen.findByText("Save as TXT");
    fireEvent.click(saveButton);

    await waitFor(() =>
      expect(saveAs).toHaveBeenCalledWith(
        expect.any(Blob),
        "test-file-updated.txt"
      )
    );
    expect(message.success).toHaveBeenCalledWith("File saved as TXT!");
  });

  it("handles rejecting suggestions", async () => {
    render(
      <Provider store={store}>
        <Suggestions />
      </Provider>
    );

    const rejectButton = await screen.findByText("Reject");
    fireEvent.click(rejectButton);

    expect(
      await screen.findByText("Thank you for reviewing the suggestions!")
    ).toBeInTheDocument();
    expect(message.info).toHaveBeenCalledWith(
      "Suggestions rejected. Thank you!"
    );
  });
});
