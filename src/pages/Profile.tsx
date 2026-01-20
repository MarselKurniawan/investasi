import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  getCurrentUser,
  updateUser,
  formatCurrency,
  User,
  getCommissionRate,
} from "@/lib/store";
import {
  User as UserIcon,
  Mail,
  Phone,
  Crown,
  Shield,
  Edit2,
  Save,
  X,
  LogOut,
  ChevronRight,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  BarChart3,
  Users,
  Wallet,
  TrendingUp,
  Landmark,
  Share2,
  Headphones,
  Package,
} from "lucide-react";

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  // Bank form
  const [bankName, setBankName] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [bankAccountName, setBankAccountName] = useState("");

  // Edit form
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");

  // Password form
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const loadData = () => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      setEditName(currentUser.name);
      setEditPhone(currentUser.phone || "");
      // Load bank info from localStorage
      const savedBank = localStorage.getItem(`bank_${currentUser.id}`);
      if (savedBank) {
        const bankData = JSON.parse(savedBank);
        setBankName(bankData.bankName || "");
        setBankAccount(bankData.bankAccount || "");
        setBankAccountName(bankData.bankAccountName || "");
      }
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveProfile = () => {
    if (!editName.trim()) {
      toast({
        title: "Error",
        description: "Nama tidak boleh kosong",
        variant: "destructive",
      });
      return;
    }

    updateUser({
      name: editName.trim(),
      phone: editPhone.trim(),
    });

    loadData();
    setActiveSection(null);
    toast({
      title: "Profil Diperbarui",
      description: "Data profil berhasil disimpan",
    });
  };

  const handleSaveBank = () => {
    if (!user) return;
    
    if (!bankName.trim() || !bankAccount.trim() || !bankAccountName.trim()) {
      toast({
        title: "Error",
        description: "Semua field harus diisi",
        variant: "destructive",
      });
      return;
    }

    localStorage.setItem(`bank_${user.id}`, JSON.stringify({
      bankName: bankName.trim(),
      bankAccount: bankAccount.trim(),
      bankAccountName: bankAccountName.trim(),
    }));

    setActiveSection(null);
    toast({
      title: "Rekening Disimpan",
      description: "Data rekening bank berhasil disimpan",
    });
  };

  const handleChangePassword = () => {
    if (newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password minimal 6 karakter",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Password tidak cocok",
        variant: "destructive",
      });
      return;
    }

    setActiveSection(null);
    setNewPassword("");
    setConfirmPassword("");
    toast({
      title: "Password Diperbarui",
      description: "Password baru berhasil disimpan",
    });
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
    {
      icon: Edit2,
      label: "Update Profile",
      description: "Ubah nama dan nomor telepon",
      action: () => setActiveSection("profile"),
      color: "text-primary",
    },
    {
      icon: Lock,
      label: "Change Password",
      description: "Ganti password akun Anda",
      action: () => setActiveSection("password"),
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
      description: "Kelola rekening bank Anda",
      action: () => setActiveSection("bank"),
      color: "text-primary",
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

      {/* Update Profile Section */}
      {activeSection === "profile" && (
        <Card className="shadow-card border-primary/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-primary" />
                Update Profile
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setActiveSection(null)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Nama Lengkap</Label>
              <div className="flex items-center gap-2">
                <UserIcon className="w-4 h-4 text-muted-foreground" />
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Nama lengkap"
                  className="bg-muted/50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <Input value={user.email} disabled className="bg-muted/50" />
              </div>
              <p className="text-xs text-muted-foreground">Email tidak dapat diubah</p>
            </div>

            <div className="space-y-2">
              <Label>Nomor Telepon</Label>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <Input
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="08xxxxxxxxxx"
                  className="bg-muted/50"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button className="flex-1" onClick={handleSaveProfile}>
                <Save className="w-4 h-4 mr-2" />
                Simpan
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setActiveSection(null);
                  setEditName(user.name);
                  setEditPhone(user.phone || "");
                }}
              >
                Batal
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Change Password Section */}
      {activeSection === "password" && (
        <Card className="shadow-card border-primary/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Lock className="w-5 h-5 text-primary" />
                Change Password
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setActiveSection(null)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Password Baru</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="bg-muted/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Konfirmasi Password</Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ulangi password baru"
                className="bg-muted/50"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button className="flex-1" onClick={handleChangePassword}>
                <Save className="w-4 h-4 mr-2" />
                Simpan Password
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setActiveSection(null);
                  setNewPassword("");
                  setConfirmPassword("");
                }}
              >
                Batal
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Account Bank Section */}
      {activeSection === "bank" && (
        <Card className="shadow-card border-primary/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Landmark className="w-5 h-5 text-primary" />
                Account Bank
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setActiveSection(null)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Nama Bank</Label>
              <Input
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="Contoh: BCA, Mandiri, BNI"
                className="bg-muted/50"
              />
            </div>

            <div className="space-y-2">
              <Label>Nomor Rekening</Label>
              <Input
                value={bankAccount}
                onChange={(e) => setBankAccount(e.target.value)}
                placeholder="Masukkan nomor rekening"
                className="bg-muted/50"
              />
            </div>

            <div className="space-y-2">
              <Label>Nama Pemilik Rekening</Label>
              <Input
                value={bankAccountName}
                onChange={(e) => setBankAccountName(e.target.value)}
                placeholder="Nama sesuai rekening"
                className="bg-muted/50"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button className="flex-1" onClick={handleSaveBank}>
                <Save className="w-4 h-4 mr-2" />
                Simpan Rekening
              </Button>
              <Button variant="outline" onClick={() => setActiveSection(null)}>
                Batal
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

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
    </div>
  );
};

export default Profile;
