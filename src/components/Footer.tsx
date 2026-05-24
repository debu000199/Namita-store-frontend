import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t bg-card mt-auto">
      <div className="container py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <h3 className="font-display text-lg font-semibold mb-4">Namita Varieties</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Luxury cosmetics crafted with care. Discover beauty that feels as good as it looks.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-3 uppercase tracking-wider">Shop</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/?category=skincare" className="hover:text-foreground transition-colors">Skincare</Link></li>
              <li><Link to="/?category=makeup" className="hover:text-foreground transition-colors">Makeup</Link></li>
              <li><Link to="/?category=fragrance" className="hover:text-foreground transition-colors">Fragrance</Link></li>
              <li><Link to="/?category=haircare" className="hover:text-foreground transition-colors">Haircare</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-3 uppercase tracking-wider">Help</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><span className="hover:text-foreground transition-colors cursor-pointer">Shipping</span></li>
              <li><span className="hover:text-foreground transition-colors cursor-pointer">Returns</span></li>
              <li><span className="hover:text-foreground transition-colors cursor-pointer">Contact</span></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-3 uppercase tracking-wider">Follow Us</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><span className="hover:text-foreground transition-colors cursor-pointer">Instagram</span></li>
              <li><span className="hover:text-foreground transition-colors cursor-pointer">Pinterest</span></li>
              <li><span className="hover:text-foreground transition-colors cursor-pointer">TikTok</span></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t pt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Force fully develop by <a href="https://github.com/SubhadipD9" target="_blank">SubhadipD9</a>.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
