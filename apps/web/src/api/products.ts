import type { Product } from "@acme/shared";
import { httpGet } from "./http";

export type ApiProduct = Product & {
  slug: string;
  description: string | null;
  images: string[];
};

export type GetProductsResponse = {
  products: ApiProduct[];
};

export type GetProductResponse = {
  product: ApiProduct;
};

export function getProducts() {
  return httpGet<GetProductsResponse>("/api/products");
}

export function getProductBySlug(slug: string) {
  return httpGet<GetProductResponse>(`/api/products/${encodeURIComponent(slug)}`);
}
