import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "@/lib/cartStore";
import { useAuthStore } from "@/lib/authStore";
import { api } from "@/lib/api";
import { formatPrice, getVariantPrice } from "@/lib/utils";
import Layout from "@/components/Layout";

const inputClass =
  "w-full rounded-lg border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring";

const Checkout = () => {
  const { items, totalCents, clearCart } = useCartStore();
  const user = useAuthStore((s) => s.user);
  const loading_auth = useAuthStore((s) => s.loading);
  const [email, setEmail] = useState("");
  const [fullname, setFullname] = useState("");
  const [phone, setPhone] = useState("");
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading_auth && !user) {
      navigate("/login?redirect=/checkout", { replace: true });
    }
  }, [user, loading_auth, navigate]);

  // --- NEW AUTO-FILL LOGIC ---
  useEffect(() => {
    if (user) {
      // 1. Fill basic user details
      if (user.email) setEmail(user.email);
      if (user.name) setFullname(user.name);
      if (user.phone) setPhone(user.phone);

      // 2. Search for the most recent address in previous orders
      if (user.orders && Array.isArray(user.orders)) {
        // Reverse the array to start looking from the most recent order
        const orderWithAddress = [...user.orders].reverse().find(
          (o) => o.address && Array.isArray(o.address) && o.address.length > 0
        );

        if (orderWithAddress && orderWithAddress.address) {
          const latestAddress = orderWithAddress.address[0];
          
          if (latestAddress.fullname) setFullname(latestAddress.fullname);
          if (latestAddress.phone) setPhone(latestAddress.phone);
          if (latestAddress.line1) setLine1(latestAddress.line1);
          if (latestAddress.line2) setLine2(latestAddress.line2);
          if (latestAddress.city) setCity(latestAddress.city);
          if (latestAddress.state) setState(latestAddress.state);
          if (latestAddress.postalCode) setPostalCode(latestAddress.postalCode);
        }
      }
    }
  }, [user]);

  if (items.length === 0 && !success) {
    return (
      <Layout>
        <div className="container flex flex-col items-center justify-center py-20 text-center">
          <h1 className="font-display text-2xl">Your bag is empty</h1>
          <p className="mt-2 text-sm text-muted-foreground">Add some products before checking out.</p>
          <button onClick={() => navigate("/")} className="mt-6 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground">
            Continue Shopping
          </button>
        </div>
      </Layout>
    );
  }

  if (success) {
    return (
      <Layout>
        <div className="container flex flex-col items-center justify-center py-20 text-center">
          <div className="animate-fade-in-up">
            <h1 className="font-display text-3xl font-semibold">Thank You!</h1>
            <p className="mt-4 text-muted-foreground">
              Your order <span className="font-medium text-foreground">{success}</span> has been placed.
            </p>
            <p className="mt-1 text-sm text-muted-foreground">We'll send a confirmation to your email.</p>
            <button onClick={() => navigate("/")} className="mt-8 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground">
              Continue Shopping
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullname.trim() || !phone.trim() || !line1.trim() || !city.trim() || !state.trim() || !postalCode.trim()) {
      setError("Please fill in all required address fields.");
      return;
    }
    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const cartItems = items.map((i) => ({ variantId: i.variant._id, quantity: i.quantity }));
      const shippingAddress = {
        fullname: fullname.trim(),
        phone: phone.trim(),
        line1: line1.trim(),
        line2: line2.trim() || undefined,
        city: city.trim(),
        state: state.trim(),
        postalCode: postalCode.trim(),
      };
      const result = await api.checkout(cartItems, email, shippingAddress);
      clearCart();
      setSuccess(result.orderId);
    } catch {
      setError("Checkout failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container py-12">
        <h1 className="font-display text-3xl font-semibold mb-8">Checkout</h1>
        <div className="grid gap-10 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <form onSubmit={handleCheckout} className="space-y-6">
              {error && (
                <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>
              )}

              {/* Contact */}
              <div>
                <label htmlFor="checkout-email" className="mb-1.5 block text-sm font-medium">Email Address</label>
                <input id="checkout-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={inputClass} required />
              </div>

              {/* Shipping Address */}
              <fieldset className="space-y-4">
                <legend className="font-display text-lg font-medium">Shipping Address</legend>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="fullname" className="mb-1.5 block text-sm font-medium">Full Name *</label>
                    <input id="fullname" value={fullname} onChange={(e) => setFullname(e.target.value)} placeholder="John Doe" className={inputClass} required />
                  </div>
                  <div>
                    <label htmlFor="phone" className="mb-1.5 block text-sm font-medium">Phone *</label>
                    <input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" className={inputClass} required />
                  </div>
                </div>

                <div>
                  <label htmlFor="line1" className="mb-1.5 block text-sm font-medium">Address Line 1 *</label>
                  <input id="line1" value={line1} onChange={(e) => setLine1(e.target.value)} placeholder="House / Flat No., Street" className={inputClass} required />
                </div>

                <div>
                  <label htmlFor="line2" className="mb-1.5 block text-sm font-medium">Address Line 2 <span className="text-muted-foreground">(optional)</span></label>
                  <input id="line2" value={line2} onChange={(e) => setLine2(e.target.value)} placeholder="Landmark, Area" className={inputClass} />
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label htmlFor="city" className="mb-1.5 block text-sm font-medium">City *</label>
                    <input id="city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Mumbai" className={inputClass} required />
                  </div>
                  <div>
                    <label htmlFor="state" className="mb-1.5 block text-sm font-medium">State *</label>
                    <input id="state" value={state} onChange={(e) => setState(e.target.value)} placeholder="Maharashtra" className={inputClass} required />
                  </div>
                  <div>
                    <label htmlFor="postalCode" className="mb-1.5 block text-sm font-medium">Postal Code *</label>
                    <input id="postalCode" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} placeholder="400001" className={inputClass} required />
                  </div>
                </div>
              </fieldset>

              <div className="rounded-lg border border-dashed p-6 text-center">
                <p className="text-base text-red-500 font-medium">
                  We offer home delivery for customers within 1 KM from the store. <br></br> <br></br>
                  আমরা দোকান থেকে ১ কিলোমিটারের মধ্যে থাকা গ্রাহকদের জন্য হোম ডেলিভারি সেবা প্রদান করি।
                </p>
              </div>

              <button type="submit" disabled={loading} className="w-full rounded-lg bg-primary py-3.5 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90 disabled:opacity-50">
                {loading ? "Processing..." : `Pay ${formatPrice(totalCents())}`}
              </button>
            </form>
          </div>

          {/* Order summary */}
          <div className="lg:col-span-2">
            <div className="rounded-lg border bg-card p-6">
              <h2 className="font-display text-lg mb-4">Order Summary</h2>
              <ul className="space-y-4">
                {items.map((item) => (
                  <li key={item.variant._id} className="flex gap-3">
                    <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-md bg-secondary">
                      <img src={item.product.images[0]} alt={item.product.title} className="h-full w-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.product.title}</p>
                      <p className="text-xs text-muted-foreground">{item.variant.name} × {item.quantity}</p>
                    </div>
                    <p className="text-sm font-medium">{formatPrice(getVariantPrice(item.variant) * item.quantity)}</p>
                  </li>
                ))}
              </ul>
              <div className="mt-6 border-t pt-4 flex justify-between text-base font-medium">
                <span>Total</span>
                <span>{formatPrice(totalCents())}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Checkout;