import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { getCurrentUser, updateUser } from "@/lib/store";
import { User, Mail, Phone, Save, Eye, EyeOff, Lock } from "lucide-react";

interface ProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "profile" | "password";
  onSuccess: () => void;
}

const ProfileDialog = ({ open, onOpenChange, mode, onSuccess }: ProfileDialogProps) => {
  const { toast } = useToast();
  
  // Profile form
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [userEmail, setUserEmail] = useState("");
  
  // Password form
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (open) {
      const user = getCurrentUser();
      if (user) {
        setEditName(user.name);
        setEditPhone(user.phone || "");
        setUserEmail(user.email);
      }
      // Reset password fields
      setNewPassword("");
      setConfirmPassword("");
    }
  }, [open]);

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

    toast({
      title: "Profil Diperbarui",
      description: "Data profil berhasil disimpan",
    });
    
    onOpenChange(false);
    onSuccess();
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

    toast({
      title: "Password Diperbarui",
      description: "Password baru berhasil disimpan",
    });
    
    onOpenChange(false);
    onSuccess();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {mode === "profile" ? (
              <>
                <User className="w-5 h-5 text-primary" />
                Update Profile
              </>
            ) : (
              <>
                <Lock className="w-5 h-5 text-accent" />
                Change Password
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {mode === "profile" ? (
            <>
              <div className="space-y-2">
                <Label>Nama Lengkap</Label>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
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
                  <Input value={userEmail} disabled className="bg-muted/50" />
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
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Batal
                </Button>
              </div>
            </>
          ) : (
            <>
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
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Batal
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileDialog;