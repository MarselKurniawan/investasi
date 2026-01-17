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
} from "lucide-react";

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
    setIsEditing(false);
    toast({
      title: "Profil Diperbarui",
      description: "Data profil berhasil disimpan",
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

    // In demo mode, we just show success
    setIsChangingPassword(false);
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

  return (
    <div className="space-y-6 p-4 pt-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground mb-1">Pengaturan Profil</h1>
        <p className="text-sm text-muted-foreground">Kelola data akun Anda</p>
      </div>

      {/* Profile Card */}
      <Card className="shadow-elegant border-2 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center">
              <UserIcon className="w-8 h-8 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-foreground">{user.name}</h2>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="vip">VIP {user.vipLevel}</Badge>
                {user.isAdmin && (
                  <Badge variant="outline" className="text-primary">
                    <Shield className="w-3 h-3 mr-1" />
                    Admin
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 bg-muted rounded-lg p-4">
            <div>
              <p className="text-xs text-muted-foreground">Saldo</p>
              <p className="text-lg font-bold text-foreground">{formatCurrency(user.balance)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Pendapatan</p>
              <p className="text-lg font-bold text-success">{formatCurrency(user.totalIncome)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Komisi Rate</p>
              <p className="text-lg font-bold text-accent">{(commissionRate * 100).toFixed(0)}%</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Kode Referral</p>
              <p className="text-lg font-bold text-primary">{user.referralCode}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Profile */}
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-primary" />
              Edit Profil
            </CardTitle>
            {!isEditing && (
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                Edit
              </Button>
            )}
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
                disabled={!isEditing}
                placeholder="Nama lengkap"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Email</Label>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <Input value={user.email} disabled className="bg-muted" />
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
                disabled={!isEditing}
                placeholder="08xxxxxxxxxx"
              />
            </div>
          </div>

          {isEditing && (
            <div className="flex gap-2 pt-2">
              <Button className="flex-1" onClick={handleSaveProfile}>
                <Save className="w-4 h-4 mr-2" />
                Simpan
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  setEditName(user.name);
                  setEditPhone(user.phone || "");
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" />
              Ganti Password
            </CardTitle>
            {!isChangingPassword && (
              <Button variant="outline" size="sm" onClick={() => setIsChangingPassword(true)}>
                Ganti
              </Button>
            )}
          </div>
        </CardHeader>
        {isChangingPassword && (
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Password Baru</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
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
                  setIsChangingPassword(false);
                  setNewPassword("");
                  setConfirmPassword("");
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* VIP Info */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Crown className="w-5 h-5 text-vip-gold" />
            Info VIP Level
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <span className="text-sm">Level Anda</span>
            <Badge variant="vip">VIP {user.vipLevel}</Badge>
          </div>
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <span className="text-sm">Komisi Referral</span>
            <span className="font-bold text-accent">{(commissionRate * 100).toFixed(0)}%</span>
          </div>
          <div className="text-xs text-muted-foreground p-3 bg-success/10 rounded-lg">
            💡 Ajak lebih banyak teman untuk naik level VIP dan dapatkan komisi lebih tinggi!
          </div>
        </CardContent>
      </Card>

      {/* Account Actions */}
      <Card className="shadow-card">
        <CardContent className="p-0">
          <button
            onClick={() => navigate("/statistics")}
            className="w-full flex items-center justify-between p-4 hover:bg-muted transition-colors"
          >
            <span className="font-medium">Lihat Statistik</span>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
          <Separator />
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
      <div className="text-center text-xs text-muted-foreground p-4">
        <p>🎮 Mode Demo - Data disimpan di browser</p>
      </div>
    </div>
  );
};

export default Profile;
