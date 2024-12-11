import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "./App";

describe("App Routing", () => {
  test("renders HomePage component for the root path `/`", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByText(/AI Document Assistant/i)).toBeInTheDocument();
  });

  test("renders DocumentViewerPage component for the path `/document-viewer`", () => {
    render(
      <MemoryRouter initialEntries={["/document-viewer"]}>
        <App />
      </MemoryRouter>
    );

    // Check for static elements in the DocumentViewer
    expect(screen.getByText(/Original Document/i)).toBeInTheDocument();
  });

  test("renders 404 page for an unknown path", () => {
    render(
      <MemoryRouter initialEntries={["/unknown"]}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByText(/404 - Page Not Found/i)).toBeInTheDocument();
  });
});
