import { apiFetch } from "./core/api-client";
import { demoDb, DEMO_MODE_ENABLED } from "@/lib/demo/mock-db";

export interface Product {
  id: string;
  name: string;
  barcode: string | null;
  category_id: string | null;
  category: { id: string; name: string } | null;
  cost_price: number;
  selling_price: number;
  stock: number;
  low_stock_alert: number;
  image_url: string | null;
}

export interface Category {
  id: string;
  name: string;
}

// ===== Products =====
export const ProductService = {
  getAll: () =>
    DEMO_MODE_ENABLED
      ? Promise.resolve(demoDb.getProducts())
      : apiFetch<Product[]>("/products"),

  create: (data: Omit<Product, "id" | "category">) =>
    DEMO_MODE_ENABLED
      ? Promise.resolve(demoDb.createProduct(data))
      : apiFetch<Product>("/products", {
          method: "POST",
          body: JSON.stringify(data),
        }),

  update: (id: string, data: Partial<Omit<Product, "category">>) =>
    DEMO_MODE_ENABLED
      ? Promise.resolve(demoDb.updateProduct(id, data))
      : apiFetch<Product>(`/products/${id}`, {
          method: "PATCH",
          body: JSON.stringify(data),
        }),

  delete: (id: string) =>
    DEMO_MODE_ENABLED
      ? Promise.resolve(demoDb.deleteProduct(id))
      : apiFetch<void>(`/products/${id}`, { method: "DELETE" }),
};

// ===== Categories =====
export const CategoryService = {
  getAll: () =>
    DEMO_MODE_ENABLED
      ? Promise.resolve(demoDb.getCategories())
      : apiFetch<Category[]>("/categories"),

  create: (data: { name: string }) =>
    DEMO_MODE_ENABLED
      ? Promise.resolve(demoDb.createCategory(data))
      : apiFetch<Category>("/categories", {
          method: "POST",
          body: JSON.stringify(data),
        }),

  update: (id: string, data: { name: string }) =>
    DEMO_MODE_ENABLED
      ? Promise.resolve(demoDb.updateCategory(id, data))
      : apiFetch<Category>(`/categories/${id}`, {
          method: "PATCH",
          body: JSON.stringify(data),
        }),

  delete: (id: string) =>
    DEMO_MODE_ENABLED
      ? Promise.resolve(demoDb.deleteCategory(id))
      : apiFetch<void>(`/categories/${id}`, { method: "DELETE" }),
};
