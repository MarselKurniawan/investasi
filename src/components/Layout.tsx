import { NavLink } from "@/components/NavLink";
import { Home, Package, Users, UserCircle, BarChart3 } from "lucide-react";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-gradient-background pb-20">
      {/* Decorative background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-0 w-64 h-64 bg-vip-gold/5 rounded-full blur-3xl" />
      </div>

      <div className="mx-auto max-w-md relative z-10">
        {children}
      </div>
      
      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 glass border-t border-primary/20">
        <div className="mx-auto max-w-md flex items-center justify-around px-2 py-3">
          <NavLink
            to="/"
            className="flex flex-col items-center gap-1 px-3 py-2 text-muted-foreground transition-all hover:text-primary"
            activeClassName="text-primary font-medium drop-shadow-[0_0_8px_hsl(185,100%,50%)]"
          >
            <Home className="w-5 h-5" />
            <span className="text-xs">Beranda</span>
          </NavLink>
          
          <NavLink
            to="/product"
            className="flex flex-col items-center gap-1 px-3 py-2 text-muted-foreground transition-all hover:text-primary"
            activeClassName="text-primary font-medium drop-shadow-[0_0_8px_hsl(185,100%,50%)]"
          >
            <Package className="w-5 h-5" />
            <span className="text-xs">Produk</span>
          </NavLink>
          
          <NavLink
            to="/statistics"
            className="flex flex-col items-center gap-1 px-3 py-2 text-muted-foreground transition-all hover:text-primary"
            activeClassName="text-primary font-medium drop-shadow-[0_0_8px_hsl(185,100%,50%)]"
          >
            <BarChart3 className="w-5 h-5" />
            <span className="text-xs">Statistik</span>
          </NavLink>
          
          <NavLink
            to="/team"
            className="flex flex-col items-center gap-1 px-3 py-2 text-muted-foreground transition-all hover:text-primary"
            activeClassName="text-primary font-medium drop-shadow-[0_0_8px_hsl(185,100%,50%)]"
          >
            <Users className="w-5 h-5" />
            <span className="text-xs">Tim</span>
          </NavLink>
          
          <NavLink
            to="/profile"
            className="flex flex-col items-center gap-1 px-3 py-2 text-muted-foreground transition-all hover:text-primary"
            activeClassName="text-primary font-medium drop-shadow-[0_0_8px_hsl(185,100%,50%)]"
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
