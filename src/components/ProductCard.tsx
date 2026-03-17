import { Link } from "react-router-dom";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import ProductImage from "./ProductImage";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  // Handle variants being either full objects or just string IDs from MongoDB
  const hasFullVariants = product.variants.length > 0 && typeof product.variants[0] !== "string";
  const minPrice = hasFullVariants
    ? Math.min(...(product.variants as { price: number }[]).map((v) => v.price))
    : null;

  // Handle category being either a full object or just a string ID
  const categoryName = typeof product.category === "string" ? "" : product.category?.name;

  return (
    <Link
      to={`/product/${product.slug}`}
      className="group block animate-fade-in-up"
    >
      <div className="overflow-hidden rounded-lg bg-card">
        <ProductImage
          src={product.images[0] || ""}
          alt={product.title}
          className="aspect-[3/4] transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="mt-3 space-y-1">
        {categoryName && (
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-body">
            {categoryName}
          </p>
        )}
        <h3 className="font-display text-lg font-medium text-foreground group-hover:text-primary transition-colors">
          {product.title}
        </h3>
        {minPrice !== null && (
          <p className="text-sm font-body text-muted-foreground">
            {hasFullVariants && product.variants.length > 1 ? "From " : ""}
            {formatPrice(minPrice)}
          </p>
        )}
      </div>
    </Link>
  );
};

export default ProductCard;
