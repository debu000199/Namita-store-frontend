import { X, Minus, Plus, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/lib/cartStore";
import { formatPrice, getVariantPrice } from "@/lib/utils";
import { Link } from "react-router-dom";

const CartDrawer = () => {
  const { items, isOpen, closeCart, removeItem, updateQuantity, totalCents } = useCartStore();

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 bg-foreground/30 backdrop-blur-sm animate-fade-in"
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        role="dialog"
        aria-label="Shopping cart"
        aria-modal="true"
        className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-background shadow-2xl animate-slide-in-right"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-5">
          <h2 className="font-display text-xl">Your Bag</h2>
          <button
            onClick={closeCart}
            aria-label="Close cart"
            className="rounded-full p-2 transition-colors hover:bg-secondary"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <ShoppingBag className="h-12 w-12 text-muted-foreground/40 mb-4" />
              <p className="font-display text-lg text-muted-foreground">Your bag is empty</p>
              <p className="mt-1 text-sm text-muted-foreground">Add something beautiful.</p>
            </div>
          ) : (
            <ul className="space-y-6">
              {items.map((item) => (
                <li key={item.variant._id} className="flex gap-4">
                  <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md bg-secondary">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex flex-1 flex-col">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="text-sm font-medium">{item.product.title}</h3>
                        <p className="text-xs text-muted-foreground">{item.variant.name}</p>
                      </div>
                      <button
                        onClick={() => removeItem(item.variant._id)}
                        aria-label={`Remove ${item.product.title}`}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.variant._id, item.quantity - 1)}
                          aria-label="Decrease quantity"
                          className="rounded-full border p-1 hover:bg-secondary transition-colors"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="text-sm w-6 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.variant._id, item.quantity + 1)}
                          aria-label="Increase quantity"
                          className="rounded-full border p-1 hover:bg-secondary transition-colors"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <p className="text-sm font-medium">
                        {formatPrice(getVariantPrice(item.variant) * item.quantity)}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t px-6 py-5 space-y-4">
            <div className="flex justify-between text-base font-medium">
              <span>Subtotal</span>
              <span>{formatPrice(totalCents())}</span>
            </div>
            <Link
              to="/checkout"
              onClick={closeCart}
              className="block w-full rounded-lg bg-primary py-3 text-center text-sm font-medium text-primary-foreground transition-colors hover:opacity-90"
            >
              Checkout
            </Link>
          </div>
        )}
      </aside>
    </>
  );
};

export default CartDrawer;
