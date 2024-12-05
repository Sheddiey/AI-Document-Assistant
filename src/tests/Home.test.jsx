import React from "react";
import { render, screen } from "@testing-library/react";
import HomePage from "../pages/Home";

// Mock the FileUpload component
jest.mock("../components/Upload", () => () => (
  <div>Mocked FileUpload Component</div>
));

describe("HomePage Component", () => {
  it("renders the homepage with the correct structure", () => {
    render(<HomePage />);

    // Check for main container
    const mainContainer = screen.getByRole("main");
    expect(mainContainer).toBeInTheDocument();
    expect(mainContainer).toHaveClass(
      "flex flex-col items-center justify-center bg-[#dfe0e2] h-screen"
    );

    // Check for header text
    const headerText = screen.getByText("AI Document Assistant");
    expect(headerText).toBeInTheDocument();
    expect(headerText).toHaveClass(
      "font-semibold text-blue-800 text-center text-3xl mb-5"
    );

    // Check for file upload component
    const uploadComponent = screen.getByText("Mocked FileUpload Component");
    expect(uploadComponent).toBeInTheDocument();
  });
});
