import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  getCurrentUser,
  formatCurrency,
  User,
  getCommissionRate,
} from "@/lib/store";
import {
  User as UserIcon,
  Crown,
  Shield,
  Edit2,
  LogOut,
  ChevronRight,
  Lock,
  Sparkles,
  TrendingUp,
  Landmark,
  Settings,
  Share2,
  Headphones,
  Package,
  Wallet,
  Ticket,
} from "lucide-react";
import ProfileDialog from "@/components/ProfileDialog";
import CouponDialog from "@/components/CouponDialog";
import BankAccountDialog from "@/components/BankAccountDialog";

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  
  // Dialog states
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"profile" | "password">("profile");
  const [couponDialogOpen, setCouponDialogOpen] = useState(false);
  const [bankDialogOpen, setBankDialogOpen] = useState(false);

  const loadData = () => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openProfileDialog = (mode: "profile" | "password") => {
    setDialogMode(mode);
    setProfileDialogOpen(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("demoUser");
    toast({
      title: "Logout Berhasil",
      description: "Sampai jumpa lagi!",
    });
    navigate("/auth");
  };

  if (!user) return null;

  const commissionRate = getCommissionRate(user.vipLevel);

  const menuItems = [
    // Admin menu - only show for admin users
    ...(user.isAdmin ? [{
      icon: Settings,
      label: "Admin Dashboard",
      description: "Kelola platform dan pengguna",
      href: "/admin",
      color: "text-destructive",
      isAdmin: true,
    }] : []),
    {
      icon: Edit2,
      label: "Update Profile",
      description: "Ubah nama dan nomor telepon",
      action: () => openProfileDialog("profile"),
      color: "text-primary",
    },
    {
      icon: Lock,
      label: "Change Password",
      description: "Ganti password akun Anda",
      action: () => openProfileDialog("password"),
      color: "text-accent",
    },
    {
      icon: Package,
      label: "My Investment",
      description: "Lihat investasi aktif Anda",
      href: "/account",
      color: "text-success",
    },
    {
      icon: Wallet,
      label: "History Transaction",
      description: "Riwayat recharge & withdraw",
      href: "/account",
      color: "text-vip-gold",
    },
    {
      icon: Landmark,
      label: "Account Bank",
      description: "Kelola rekening bank & e-wallet",
      action: () => setBankDialogOpen(true),
      color: "text-primary",
    },
    {
      icon: Ticket,
      label: "Klaim Kupon",
      description: "Masukkan kode kupon untuk bonus",
      action: () => setCouponDialogOpen(true),
      color: "text-vip-gold",
    },
    {
      icon: Share2,
      label: "Referral",
      description: "Bagikan kode referral Anda",
      href: "/team",
      color: "text-success",
    },
    {
      icon: Headphones,
      label: "Contact Us",
      description: "Hubungi customer service",
      action: () => {
        toast({
          title: "Hubungi Kami",
          description: "WhatsApp: +62 812-3456-7890 | Email: support@investasi.app",
        });
      },
      color: "text-accent",
    },
  ];

  return (
    <div className="space-y-6 p-4 pt-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground mb-1 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-primary" />
          Pengaturan Profil
        </h1>
        <p className="text-sm text-muted-foreground">Kelola data akun Anda</p>
      </div>

      {/* Profile Card */}
      <Card className="shadow-glow border-2 border-primary/30 overflow-hidden">
        <div className="h-20 bg-gradient-to-r from-primary/30 via-accent/20 to-vip-gold/30" />
        <CardContent className="p-6 -mt-10 relative">
          <div className="flex items-end gap-4 mb-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center border-4 border-card shadow-glow">
              <UserIcon className="w-10 h-10 text-foreground" />
            </div>
            <div className="flex-1 pb-2">
              <h2 className="text-xl font-bold text-foreground">{user.name}</h2>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="vip" className="gold-pulse">VIP {user.vipLevel}</Badge>
                {user.isAdmin && (
                  <Badge variant="outline" className="border-primary/50 text-primary">
                    <Shield className="w-3 h-3 mr-1" />
                    Admin
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-muted/50 rounded-lg p-3 border border-border/50">
              <p className="text-xs text-muted-foreground">Saldo</p>
              <p className="text-lg font-bold text-primary drop-shadow-[0_0_8px_hsl(185,100%,50%)]">
                {formatCurrency(user.balance)}
              </p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3 border border-border/50">
              <p className="text-xs text-muted-foreground">Total Pendapatan</p>
              <p className="text-lg font-bold text-success drop-shadow-[0_0_8px_hsl(145,100%,50%)]">
                {formatCurrency(user.totalIncome)}
              </p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3 border border-border/50">
              <p className="text-xs text-muted-foreground">Komisi Rate</p>
              <p className="text-lg font-bold text-accent drop-shadow-[0_0_8px_hsl(330,100%,60%)]">
                {(commissionRate * 100).toFixed(0)}%
              </p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3 border border-border/50">
              <p className="text-xs text-muted-foreground">Kode Referral</p>
              <p className="text-lg font-bold text-vip-gold drop-shadow-[0_0_8px_hsl(45,100%,55%)]">
                {user.referralCode}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Menu Items */}
      <Card className="shadow-card border-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Menu Akun
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {menuItems.map((item, index) => (
            <div key={item.label}>
              <button
                onClick={() => item.action ? item.action() : item.href && navigate(item.href)}
                className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg bg-muted flex items-center justify-center ${item.color}`}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <span className="font-medium text-foreground">{item.label}</span>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>
              {index < menuItems.length - 1 && <Separator />}
            </div>
          ))}
        </CardContent>
      </Card>


      {/* VIP Info */}
      <Card className="shadow-card border-vip-gold/30">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Crown className="w-5 h-5 text-vip-gold" />
            Info VIP Level
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border/50">
            <span className="text-sm">Level Anda</span>
            <Badge variant="vip" className="gold-pulse">VIP {user.vipLevel}</Badge>
          </div>
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border/50">
            <span className="text-sm">Komisi Referral</span>
            <span className="font-bold text-accent">{(commissionRate * 100).toFixed(0)}%</span>
          </div>
          <div className="text-xs text-muted-foreground p-3 bg-success/10 rounded-lg border border-success/20">
            💡 Ajak lebih banyak teman untuk naik level VIP dan dapatkan komisi lebih tinggi!
          </div>
        </CardContent>
      </Card>

      {/* Logout */}
      <Card className="shadow-card border-destructive/20">
        <CardContent className="p-0">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-between p-4 hover:bg-destructive/10 transition-colors text-destructive"
          >
            <span className="font-medium flex items-center gap-2">
              <LogOut className="w-4 h-4" />
              Logout
            </span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </CardContent>
      </Card>

      {/* Demo Notice */}
      <div className="text-center text-xs text-muted-foreground p-4 pb-8">
        <p>🎮 Mode Demo - Data disimpan di browser</p>
      </div>

      {/* Profile Dialog */}
      <ProfileDialog
        open={profileDialogOpen}
        onOpenChange={setProfileDialogOpen}
        mode={dialogMode}
        onSuccess={loadData}
      />

      {/* Coupon Dialog */}
      <CouponDialog
        open={couponDialogOpen}
        onOpenChange={setCouponDialogOpen}
        onSuccess={loadData}
      />

      {/* Bank Account Dialog */}
      <BankAccountDialog
        open={bankDialogOpen}
        onOpenChange={setBankDialogOpen}
        onSuccess={loadData}
      />
    </div>
  );
};

export default Profile;