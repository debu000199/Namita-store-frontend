import { useState, useEffect } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import type { Product, ProductVariant, Category } from "@/lib/types";

interface AdminProductFormProps {
  product?: Product | null;
  categories: Category[];
  onSave: (data: Partial<Product>) => Promise<void>;
  onClose: () => void;
}

const emptyVariant = (): Partial<ProductVariant> => ({
  _id: crypto.randomUUID(),
  name: "",
  price: 0,
  stock: 0,
});

const AdminProductForm = ({ product, categories, onSave, onClose }: AdminProductFormProps) => {
  const isEditing = !!product;
  const [title, setTitle] = useState(product?.title || "");
  const [slug, setSlug] = useState(product?.slug || "");
  const [description, setDescription] = useState(product?.description || "");
  const [categoryId, setCategoryId] = useState(
    typeof product?.category === "string" ? product.category : product?.category?._id || categories[0]?._id || ""
  );
  const [images, setImages] = useState<string[]>(product?.images || [""]);
  const [variants, setVariants] = useState<Partial<ProductVariant>[]>(
    product?.variants?.length && typeof product.variants[0] !== "string"
      ? (product.variants as ProductVariant[])
      : [emptyVariant()]
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!product && title && !slug) {
      setSlug(title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
    }
  }, [title, product, slug]);

  const handleAutoSlug = (val: string) => {
    setTitle(val);
    if (!product) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
    }
  };

  const addVariant = () => setVariants([...variants, emptyVariant()]);
  const removeVariant = (idx: number) => setVariants(variants.filter((_, i) => i !== idx));
  const updateVariant = (idx: number, field: string, value: string | number) => {
    setVariants(variants.map((v, i) => (i === idx ? { ...v, [field]: value } : v)));
  };

  const addImage = () => setImages([...images, ""]);
  const removeImage = (idx: number) => setImages(images.filter((_, i) => i !== idx));
  const updateImage = (idx: number, val: string) => setImages(images.map((img, i) => (i === idx ? val : img)));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !slug.trim()) {
      setError("Title and slug are required.");
      return;
    }
    if (variants.length === 0 || variants.some((v) => !v.name?.trim())) {
      setError("Each variant needs a name.");
      return;
    }
    setError("");
    setSaving(true);
    try {
      const selectedCategory = categories.find((c) => c._id === categoryId) || categories[0];
      await onSave({
        ...(product ? { _id: product._id } : {}),
        title,
        slug,
        description,
        category: selectedCategory?.name || categoryId,
        images: images.filter(Boolean),
        variants: variants.map(({ name, price, stock }) => ({ name, price, stock })),
      } as any);
      onClose();
    } catch {
      setError("Failed to save product.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-foreground/30 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg overflow-y-auto bg-background shadow-2xl animate-slide-in-right">
        <div className="flex items-center justify-between border-b px-6 py-5">
          <h2 className="font-display text-xl">{isEditing ? "Edit Product" : "New Product"}</h2>
          <button onClick={onClose} aria-label="Close" className="rounded-full p-2 hover:bg-secondary transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>
          )}

          <div>
            <label className="mb-1.5 block text-sm font-medium">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => handleAutoSlug(e.target.value)}
              className="w-full rounded-lg border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
              required
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">Slug</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full rounded-lg border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
              required
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full rounded-lg border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
            >
              {categories.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-lg border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring resize-none"
            />
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
                  <input
                    type="url"
                    value={img}
                    onChange={(e) => updateImage(idx, e.target.value)}
                    placeholder="https://..."
                    className="flex-1 rounded-lg border bg-background px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                  />
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
                  <input
                    type="text"
                    value={v.name || ""}
                    onChange={(e) => updateVariant(idx, "name", e.target.value)}
                    placeholder="Variant name (e.g. 30ml)"
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-muted-foreground">Price (cents)</label>
                      <input
                        type="number"
                        min="0"
                        value={v.price || 0}
                        onChange={(e) => updateVariant(idx, "price", Number(e.target.value))}
                        className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Stock</label>
                      <input
                        type="number"
                        min="0"
                        value={v.stock || 0}
                        onChange={(e) => updateVariant(idx, "stock", Number(e.target.value))}
                        className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-lg bg-primary py-3.5 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "Saving..." : isEditing ? "Update Product" : "Create Product"}
          </button>
        </form>
      </div>
    </>
  );
};

export default AdminProductForm;
