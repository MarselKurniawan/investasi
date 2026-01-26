import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Product, formatCurrency, createInvestment, createTransaction, updateProfile, processReferralCommission } from "@/lib/database";
import { useAuth } from "@/hooks/useAuth";
import { TrendingUp, CheckCircle2, Minus, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface InvestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  balance: number;
  onSuccess: () => void;
}

const InvestDialog = ({ open, onOpenChange, product, balance, onSuccess }: InvestDialogProps) => {
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  const totalPrice = product.price * quantity;
  const totalDailyIncome = product.daily_income * quantity;
  const totalIncome = product.total_income * quantity;
  const canInvest = balance >= totalPrice;

  const handleInvest = async () => {
    if (!canInvest) {
      toast({
        title: "Saldo Tidak Cukup",
        description: `Anda membutuhkan ${formatCurrency(totalPrice - balance)} lagi.`,
        variant: "destructive",
      });
      return;
    }

    if (!user || !profile) {
      toast({
        title: "Error",
        description: "Silakan login terlebih dahulu",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Deduct balance
      await updateProfile(user.id, {
        balance: profile.balance - totalPrice,
      });

      // Create investment with quantity multiplied values
      await createInvestment({
        user_id: user.id,
        product_id: product.id,
        product_name: quantity > 1 ? `${product.name} (x${quantity})` : product.name,
        amount: totalPrice,
        daily_income: totalDailyIncome,
        total_income: totalIncome,
        validity: product.validity,
        days_remaining: product.validity,
        total_earned: 0,
        status: 'active',
      });

      // Create transaction record
      await createTransaction({
        user_id: user.id,
        type: 'invest',
        amount: totalPrice,
        status: 'success',
        description: `Investasi ${product.name}${quantity > 1 ? ` (x${quantity})` : ''}`,
      });

      // Process referral commission for upline (commission on purchase)
      await processReferralCommission(user.id, totalPrice);

      setIsLoading(false);
      setSuccess(true);

      setTimeout(() => {
        setSuccess(false);
        setQuantity(1);
        onOpenChange(false);
        onSuccess();
      }, 2000);
    } catch (error) {
      setIsLoading(false);
      toast({
        title: "Error",
        description: "Gagal memproses investasi. Silakan coba lagi.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!isLoading) { setSuccess(false); setQuantity(1); onOpenChange(o); } }}>
      <DialogContent className="sm:max-w-md">
        {success ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-success" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground">Investasi Berhasil!</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Anda akan mulai mendapat income harian
              </p>
            </div>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Konfirmasi Investasi
              </DialogTitle>
              <DialogDescription>
                Review detail investasi Anda
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Product Info */}
              <div className="bg-muted rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-foreground">{product.name}</h3>
                    <Badge variant="vip" className="text-xs mt-1">VIP {product.vip_level}</Badge>
                  </div>
                  <p className="text-lg font-bold text-primary">{formatCurrency(product.price)}/unit</p>
                </div>

                {/* Quantity Selector */}
                <div className="flex items-center justify-between py-3 border-t border-b border-border">
                  <span className="text-sm font-medium text-foreground">Jumlah</span>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Input
                      type="number"
                      min={1}
                      max={99}
                      value={quantity}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 1;
                        setQuantity(Math.max(1, Math.min(99, val)));
                      }}
                      className="w-16 h-8 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setQuantity(Math.min(99, quantity + 1))}
                      disabled={quantity >= 99}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2 pt-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Penghasilan Harian</span>
                    <span className="font-semibold text-success">
                      {formatCurrency(totalDailyIncome)}
                      {quantity > 1 && <span className="text-xs text-muted-foreground ml-1">({quantity}x)</span>}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Masa Berlaku</span>
                    <span className="font-semibold">{product.validity} Hari</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Penghasilan</span>
                    <span className="font-bold text-accent">
                      {formatCurrency(totalIncome)}
                      {quantity > 1 && <span className="text-xs text-muted-foreground ml-1">({quantity}x)</span>}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm pt-2">
                    <span className="text-muted-foreground">ROI</span>
                    <span className="font-bold text-success">
                      +{((product.total_income / product.price - 1) * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Total Price */}
              <div className="bg-primary/10 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-foreground">Total Investasi</span>
                  <span className="text-2xl font-bold text-primary">{formatCurrency(totalPrice)}</span>
                </div>
              </div>

              {/* Balance Check */}
              <div className={`rounded-lg p-4 ${canInvest ? 'bg-success/10' : 'bg-destructive/10'}`}>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-muted-foreground">Saldo Anda</p>
                    <p className="text-lg font-bold">{formatCurrency(balance)}</p>
                  </div>
                  {!canInvest && (
                    <Badge variant="destructive">Saldo Kurang</Badge>
                  )}
                </div>
                {!canInvest && (
                  <p className="text-xs text-destructive mt-2">
                    Butuh {formatCurrency(totalPrice - balance)} lagi untuk investasi ini
                  </p>
                )}
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={handleInvest}
                disabled={isLoading || !canInvest}
              >
                {isLoading ? "Memproses..." : `Investasi ${formatCurrency(totalPrice)}`}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default InvestDialog;
