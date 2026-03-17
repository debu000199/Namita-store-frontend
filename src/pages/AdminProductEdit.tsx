import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuthStore } from "@/lib/authStore";
import { api } from "@/lib/api";
import type { Product, ProductVariant } from "@/lib/types";
import Layout from "@/components/Layout";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";

const CATEGORIES = ["Skincare", "Haircare", "Makeup", "Fragrance"];

const emptyVariant = (): Partial<ProductVariant> => ({
  _id: crypto.randomUUID(),
  name: "",
  price: 0,
  stock: 0,
});

const AdminProductEdit = () => {
  const { id } = useParams<{ id: string }>();
  const isNew = !id || id === "new";
  const user = useAuthStore((s) => s.user);
  const authLoading = useAuthStore((s) => s.loading);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [categoryName, setCategoryName] = useState(CATEGORIES[0]);
  const [images, setImages] = useState<string[]>([""]);
  const [variants, setVariants] = useState<Partial<ProductVariant>[]>([emptyVariant()]);

  useEffect(() => {
    if (!authLoading && (!user || !user.isAdmin)) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!isNew && id) {
      api.adminGetProducts().then((data) => {
        const products: Product[] = data.products || data.getProducts || [];
        const product = products.find((p) => p._id === id);
        if (!product) {
          navigate("/admin");
          return;
        }
        setTitle(product.title);
        setSlug(product.slug);
        setDescription(product.description || "");
        setCategoryName(typeof product.category === "string" ? product.category : product.category?.name || CATEGORIES[0]);
        setImages(product.images?.length ? product.images : [""]);
        setVariants(
          product.variants?.length && typeof product.variants[0] !== "string"
            ? (product.variants as ProductVariant[])
            : [emptyVariant()]
        );
        setLoading(false);
      });
    }
  }, [id, isNew, navigate]);

  const handleAutoSlug = (val: string) => {
    setTitle(val);
    if (isNew) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
    }
  };

  const addVariant = () => setVariants([...variants, emptyVariant()]);
  const removeVariant = (idx: number) => setVariants(variants.filter((_, i) => i !== idx));
  const updateVariant = (idx: number, field: string, value: string | number) =>
    setVariants(variants.map((v, i) => (i === idx ? { ...v, [field]: value } : v)));

  const addImage = () => setImages([...images, ""]);
  const removeImage = (idx: number) => setImages(images.filter((_, i) => i !== idx));
  const updateImage = (idx: number, val: string) => setImages(images.map((img, i) => (i === idx ? val : img)));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !slug.trim()) { setError("Title and slug are required."); return; }
    if (variants.length === 0 || variants.some((v) => !v.name?.trim())) { setError("Each variant needs a name."); return; }

    setError("");
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        title,
        slug,
        description,
        category: categoryName,
        images: images.filter(Boolean),
        variants: variants.map(({ name, price, stock }) => ({ name, price, stock })),
      };

      if (isNew) {
        await api.adminCreateProduct(payload);
      } else {
        await api.adminUpdateProduct(id!, payload);
      }
      navigate("/admin");
    } catch {
      setError("Failed to save product.");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) return <Layout><div className="container py-20 text-center text-muted-foreground">Loading…</div></Layout>;
  if (!user || !user.isAdmin) return null;

  const previewImage = images.find((img) => img.trim());

  return (
    <Layout>
      <div className="container py-8 md:py-12 max-w-4xl">
        <button onClick={() => navigate("/admin")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </button>

        <h1 className="font-display text-2xl font-semibold mb-8">{isNew ? "Create Product" : "Edit Product"}</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-5">
            {error && <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>}

            <div>
              <label className="mb-1.5 block text-sm font-medium">Title</label>
              <input type="text" value={title} onChange={(e) => handleAutoSlug(e.target.value)} required
                className="w-full rounded-lg border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring" />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">Slug</label>
              <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)} required
                className="w-full rounded-lg border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring" />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">Category</label>
              <select value={categoryName} onChange={(e) => setCategoryName(e.target.value)}
                className="w-full rounded-lg border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring">
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">Description (optional)</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
                className="w-full rounded-lg border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring resize-none" />
            </div>

            {/* Images */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium">Image URLs</label>
                <button type="button" onClick={addImage} className="text-xs text-primary hover:underline flex items-center gap-1">
                  <Plus className="h-3 w-3" /> Add
                </button>
              </div>
              <div className="space-y-2">
                {images.map((img, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input type="url" value={img} onChange={(e) => updateImage(idx, e.target.value)} placeholder="https://..."
                      className="flex-1 rounded-lg border bg-background px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" />
                    {images.length > 1 && (
                      <button type="button" onClick={() => removeImage(idx)} className="rounded-lg p-2 text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Variants */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium">Variants</label>
                <button type="button" onClick={addVariant} className="text-xs text-primary hover:underline flex items-center gap-1">
                  <Plus className="h-3 w-3" /> Add Variant
                </button>
              </div>
              <div className="space-y-3">
                {variants.map((v, idx) => (
                  <div key={v._id || idx} className="rounded-lg border p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">Variant {idx + 1}</span>
                      {variants.length > 1 && (
                        <button type="button" onClick={() => removeVariant(idx)} className="text-muted-foreground hover:text-destructive transition-colors">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                    <input type="text" value={v.name || ""} onChange={(e) => updateVariant(idx, "name", e.target.value)} placeholder="e.g. 30ml"
                      className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" />
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-muted-foreground">Price (paise)</label>
                        <input type="number" min="0" value={v.price || 0} onChange={(e) => updateVariant(idx, "price", Number(e.target.value))}
                          className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">Stock</label>
                        <input type="number" min="0" value={v.stock || 0} onChange={(e) => updateVariant(idx, "stock", Number(e.target.value))}
                          className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button type="submit" disabled={saving}
              className="w-full rounded-lg bg-primary py-3.5 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90 disabled:opacity-50">
              {saving ? "Saving…" : isNew ? "Create Product" : "Update Product"}
            </button>
          </form>

          {/* Image Preview */}
          <div className="hidden lg:block">
            <p className="text-sm font-medium mb-2">Image Preview</p>
            <div className="aspect-square rounded-lg border bg-secondary/50 overflow-hidden">
              {previewImage ? (
                <img src={previewImage} alt="Preview" className="h-full w-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No image URL</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminProductEdit;
