import { useNavigate } from "react-router-dom";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { 
  Home, 
  Package, 
  Users, 
  UserCircle, 
  Wallet, 
  ArrowUpRight, 
  ArrowDownRight, 
  Ticket, 
  Landmark, 
  BarChart3,
  Settings,
  Headphones,
  Share2,
  Crown,
  Building2
} from "lucide-react";
import { getCurrentUser } from "@/lib/store";

interface QuickMenuSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const QuickMenuSheet = ({ open, onOpenChange }: QuickMenuSheetProps) => {
  const navigate = useNavigate();
  const user = getCurrentUser();

  const handleNavigate = (path: string) => {
    navigate(path);
    onOpenChange(false);
  };

  const menuGroups = [
    {
      title: "Navigasi Utama",
      items: [
        { icon: Home, label: "Beranda", path: "/", color: "text-primary" },
        { icon: Package, label: "Produk", path: "/product", color: "text-accent" },
        { icon: Users, label: "Tim", path: "/team", color: "text-success" },
        { icon: UserCircle, label: "Profil", path: "/profile", color: "text-vip-gold" },
      ]
    },
    {
      title: "Keuangan",
      items: [
        { icon: ArrowUpRight, label: "Recharge", path: "/", color: "text-success", state: "recharge" },
        { icon: ArrowDownRight, label: "Withdraw", path: "/", color: "text-accent", state: "withdraw" },
        { icon: Wallet, label: "Investasi Saya", path: "/account", color: "text-primary" },
        { icon: BarChart3, label: "Riwayat Transaksi", path: "/account", color: "text-vip-gold" },
      ]
    },
    {
      title: "Akun",
      items: [
        { icon: Landmark, label: "Account Bank", path: "/profile", color: "text-primary" },
        { icon: Ticket, label: "Klaim Kupon", path: "/profile", color: "text-vip-gold" },
        { icon: Share2, label: "Referral", path: "/team", color: "text-success" },
        { icon: Crown, label: "VIP Level", path: "/profile", color: "text-accent" },
      ]
    },
    {
      title: "Bantuan",
      items: [
        { icon: Building2, label: "Profil Perusahaan", path: "/profile", color: "text-primary" },
        { icon: Headphones, label: "Hubungi Kami", path: "/profile", color: "text-accent" },
        ...(user?.isAdmin ? [{ icon: Settings, label: "Admin Panel", path: "/admin", color: "text-destructive" }] : []),
      ]
    }
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[70vh] rounded-t-3xl">
        <SheetHeader className="pb-4">
          <SheetTitle className="text-center text-lg">Menu Cepat</SheetTitle>
        </SheetHeader>
        
        <div className="space-y-6 overflow-y-auto max-h-[calc(70vh-100px)] pb-8">
          {menuGroups.map((group) => (
            <div key={group.title}>
              <h3 className="text-xs font-medium text-muted-foreground mb-3 px-1">
                {group.title}
              </h3>
              <div className="grid grid-cols-4 gap-3">
                {group.items.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => handleNavigate(item.path)}
                    className="flex flex-col items-center gap-2 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className={`w-10 h-10 rounded-full bg-background flex items-center justify-center ${item.color}`}>
                      <item.icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs text-foreground text-center leading-tight">
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default QuickMenuSheet;
