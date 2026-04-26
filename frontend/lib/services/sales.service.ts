import { apiFetch } from "./core/api-client";
import { demoDb, DEMO_MODE_ENABLED } from "@/lib/demo/mock-db";

export interface SaleItem {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface Sale {
  id: string;
  receipt_number: string;
  cashier_id: string | null;
  cashier_name: string | null;
  subtotal: number;
  discount: number;
  total: number;
  payment_method: string;
  status: string;
  note: string | null;
  created_at: string;
  items: SaleItem[];
}

export interface SalesSummary {
  todayRevenue: number;
  todayCount: number;
  totalRevenue: number;
  totalCount: number;
}

export interface CreateSaleDto {
  cashier_id?: string | null;
  cashier_name?: string;
  subtotal: number;
  discount: number;
  total: number;
  payment_method: string;
  note?: string;
  items: {
    product_id: string;
    product_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }[];
}

export const SalesService = {
  getAll: (params?: { from?: string; to?: string; status?: string }) => {
    if (DEMO_MODE_ENABLED) {
      return Promise.resolve(demoDb.getSales(params));
    }
    const searchParams = new URLSearchParams();
    if (params?.from) searchParams.set("from", params.from);
    if (params?.to) searchParams.set("to", params.to);
    if (params?.status && params.status !== "all")
      searchParams.set("status", params.status);
    const qs = searchParams.toString();
    return apiFetch<Sale[]>(`/sales${qs ? `?${qs}` : ""}`);
  },

  getById: (id: string) =>
    DEMO_MODE_ENABLED
      ? Promise.resolve(demoDb.getSaleById(id))
      : apiFetch<Sale>(`/sales/${id}`),

  getSummary: () =>
    DEMO_MODE_ENABLED
      ? Promise.resolve(demoDb.getSalesSummary())
      : apiFetch<SalesSummary>("/sales/summary"),

  create: (data: CreateSaleDto) =>
    DEMO_MODE_ENABLED
      ? Promise.resolve(demoDb.createSale(data))
      : apiFetch<Sale>("/sales", {
          method: "POST",
          body: JSON.stringify(data),
        }),

  cancel: (id: string) =>
    DEMO_MODE_ENABLED
      ? Promise.resolve(demoDb.cancelSale(id))
      : apiFetch<Sale>(`/sales/${id}/cancel`, { method: "PATCH" }),
};
