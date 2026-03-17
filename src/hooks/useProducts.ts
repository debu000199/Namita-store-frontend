import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

// staleTime/gcTime defaults come from QueryClient (App.tsx).
// Override only when a query needs different behaviour.

export function useProducts(params?: { q?: string; category?: string }) {
  return useQuery({
    queryKey: ["products", params?.q ?? null, params?.category ?? null],
    queryFn: () => api.getProducts(params),
    // uses global default staleTime (2 min)
  });
}

export function useProduct(slug: string | undefined) {
  return useQuery({
    queryKey: ["product", slug],
    queryFn: () => api.getProduct(slug!),
    enabled: !!slug,
    // uses global default staleTime (2 min)
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => api.getCategories(),
    staleTime: 15 * 60_000, // categories change rarely — stay fresh for 15 min
    gcTime: 30 * 60_000,    // keep in memory for 30 min
  });
}
