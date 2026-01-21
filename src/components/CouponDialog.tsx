import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { getCurrentUser, updateUser, addTransaction, formatCurrency } from "@/lib/store";
import { Ticket, Gift, Sparkles } from "lucide-react";

interface CouponDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

// Get used coupons from localStorage
const getUsedCoupons = (userId: string): string[] => {
  const stored = localStorage.getItem(`used_coupons_${userId}`);
  return stored ? JSON.parse(stored) : [];
};

// Save used coupon
const saveUsedCoupon = (userId: string, couponCode: string): void => {
  const used = getUsedCoupons(userId);
  used.push(couponCode);
  localStorage.setItem(`used_coupons_${userId}`, JSON.stringify(used));
};

// Get admin coupons
const getAdminCoupons = (): { code: string; used: boolean }[] => {
  const stored = localStorage.getItem("admin_coupons");
  return stored ? JSON.parse(stored) : [];
};

// Check if coupon is valid
const validateCoupon = (code: string, userId: string): { valid: boolean; message: string } => {
  const usedCoupons = getUsedCoupons(userId);
  const adminCoupons = getAdminCoupons();
  
  // Check if coupon exists in admin coupons
  const coupon = adminCoupons.find(c => c.code.toUpperCase() === code.toUpperCase());
  
  if (!coupon) {
    return { valid: false, message: "Kode kupon tidak valid" };
  }
  
  if (coupon.used) {
    return { valid: false, message: "Kupon sudah digunakan" };
  }
  
  if (usedCoupons.includes(code.toUpperCase())) {
    return { valid: false, message: "Anda sudah menggunakan kupon ini" };
  }
  
  return { valid: true, message: "" };
};

// Mark coupon as used globally
const markCouponUsed = (code: string): void => {
  const coupons = getAdminCoupons();
  const idx = coupons.findIndex(c => c.code.toUpperCase() === code.toUpperCase());
  if (idx !== -1) {
    coupons[idx].used = true;
    localStorage.setItem("admin_coupons", JSON.stringify(coupons));
  }
};

const CouponDialog = ({ open, onOpenChange, onSuccess }: CouponDialogProps) => {
  const { toast } = useToast();
  const [couponCode, setCouponCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [reward, setReward] = useState<number | null>(null);
  const [showReward, setShowReward] = useState(false);

  const handleSubmit = async () => {
    if (!couponCode.trim()) {
      toast({
        title: "Error",
        description: "Masukkan kode kupon",
        variant: "destructive",
      });
      return;
    }

    const user = getCurrentUser();
    if (!user) return;

    const validation = validateCoupon(couponCode, user.id);
    if (!validation.valid) {
      toast({
        title: "Error",
        description: validation.message,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Generate random reward between 100 and 999
    const rewardAmount = Math.floor(Math.random() * 900) + 100;
    
    // Update user balance
    updateUser({
      balance: user.balance + rewardAmount,
    });

    // Add transaction
    addTransaction({
      userId: user.id,
      type: "income",
      amount: rewardAmount,
      status: "success",
      description: `Hadiah kupon: ${couponCode.toUpperCase()}`,
    });

    // Mark coupon as used
    saveUsedCoupon(user.id, couponCode.toUpperCase());
    markCouponUsed(couponCode);

    setReward(rewardAmount);
    setShowReward(true);
    setIsLoading(false);
  };

  const handleClose = () => {
    setCouponCode("");
    setReward(null);
    setShowReward(false);
    onOpenChange(false);
    if (reward) {
      onSuccess();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ticket className="w-5 h-5 text-accent" />
            Kode Kupon
          </DialogTitle>
          <DialogDescription>
            Masukkan kode kupon untuk mendapatkan hadiah
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {showReward && reward ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-vip-gold to-accent rounded-full flex items-center justify-center animate-bounce">
                <Gift className="w-10 h-10 text-white" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <Sparkles className="w-5 h-5 text-vip-gold" />
                  <h3 className="text-xl font-bold text-foreground">Selamat!</h3>
                  <Sparkles className="w-5 h-5 text-vip-gold" />
                </div>
                <p className="text-sm text-muted-foreground">Anda mendapatkan hadiah</p>
                <p className="text-3xl font-bold text-success drop-shadow-[0_0_15px_hsl(145,100%,50%)]">
                  {formatCurrency(reward)}
                </p>
              </div>
              <Button className="w-full mt-4" onClick={handleClose}>
                Klaim Hadiah
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label>Kode Kupon</Label>
                <Input
                  placeholder="Masukkan kode kupon"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="text-center text-lg font-mono tracking-wider"
                />
              </div>

              <div className="flex items-start gap-2 p-3 bg-accent/10 rounded-lg">
                <Gift className="w-4 h-4 text-accent mt-0.5" />
                <p className="text-xs text-muted-foreground">
                  Dapatkan kode kupon dari admin untuk mendapatkan hadiah bonus!
                </p>
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={handleSubmit}
                disabled={isLoading || !couponCode.trim()}
              >
                {isLoading ? "Memproses..." : "Klaim Kupon"}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CouponDialog;