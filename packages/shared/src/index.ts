export type Money = {
  amount: number; // cents
  currency: "EUR" | "USD";
};

export type Product = {
  id: string;
  title: string;
  price: Money;
  inStock: boolean;
};
