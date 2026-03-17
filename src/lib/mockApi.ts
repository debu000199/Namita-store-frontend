import type { Product, Category, AuthUser } from "./types";

const categories: Category[] = [
  { _id: "1", name: "Skincare", slug: "skincare" },
  { _id: "2", name: "Makeup", slug: "makeup" },
  { _id: "3", name: "Fragrance", slug: "fragrance" },
  { _id: "4", name: "Haircare", slug: "haircare" },
];

const products: Product[] = [
  {
    _id: "1", title: "Velvet Rose Serum", slug: "velvet-rose-serum",
    description: "A luxurious hydrating serum infused with rosehip oil and hyaluronic acid. This lightweight formula absorbs quickly, leaving your skin plump, dewy, and radiant.",
    category: categories[0],
    images: ["https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&h=600&fit=crop"],
    variants: [
      { _id: "1a", name: "30ml", price: 4800, stock: 25 },
      { _id: "1b", name: "50ml", price: 7200, stock: 15 },
    ],
  },
  {
    _id: "2", title: "Petal Soft Lipstick", slug: "petal-soft-lipstick",
    description: "A creamy matte lipstick with buildable coverage and long-lasting wear. Enriched with vitamin E for all-day comfort.",
    category: categories[1],
    images: ["https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600&h=600&fit=crop"],
    variants: [
      { _id: "2a", name: "Rose Nude", price: 2800, stock: 40 },
      { _id: "2b", name: "Berry Bliss", price: 2800, stock: 30 },
      { _id: "2c", name: "Coral Dream", price: 2800, stock: 20 },
    ],
  },
  {
    _id: "3", title: "Golden Hour Highlighter", slug: "golden-hour-highlighter",
    description: "A silky baked highlighter that gives a natural luminous glow. Finely milled for seamless blending.",
    category: categories[1],
    images: ["https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&h=600&fit=crop"],
    variants: [
      { _id: "3a", name: "Champagne", price: 3400, stock: 35 },
      { _id: "3b", name: "Rose Gold", price: 3400, stock: 28 },
    ],
  },
  {
    _id: "4", title: "Midnight Jasmine Eau de Parfum", slug: "midnight-jasmine-parfum",
    description: "An intoxicating fragrance blending jasmine, vanilla, and warm amber. A signature scent for evenings.",
    category: categories[2],
    images: ["https://images.unsplash.com/photo-1541643600914-78b084683601?w=600&h=600&fit=crop"],
    variants: [
      { _id: "4a", name: "30ml", price: 6500, stock: 18 },
      { _id: "4b", name: "50ml", price: 9500, stock: 12 },
    ],
  },
  {
    _id: "5", title: "Cloud Cream Moisturizer", slug: "cloud-cream-moisturizer",
    description: "An ultra-light gel-cream moisturizer that hydrates for 72 hours. Infused with ceramides and squalane.",
    category: categories[0],
    images: ["https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=600&h=600&fit=crop"],
    variants: [
      { _id: "5a", name: "50ml", price: 4200, stock: 30 },
    ],
  },
  {
    _id: "6", title: "Silk Repair Hair Mask", slug: "silk-repair-hair-mask",
    description: "An intensive hair treatment with argan oil and keratin to restore shine, softness, and strength.",
    category: categories[3],
    images: ["https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=600&h=600&fit=crop"],
    variants: [
      { _id: "6a", name: "200ml", price: 3200, stock: 22 },
      { _id: "6b", name: "400ml", price: 5400, stock: 14 },
    ],
  },
  {
    _id: "7", title: "Dewy Skin Tint", slug: "dewy-skin-tint",
    description: "A sheer, buildable skin tint with SPF 30 that evens out your complexion while letting your natural skin shine through.",
    category: categories[1],
    images: ["https://images.unsplash.com/photo-1631214540553-ff044a3ff1ea?w=600&h=600&fit=crop"],
    variants: [
      { _id: "7a", name: "Light", price: 3600, stock: 20 },
      { _id: "7b", name: "Medium", price: 3600, stock: 25 },
      { _id: "7c", name: "Deep", price: 3600, stock: 18 },
    ],
  },
  {
    _id: "8", title: "Blossom Body Oil", slug: "blossom-body-oil",
    description: "A fast-absorbing dry body oil with cherry blossom and jojoba. Leaves skin silky smooth with a delicate shimmer.",
    category: categories[0],
    images: ["https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600&h=600&fit=crop"],
    variants: [
      { _id: "8a", name: "100ml", price: 3800, stock: 26 },
    ],
  },
];

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

let mockUser: AuthUser | null = null;

export const mockApi = {
  getProducts: async (params?: { q?: string; category?: string; page?: number; limit?: number }) => {
    await delay(400);
    let filtered = [...products];
    if (params?.q) {
      const q = params.q.toLowerCase();
      filtered = filtered.filter((p) => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }
    if (params?.category) {
      filtered = filtered.filter((p) => typeof p.category !== "string" && p.category.slug === params.category);
    }
    return { products: filtered };
  },

  getProduct: async (slug: string) => {
    await delay(300);
    const product = products.find((p) => p.slug === slug);
    if (!product) throw new Error("Product not found");
    return product;
  },

  getCategories: async () => {
    await delay(200);
    return { categories };
  },

  login: async (email: string, _password: string) => {
    await delay(500);
    mockUser = { _id: "mock-admin", email, name: email.split("@")[0], isAdmin: true, orders: [] };
    return mockUser;
  },

  signup: async (email: string, _password: string, name: string) => {
    await delay(500);
    mockUser = { _id: "mock-user", email, name, isAdmin: false, orders: [] };
    return mockUser;
  },

  getMe: async () => {
    await delay(200);
    return mockUser;
  },

  logout: async () => {
    await delay(200);
    mockUser = null;
  },

  checkout: async (_items: { variantId: string; quantity: number }[], _customerEmail: string) => {
    await delay(800);
    return { clientSecret: "pi_mock_secret_" + Date.now(), orderId: "ORD-" + Math.random().toString(36).slice(2, 8).toUpperCase() };
  },

  // Admin
  adminGetProducts: async () => {
    await delay(300);
    return { products };
  },

  adminCreateProduct: async (data: Partial<Product>) => {
    await delay(400);
    const newProduct = { ...data, _id: String(products.length + 1) } as Product;
    products.push(newProduct);
    return newProduct;
  },

  adminUpdateProduct: async (_id: string, data: Partial<Product>) => {
    await delay(400);
    const idx = products.findIndex((p) => p._id === _id);
    if (idx === -1) throw new Error("Not found");
    products[idx] = { ...products[idx], ...data };
    return products[idx];
  },

  adminDeleteProduct: async (_id: string) => {
    await delay(300);
    const idx = products.findIndex((p) => p._id === _id);
    if (idx !== -1) products.splice(idx, 1);
    return { success: true };
  },
};
