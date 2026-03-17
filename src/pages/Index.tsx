import { useSearchParams, Link } from "react-router-dom";
import { useProducts } from "@/hooks/useProducts";
import ProductGrid from "@/components/ProductGrid";
import Layout from "@/components/Layout";
import heroImage from "@/assets/hero-cosmetics.jpg";

const Index = () => {
  const [searchParams] = useSearchParams();
  const category = searchParams.get("category") || undefined;
  const q = searchParams.get("q") || undefined;
  const { data, isLoading } = useProducts({ category, q });

  const showHero = !category && !q;

  return (
    <Layout>
      {showHero && (
        <section className="relative overflow-hidden">
          <div className="absolute inset-0">
            <img
              src={heroImage}
              alt="Luxury cosmetics collection"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-foreground/30" />
          </div>
          <div className="container relative z-10 flex min-h-[60vh] flex-col items-start justify-center py-20">
            <h1 className="max-w-lg font-display text-4xl font-bold text-primary-foreground sm:text-5xl md:text-6xl animate-fade-in-up">
              Beauty, Refined
            </h1>
            <p className="mt-4 max-w-md text-base text-primary-foreground/80 font-body animate-fade-in-up">
              Discover our curated collection of luxury cosmetics, crafted for radiance.
            </p>
            <Link
              to="/?category=skincare"
              className="mt-8 rounded-lg bg-background px-8 py-3 text-sm font-medium text-foreground transition-transform hover:scale-105 animate-fade-in-up"
            >
              Shop Skincare
            </Link>
          </div>
        </section>
      )}

      {/* Category quick nav */}
      {showHero && (
        <section className="container py-10">
          <div className="flex flex-wrap justify-center gap-3">
            {["Skincare", "Makeup", "Fragrance", "Haircare"].map((cat) => (
              <Link
                key={cat}
                to={`/?category=${cat.toLowerCase()}`}
                className="rounded-full border px-6 py-2.5 text-sm font-medium text-foreground/120 transition-colors hover:border-primary hover:text-primary"
              >
                {cat}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="container py-12 md:py-16">
        {(category || q) && (
          <div className="mb-8">
            <h2 className="font-display text-2xl font-semibold capitalize">
              {q ? `Results for "${q}"` : category}
            </h2>
            <Link to="/" className="mt-1 inline-block text-sm text-primary hover:underline">
              ← Back to all products
            </Link>
          </div>
        )}
        {!category && !q && (
          <h2 className="mb-8 font-display text-2xl font-semibold">Our Collection</h2>
        )}
        <ProductGrid products={data?.products || []} loading={isLoading} />
      </section>
    </Layout>
  );
};

export default Index;
