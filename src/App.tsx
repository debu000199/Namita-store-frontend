import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { useAuthStore } from "@/lib/authStore";
import Index from "./pages/Index";
import ProductDetail from "./pages/ProductDetail";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Checkout from "./pages/Checkout";
import Account from "./pages/Account";
import Admin from "./pages/Admin";
import AdminProductEdit from "./pages/AdminProductEdit";
import AdminOrderDetail from "./pages/AdminOrderDetail";
import NotFound from "./pages/NotFound";
import { Analytics } from "@vercel/analytics/react";

// In-memory cache: data stays fresh for 2 min, kept in memory for 10 min after last use.
// gcTime must be > staleTime so cached data is still available while revalidating.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60_000,   // 2 min — no refetch if data is younger than this
      gcTime: 10 * 60_000,     // 10 min — evict from memory if unused for this long
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// localStorage persistence — survives page reload & browser close.
// Only public, non-sensitive queries are persisted (products, categories).
const localStoragePersister = createSyncStoragePersister({
  storage: window.localStorage,
  key: "debu-cosmetics-rq-cache",
  throttleTime: 1000, // write to storage at most once per second
});

const AuthInit = ({ children }: { children: React.ReactNode }) => {
  const checkAuth = useAuthStore((s) => s.checkAuth);
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);
  return <>{children}</>;
};

// Only cache public, non-sensitive queries in localStorage.
// Auth, orders, and admin data must never be serialised to localStorage.
const PUBLIC_CACHE_KEYS = new Set(["products", "product", "categories"]);

const App = () => (
  <PersistQueryClientProvider
    client={queryClient}
    persistOptions={{
      persister: localStoragePersister,
      maxAge: 24 * 60 * 60_000, // discard stale cache entries older than 24 h
      dehydrateOptions: {
        shouldDehydrateQuery: (query) =>
          PUBLIC_CACHE_KEYS.has(query.queryKey[0] as string),
      },
    }}
  >
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthInit>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/product/:slug" element={<ProductDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/account" element={<Account />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/products/new" element={<AdminProductEdit />} />
            <Route path="/admin/products/:id/edit" element={<AdminProductEdit />} />
            <Route path="/admin/orders/:orderId" element={<AdminOrderDetail />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthInit>
      </BrowserRouter>
      <Analytics />
    </TooltipProvider>
  </PersistQueryClientProvider>
);

export default App;
