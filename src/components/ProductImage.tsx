import { useState } from "react";
import { cn } from "@/lib/utils";

interface ProductImageProps {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
}

const ProductImage = ({ src, alt, className, sizes = "(max-width: 768px) 100vw, 50vw" }: ProductImageProps) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div className={cn("relative overflow-hidden bg-secondary", className)}>
      {!loaded && !error && (
        <div className="absolute inset-0 animate-pulse bg-secondary" />
      )}
      {error ? (
        <div className="flex h-full w-full items-center justify-center bg-secondary">
          <span className="text-muted-foreground text-sm">Image unavailable</span>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          sizes={sizes}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          className={cn(
            "h-full w-full object-cover transition-opacity duration-500",
            loaded ? "opacity-100" : "opacity-0"
          )}
        />
      )}
    </div>
  );
};

export default ProductImage;
