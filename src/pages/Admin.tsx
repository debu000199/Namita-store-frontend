import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "@/lib/authStore";
import { api } from "@/lib/api";
import type { Product, ProductVariant, Order } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import Layout from "@/components/Layout";
import { Trash2, Edit, Plus, LogOut, Package, ShoppingCart } from "lucide-react";

type Tab = "products" | "orders";

const Admin = () => {
  const user = useAuthStore((s) => s.user);
  const loading = useAuthStore((s) => s.loading);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("products");

  useEffect(() => {
    if (!loading && (!user || !user.isAdmin)) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  if (loading) return <Layout><div className="container py-20 text-center text-muted-foreground">Loading…</div></Layout>;
  if (!user || !user.isAdmin) return null;

  return (
    <Layout>
      <div className="container py-8 md:py-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl font-semibold">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">Signed in as {user.email}</p>
          </div>
          <div className="flex gap-2">
            <Link
              to="/admin/products/new"
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-colors"
            >
              <Plus className="h-4 w-4" /> Add Product
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary transition-colors"
            >
              <LogOut className="h-4 w-4" /> Sign Out
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 border-b">
          <button
            onClick={() => setTab("products")}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              tab === "products" ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Package className="h-4 w-4" /> Products
          </button>
          <button
            onClick={() => setTab("orders")}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              tab === "orders" ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <ShoppingCart className="h-4 w-4" /> Orders
          </button>
        </div>

        {tab === "products" ? <ProductsTab /> : <OrdersTab />}
      </div>
    </Layout>
  );
};

/* ─── Products Tab ─── */
const ProductsTab = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.adminGetProducts()
      .then((data) => {
        setProducts(data?.products || data?.getProducts || []);
      })
      .catch((error) => {
        console.error("Failed to fetch products:", error);
        setProducts([]); // Fallback to empty array on error
      })
      .finally(() => {
        setLoading(false); // ALWAYS turn off loading state
      });
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    try {
      await api.adminDeleteProduct(id);
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch (error) {
      console.error("Failed to delete product:", error);
      alert("Failed to delete product. Please try again.");
    }
  };

  if (loading)
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 animate-pulse rounded-lg bg-secondary" />
        ))}
      </div>
    );

  if (products.length === 0)
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="font-display text-xl text-muted-foreground">No products yet</p>
        <Link
          to="/admin/products/new"
          className="mt-6 flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground"
        >
          <Plus className="h-4 w-4" /> Add Product
        </Link>
      </div>
    );

  return (
    <div className="overflow-hidden rounded-lg border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-secondary/50">
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Product</th>
            <th className="hidden sm:table-cell px-4 py-3 text-left font-medium text-muted-foreground">Category</th>
            <th className="hidden md:table-cell px-4 py-3 text-left font-medium text-muted-foreground">Price</th>
            <th className="hidden md:table-cell px-4 py-3 text-left font-medium text-muted-foreground">Variants</th>
            <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product._id} className="border-b last:border-0 hover:bg-secondary/30 transition-colors">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-md bg-secondary">
                    {product.images?.[0] && <img src={product.images[0]} alt="" className="h-full w-full object-cover" />}
                  </div>
                  <span className="font-medium capitalize">{product.title}</span>
                </div>
              </td>
              <td className="hidden sm:table-cell px-4 py-3 text-muted-foreground">
                {typeof product.category === "string" ? product.category : product.category?.name}
              </td>
              <td className="hidden md:table-cell px-4 py-3">
                {product.variants?.length > 0 && typeof product.variants[0] !== "string"
                  ? formatPrice(Math.min(...(product.variants as ProductVariant[]).map((v) => v.price ?? 0)))
                  : "—"}
              </td>
              <td className="hidden md:table-cell px-4 py-3 text-muted-foreground">{product.variants?.length || 0}</td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-1">
                  <Link
                    to={`/admin/products/${product._id}/edit`}
                    aria-label={`Edit ${product.title}`}
                    className="rounded-full p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={() => handleDelete(product._id)}
                    aria-label={`Delete ${product.title}`}
                    className="rounded-full p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

/* ─── Orders Tab ─── */
const OrdersTab = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.adminGetOrders()
      .then((data) => {
        setOrders(data?.orders || []);
      })
      .catch((error) => {
        console.error("Failed to fetch orders:", error);
        setOrders([]); // Fallback to empty array if no orders or API error
      })
      .finally(() => {
        setLoading(false); // ALWAYS turn off loading state
      });
  }, []);

  if (loading)
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-lg bg-secondary" />
        ))}
      </div>
    );

  if (orders.length === 0)
    return <p className="py-20 text-center text-muted-foreground">No orders yet.</p>;

  return (
    <div className="space-y-3">
      {orders.map((order) => {
        const addr = order.address?.[0];
        const userName = typeof order.user === "object" ? order.user?.name : "Customer";
        const isPaid = order.status === "paid";

        return (
          <Link
            key={order._id}
            to={`/admin/orders/${order._id}`}
            className={`block rounded-lg border p-4 transition-colors hover:bg-secondary/40 ${isPaid ? "border-green-500/30 bg-green-50/50 dark:bg-green-950/20" : ""}`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <p className="font-medium">{userName}</p>
                {addr && <p className="text-sm text-muted-foreground">{addr.phone}</p>}
              </div>
              <div className="flex items-center gap-3">
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${isPaid ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"}`}>
                  {order.status}
                </span>
                <span className="text-sm font-medium">{formatPrice(order.total)}</span>
              </div>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? "s" : ""} · {new Date(order.createdAt).toLocaleDateString()}
            </p>
          </Link>
        );
      })}
    </div>
  );
};

export default Admin;
