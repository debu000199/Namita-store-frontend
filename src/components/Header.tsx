import { Link, useNavigate } from "react-router-dom";
import { ShoppingBag, Search, User, Menu, X } from "lucide-react";
import { useCartStore } from "@/lib/cartStore";
import { useAuthStore } from "@/lib/authStore";
import { useState } from "react";

const Header = () => {
  const totalItems = useCartStore((s) => s.totalItems());
  const openCart = useCartStore((s) => s.openCart);
  const user = useAuthStore((s) => s.user);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur-sm">
      <div className="container flex h-16 items-center justify-between gap-4">
        {/* Mobile menu toggle */}
        <button
          className="md:hidden rounded-full p-2 hover:bg-secondary transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        {/* Logo */}
        <Link to="/" className="font-display text-xl font-semibold tracking-tight text-foreground">
          Namita Varieties
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8 font-body text-sm">
          <Link to="/" className="text-foreground/120 hover:text-foreground transition-colors">
            Shop All
          </Link>
          <Link to="/?category=skincare" className="text-foreground/120 hover:text-foreground transition-colors">
            Skincare
          </Link>
          <Link to="/?category=makeup" className="text-foreground/120 hover:text-foreground transition-colors">
            Makeup
          </Link>
          <Link to="/?category=fragrance" className="text-foreground/120 hover:text-foreground transition-colors">
            Fragrance
          </Link>
          <Link to="/?category=haircare" className="text-foreground/120 hover:text-foreground transition-colors">
            Haircare
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Search */}
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            aria-label="Search products"
            className="rounded-full p-2 hover:bg-secondary transition-colors"
          >
            <Search className="h-5 w-5" />
          </button>

          {/* Admin dashboard link */}
          {user?.isAdmin && (
            <Link
              to="/admin"
              aria-label="Admin Dashboard"
              className="hidden md:flex rounded-full p-2 hover:bg-secondary transition-colors text-primary"
              title="Admin Dashboard"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
            </Link>
          )}

          {/* Auth */}
          <Link
            to={user ? "/account" : "/login"}
            aria-label={user ? "Account" : "Sign in"}
            className="rounded-full p-2 hover:bg-secondary transition-colors"
          >
            <User className="h-5 w-5" />
          </Link>

          {/* Cart */}
          <button
            onClick={openCart}
            aria-label={`Cart with ${totalItems} items`}
            className="relative rounded-full p-2 hover:bg-secondary transition-colors"
          >
            <ShoppingBag className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Search bar */}
      {searchOpen && (
        <div className="border-t px-4 py-3 animate-fade-in">
          <form onSubmit={handleSearch} className="container flex gap-2">
            <input
              type="search"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
              className="flex-1 rounded-lg border bg-background px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
            <button type="submit" className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground">
              Search
            </button>
          </form>
        </div>
      )}

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <nav className="border-t md:hidden animate-fade-in">
          <div className="container flex flex-col gap-2 py-4 font-body text-sm">
            {[
              { label: "Shop All", to: "/" },
              { label: "Skincare", to: "/?category=skincare" },
              { label: "Makeup", to: "/?category=makeup" },
              { label: "Fragrance", to: "/?category=fragrance" },
              { label: "Haircare", to: "/?category=haircare" },
            ].map((item) => (
              <Link
                key={item.label}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg px-3 py-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
              >
                {item.label}
              </Link>
            ))}
            {user?.isAdmin && (
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg px-3 py-2 text-primary hover:bg-secondary transition-colors"
              >
                Admin Dashboard
              </Link>
            )}
          </div>
        </nav>
      )}
    </header>
  );
};

export default Header;
