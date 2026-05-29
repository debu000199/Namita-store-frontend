import { mockApi } from "./mockApi";
import type { Product } from "./types";

const USE_MOCK_API = false;
const API_BASE_URL = "https://namita-store-backend.vercel.app";

export const api = {
  getProducts: (params?: { q?: string; category?: string; page?: number; limit?: number }) => {
    if (USE_MOCK_API) return mockApi.getProducts(params);
    if (params?.category) {
      return fetch(`${API_BASE_URL}/api/categories/?category=${encodeURIComponent(params.category)}`).then((r) => r.json());
    }
    const query = new URLSearchParams();
    if (params?.q) query.set("q", params.q);
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    const qs = query.toString();
    return fetch(`${API_BASE_URL}/api/products${qs ? `?${qs}` : ""}`).then((r) => r.json());
  },

  getProduct: (slug: string) =>
    USE_MOCK_API ? mockApi.getProduct(slug) : fetch(`${API_BASE_URL}/api/products/${slug}`).then((r) => r.json()).then((data) => data.products || data),

  getCategories: () =>
    USE_MOCK_API ? mockApi.getCategories() : fetch(`${API_BASE_URL}/api/categories`).then((r) => r.json()),

  login: async (email: string, password: string) => {
    if (USE_MOCK_API) return mockApi.login(email, password);
    const r = await fetch(`${API_BASE_URL}/api/auth/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }), credentials: "include" });
    const data = await r.json();
    if (!r.ok) throw new Error(data.message || "Login failed");
    return data.user || data;
  },

  signup: async (email: string, password: string, name: string) => {
    if (USE_MOCK_API) return mockApi.signup(email, password, name);
    const r = await fetch(`${API_BASE_URL}/api/auth/signup`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password, name }), credentials: "include" });
    const data = await r.json();
    if (!r.ok) throw new Error(data.message || "Signup failed");
    return data.user || data;
  },

  getMe: async () => {
    if (USE_MOCK_API) return mockApi.getMe();
    const r = await fetch(`${API_BASE_URL}/api/auth/me`, { credentials: "include" });
    if (!r.ok) throw new Error("Not authenticated");
    const data = await r.json();
    return data.user || data;
  },

  logout: () =>
    USE_MOCK_API ? mockApi.logout() : fetch(`${API_BASE_URL}/api/auth/logout`, { method: "POST", credentials: "include" }).then((r) => r.json()),

  getOrders: async () => {
    const r = await fetch(`${API_BASE_URL}/api/orders`, { credentials: "include" });
    if (!r.ok) throw new Error("Failed to fetch orders");
    const data = await r.json();
    return data.orders || [];
  },

  checkout: (items: { variantId: string; quantity: number }[], customerEmail: string, shippingAddress?: Record<string, string | undefined>) =>
    USE_MOCK_API ? mockApi.checkout(items, customerEmail) : fetch(`${API_BASE_URL}/api/checkout`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items, customerEmail, shippingAddress }), credentials: "include" }).then((r) => r.json()),

  adminGetProducts: () =>
    USE_MOCK_API ? mockApi.adminGetProducts() : fetch(`${API_BASE_URL}/api/admin/products`, { credentials: "include" }).then((r) => r.json()),

  adminCreateProduct: (data: Partial<Product>) =>
    USE_MOCK_API ? mockApi.adminCreateProduct(data) : fetch(`${API_BASE_URL}/api/admin/products`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data), credentials: "include" }).then((r) => r.json()),

  adminUpdateProduct: (_id: string, data: Partial<Product>) =>
    USE_MOCK_API ? mockApi.adminUpdateProduct(_id, data) : fetch(`${API_BASE_URL}/api/admin/products/${_id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data), credentials: "include" }).then((r) => r.json()),

  adminDeleteProduct: (_id: string) =>
    USE_MOCK_API ? mockApi.adminDeleteProduct(_id) : fetch(`${API_BASE_URL}/api/admin/products/${_id}`, { method: "DELETE", credentials: "include" }).then((r) => r.json()),

  adminGetOrders: async () => {
    const r = await fetch(`${API_BASE_URL}/api/admin/orders`, { credentials: "include" });
    if (!r.ok) throw new Error("Failed to fetch orders");
    const data = await r.json();
    return data;
  },

  adminGetOrder: async (orderId: string) => {
    const r = await fetch(`${API_BASE_URL}/api/admin/orders/${orderId}`, { credentials: "include" });
    if (!r.ok) throw new Error("Failed to fetch order");
    const data = await r.json();
    return data.orders || data.order || data;
  },

  adminUpdateOrder: async (orderId: string, updates: Record<string, unknown>) => {
    const r = await fetch(`${API_BASE_URL}/api/admin/orders/${orderId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
      credentials: "include",
    });
    if (!r.ok) throw new Error("Failed to update order");
    return r.json();
  },
};
