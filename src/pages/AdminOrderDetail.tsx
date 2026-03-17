import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuthStore } from "@/lib/authStore";
import { api } from "@/lib/api";
import type { Order } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import Layout from "@/components/Layout";
import { ArrowLeft, CheckCircle } from "lucide-react";

const AdminOrderDetail = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const user = useAuthStore((s) => s.user);
  const authLoading = useAuthStore((s) => s.loading);
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || !user.isAdmin)) navigate("/login");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (orderId) {
      api.adminGetOrder(orderId).then((data) => {
        setOrder(data);
        setLoading(false);
      }).catch(() => {
        navigate("/admin");
      });
    }
  }, [orderId, navigate]);

  const handleMarkPaid = async () => {
    if (!order) return;
    setUpdating(true);
    try {
      await api.adminUpdateOrder(order._id, { status: "paid" });
      setOrder({ ...order, status: "paid" });
    } catch {
      alert("Failed to update order status.");
    } finally {
      setUpdating(false);
    }
  };

  const handleStatusChange = async (status: string) => {
    if (!order) return;
    setUpdating(true);
    try {
      await api.adminUpdateOrder(order._id, { status });
      setOrder({ ...order, status });
    } catch {
      alert("Failed to update order status.");
    } finally {
      setUpdating(false);
    }
  };

  if (authLoading || loading) return <Layout><div className="container py-20 text-center text-muted-foreground">Loading…</div></Layout>;
  if (!user || !user.isAdmin || !order) return null;

  const addr = order.address?.[0];
  const userName = typeof order.user === "object" ? order.user.name : "Customer";
  const isPaid = order.status === "paid";

  return (
    <Layout>
      <div className="container py-8 md:py-12 max-w-3xl">
        <button onClick={() => navigate("/admin")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </button>

        <div className={`rounded-xl border p-6 md:p-8 ${isPaid ? "border-green-500/30 bg-green-50/50 dark:bg-green-950/20" : ""}`}>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
            <div>
              <h1 className="font-display text-2xl font-semibold">Order Details</h1>
              <p className="text-xs text-muted-foreground mt-1 font-mono">#{order._id}</p>
              <p className="text-sm text-muted-foreground mt-1">{new Date(order.createdAt).toLocaleString()}</p>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={order.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={updating}
                className="rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
              {!isPaid && (
                <button
                  onClick={handleMarkPaid}
                  disabled={updating}
                  className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  <CheckCircle className="h-4 w-4" /> Mark Paid
                </button>
              )}
            </div>
          </div>

          {/* Customer Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Customer</h3>
              <p className="font-medium">{userName}</p>
              {addr && <p className="text-sm text-muted-foreground">{addr.phone}</p>}
            </div>
            {addr && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Shipping Address</h3>
                <p className="text-sm">{addr.fullname}</p>
                <p className="text-sm text-muted-foreground">{addr.line1}</p>
                {addr.line2 && <p className="text-sm text-muted-foreground">{addr.line2}</p>}
                <p className="text-sm text-muted-foreground">{addr.city}, {addr.state} {addr.postalCode}</p>
              </div>
            )}
          </div>

          {/* Items */}
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Items</h3>
          <div className="space-y-3 mb-6">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="font-medium capitalize">{item.variant?.product?.title || "Product"}</p>
                  <p className="text-sm text-muted-foreground">{item.variant?.name} × {item.quantity}</p>
                </div>
                <p className="font-medium">{formatPrice(item.price)}</p>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="flex items-center justify-between border-t pt-4">
            <p className="font-display text-lg font-semibold">Total</p>
            <p className="font-display text-lg font-semibold">{formatPrice(order.total)}</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminOrderDetail;
