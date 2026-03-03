import type { Product } from "@acme/shared";
import { httpGet } from "./http";

export type GetProductsResponse = {
  products: Product[];
};

export function getProducts() {
  return httpGet<GetProductsResponse>("/api/products");
}
