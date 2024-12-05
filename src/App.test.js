import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "./App";

test("renders app routes", () => {
  render(
    <MemoryRouter initialEntries={["/"]}>
      <App />
    </MemoryRouter>
  );

  // Check if the home page content is rendered
  expect(screen.getByText(/AI Document Assistant/i)).toBeInTheDocument();
});
