import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import App from "./App";

vi.mock("./api/products", () => ({
  getProducts: async () => ({
    products: [
      {
        id: "p_1",
        slug: "tshirt-tour-2026",
        title: "T-Shirt Tour 2026",
        description: null,
        images: [],
        price: { amount: 2500, currency: "EUR" },
        inStock: true,
      },
    ],
  }),
  getProductBySlug: async () => ({
    product: {
      id: "p_1",
      slug: "tshirt-tour-2026",
      title: "T-Shirt Tour 2026",
      description: null,
      images: [],
      price: { amount: 2500, currency: "EUR" },
      inStock: true,
    },
  }),
}));

test("renders shop page", async () => {
  render(<App />);
  expect(await screen.findByRole("heading", { name: /shop/i })).toBeInTheDocument();
  expect(await screen.findByText(/t-shirt tour 2026/i)).toBeInTheDocument();
});
