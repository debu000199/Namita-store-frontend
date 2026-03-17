import type { Product } from "@/lib/types";
import ProductCard from "./ProductCard";

interface ProductGridProps {
  products: Product[];
  loading?: boolean;
}

const ProductGridSkeleton = () => (
  <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
    {Array.from({ length: 8 }).map((_, i) => (
      <div key={i} className="animate-pulse">
        <div className="aspect-[3/4] rounded-lg bg-secondary" />
        <div className="mt-3 space-y-2">
          <div className="h-3 w-16 rounded bg-secondary" />
          <div className="h-5 w-32 rounded bg-secondary" />
          <div className="h-4 w-20 rounded bg-secondary" />
        </div>
      </div>
    ))}
  </div>
);

const ProductGrid = ({ products, loading }: ProductGridProps) => {
  if (loading) return <ProductGridSkeleton />;

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="font-display text-xl text-muted-foreground">No products found</p>
        <p className="mt-2 text-sm text-muted-foreground">Try a different search or category.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
};

export default ProductGrid;
