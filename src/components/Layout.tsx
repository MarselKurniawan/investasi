import { NavLink } from "@/components/NavLink";
import { Home, Package, Users, UserCircle, BarChart3 } from "lucide-react";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-gradient-background pb-20">
      <div className="mx-auto max-w-md">
        {children}
      </div>
      
      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-elegant">
        <div className="mx-auto max-w-md flex items-center justify-around px-2 py-3">
          <NavLink
            to="/"
            className="flex flex-col items-center gap-1 px-3 py-2 text-muted-foreground transition-all"
            activeClassName="text-primary font-medium"
          >
            <Home className="w-5 h-5" />
            <span className="text-xs">Beranda</span>
          </NavLink>
          
          <NavLink
            to="/product"
            className="flex flex-col items-center gap-1 px-3 py-2 text-muted-foreground transition-all"
            activeClassName="text-primary font-medium"
          >
            <Package className="w-5 h-5" />
            <span className="text-xs">Produk</span>
          </NavLink>
          
          <NavLink
            to="/statistics"
            className="flex flex-col items-center gap-1 px-3 py-2 text-muted-foreground transition-all"
            activeClassName="text-primary font-medium"
          >
            <BarChart3 className="w-5 h-5" />
            <span className="text-xs">Statistik</span>
          </NavLink>
          
          <NavLink
            to="/team"
            className="flex flex-col items-center gap-1 px-3 py-2 text-muted-foreground transition-all"
            activeClassName="text-primary font-medium"
          >
            <Users className="w-5 h-5" />
            <span className="text-xs">Tim</span>
          </NavLink>
          
          <NavLink
            to="/profile"
            className="flex flex-col items-center gap-1 px-3 py-2 text-muted-foreground transition-all"
            activeClassName="text-primary font-medium"
          >
            <UserCircle className="w-5 h-5" />
            <span className="text-xs">Profil</span>
          </NavLink>
        </div>
      </nav>
    </div>
  );
};

export default Layout;
