import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/lib/authStore";
import { api } from "@/lib/api";
import type { Order } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import Layout from "@/components/Layout";
import { LogOut, Package, User } from "lucide-react";

const Account = () => {
  const user = useAuthStore((s) => s.user);
  const loading_auth = useAuthStore((s) => s.loading);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    if (!loading_auth && !user) {
      navigate("/login?redirect=/account", { replace: true });
    }
  }, [user, loading_auth, navigate]);

  useEffect(() => {
    if (user) {
      api.getOrders().then(setOrders).catch(() => { }).finally(() => setLoadingOrders(false));
    }
  }, [user]);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  if (loading_auth || !user) {
    return (
      <Layout>
        <div className="container py-20 text-center text-muted-foreground">Loading...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-12">
        <div className="grid gap-10 lg:grid-cols-3">
          {/* Profile card */}
          <div className="lg:col-span-1">
            <div className="rounded-lg border bg-card p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-display text-lg font-semibold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="font-display text-lg font-semibold">{user.name}</h2>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{user.isAdmin ? "Admin" : "Customer"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  <span>{orders.length} order{orders.length !== 1 ? "s" : ""}</span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg border py-2.5 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          </div>

          {/* Orders */}
          <div className="lg:col-span-2">
            <h1 className="font-display text-2xl font-semibold mb-6">Your Orders</h1>
            {loadingOrders ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="h-32 animate-pulse rounded-lg bg-secondary" />
                ))}
              </div>
            ) : orders.length === 0 ? (
              <div className="rounded-lg border bg-card p-8 text-center">
                <Package className="mx-auto h-10 w-10 text-muted-foreground/50" />
                <p className="mt-3 text-muted-foreground">No orders yet.</p>
                <button
                  onClick={() => navigate("/")}
                  className="mt-4 rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order._id} className="rounded-lg border bg-card p-5">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                      <div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          ID: {order._id.slice(-8)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${order.status === "delivered"
                          ? "bg-green-500/10 text-green-600"
                          : order.status === "shipped"
                            ? "bg-blue-500/10 text-blue-600"
                            : "bg-yellow-500/10 text-yellow-600"
                          }`}>
                          {order.status}
                        </span>
                        <span className="font-medium text-sm">
                          {formatPrice(order.total)}
                        </span>
                      </div>
                    </div>
                    <ul className="space-y-2">
                      {order.items.map((item, idx) => (
                        <li key={idx} className="flex items-center justify-between text-sm">
                          <span className="capitalize">
                            {/* FIX: Added optional chaining and fallback text here */}
                            {item.variant?.product?.title || "Deleted Product"}{" "}
                            <span className="text-muted-foreground">
                              ({item.variant?.name || "Unknown"}) × {item.quantity}
                            </span>
                          </span>
                          <span className="text-muted-foreground">{formatPrice(item.price)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Account;