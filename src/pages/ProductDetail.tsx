import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useProduct } from "@/hooks/useProducts";
import { useCartStore } from "@/lib/cartStore";
import type { ProductVariant } from "@/lib/types";
import { formatPrice, getVariantPrice } from "@/lib/utils";
import Layout from "@/components/Layout";
import ProductImage from "@/components/ProductImage";

const ProductDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: product, isLoading, isError } = useProduct(slug);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((s) => s.addItem);

  // Set initial variant when product loads
  const variants = Array.isArray(product?.variants) ? product.variants.filter((v): v is ProductVariant => typeof v !== "string") : [];
  const activeVariant = selectedVariant || variants[0] || null;

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-12">
          <div className="grid gap-10 md:grid-cols-2">
            <div className="space-y-3">
              <div className="aspect-square animate-pulse rounded-lg bg-secondary" />
              <div className="flex gap-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 w-16 animate-pulse rounded-md bg-secondary" />
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <div className="h-4 w-24 animate-pulse rounded bg-secondary" />
              <div className="h-8 w-64 animate-pulse rounded bg-secondary" />
              <div className="h-6 w-20 animate-pulse rounded bg-secondary" />
              <div className="h-24 w-full animate-pulse rounded bg-secondary" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (isError || !product) {
    return (
      <Layout>
        <div className="container flex flex-col items-center justify-center py-20 text-center">
          <h1 className="font-display text-2xl">Product Not Found</h1>
          <p className="mt-2 text-muted-foreground">The product you're looking for doesn't exist.</p>
          <Link to="/" className="mt-6 text-sm text-primary hover:underline">← Back to shop</Link>
        </div>
      </Layout>
    );
  }

  const handleAddToCart = () => {
    if (activeVariant) {
      addItem(product, activeVariant, quantity);
    }
  };

  return (
    <Layout>
      <div className="container py-8 md:py-12">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-muted-foreground" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
          <span className="mx-2">/</span>
          <Link to={`/?category=${product.category.slug}`} className="hover:text-foreground transition-colors capitalize">
            {product.category.name}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">{product.title}</span>
        </nav>

        <div className="grid gap-8 md:grid-cols-2 md:gap-12">
          {/* Image gallery */}
          <div className="space-y-3">
            <ProductImage
              src={product.images[selectedImage] || product.images[0] || ""}
              alt={product.title}
              className="aspect-square rounded-lg"
            />
            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border-2 transition-colors ${
                      selectedImage === idx ? "border-primary" : "border-transparent hover:border-border"
                    }`}
                  >
                    <img src={img} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              {product.category.name}
            </p>
            <h1 className="mt-2 font-display text-3xl font-semibold md:text-4xl">
              {product.title}
            </h1>
            {activeVariant && (
              <p className="mt-3 text-xl font-body font-medium text-foreground">
                {formatPrice(getVariantPrice(activeVariant))}
              </p>
            )}

            <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
              {product.description}
            </p>

            {/* Variants */}
            {variants.length > 1 && (
              <div className="mt-8">
                <p className="text-sm font-medium mb-3">Variant</p>
                <div className="flex flex-wrap gap-2">
                  {variants.map((v) => (
                    <button
                      key={v._id}
                      onClick={() => setSelectedVariant(v)}
                      className={`rounded-lg border px-4 py-2 text-sm transition-colors ${
                        activeVariant?._id === v._id
                          ? "border-primary bg-primary/10 text-foreground"
                          : "border-border text-muted-foreground hover:border-foreground"
                      }`}
                    >
                      {v.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mt-6">
              <p className="text-sm font-medium mb-3">Quantity</p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="rounded-lg border px-3 py-1.5 text-sm hover:bg-secondary transition-colors"
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="w-8 text-center text-sm">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="rounded-lg border px-3 py-1.5 text-sm hover:bg-secondary transition-colors"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to cart */}
            <button
              onClick={handleAddToCart}
              disabled={!activeVariant || (activeVariant.stock !== undefined && activeVariant.stock === 0)}
              className="mt-8 w-full rounded-lg bg-primary py-3.5 text-sm font-medium text-primary-foreground transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {activeVariant?.stock === 0 ? "Out of Stock" : "Add to Bag"}
            </button>

            {activeVariant && activeVariant.stock !== undefined && activeVariant.stock <= 5 && activeVariant.stock > 0 && (
              <p className="mt-2 text-xs text-primary text-center">
                Only {activeVariant.stock} left in stock
              </p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProductDetail;
