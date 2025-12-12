import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { addInvestment, addTransaction, updateUser, getCurrentUser, formatCurrency } from "@/lib/store";
import { TrendingUp, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Product {
  id: number;
  name: string;
  price: number;
  dailyIncome: number;
  validity: number;
  totalIncome: number;
  vipLevel: number;
}

interface InvestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  balance: number;
  onSuccess: () => void;
}

const InvestDialog = ({ open, onOpenChange, product, balance, onSuccess }: InvestDialogProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!product) return null;

  const canInvest = balance >= product.price;

  const handleInvest = async () => {
    if (!canInvest) {
      toast({
        title: "Saldo Tidak Cukup",
        description: `Anda membutuhkan ${formatCurrency(product.price - balance)} lagi.`,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const user = getCurrentUser();
    if (!user) return;

    // Deduct balance and add investment
    updateUser({
      balance: user.balance - product.price,
      totalInvest: user.totalInvest + product.price,
    });

    addInvestment({
      userId: user.id,
      productId: product.id,
      productName: product.name,
      amount: product.price,
      dailyIncome: product.dailyIncome,
      validity: product.validity,
      daysRemaining: product.validity,
      totalEarned: 0,
      status: 'active',
    });

    addTransaction({
      userId: user.id,
      type: 'invest',
      amount: -product.price,
      status: 'success',
      description: `Investasi ${product.name}`,
    });

    setIsLoading(false);
    setSuccess(true);

    setTimeout(() => {
      setSuccess(false);
      onOpenChange(false);
      onSuccess();
    }, 2000);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!isLoading) { setSuccess(false); onOpenChange(o); } }}>
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
                    <Badge variant="vip" className="text-xs mt-1">VIP {product.vipLevel}</Badge>
                  </div>
                  <p className="text-xl font-bold text-primary">{formatCurrency(product.price)}</p>
                </div>

                <div className="space-y-2 pt-3 border-t border-border">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Penghasilan Harian</span>
                    <span className="font-semibold text-success">{formatCurrency(product.dailyIncome)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Masa Berlaku</span>
                    <span className="font-semibold">{product.validity} Hari</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Penghasilan</span>
                    <span className="font-bold text-accent">{formatCurrency(product.totalIncome)}</span>
                  </div>
                  <div className="flex justify-between text-sm pt-2">
                    <span className="text-muted-foreground">ROI</span>
                    <span className="font-bold text-success">
                      +{((product.totalIncome / product.price - 1) * 100).toFixed(0)}%
                    </span>
                  </div>
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
                    Butuh {formatCurrency(product.price - balance)} lagi untuk investasi ini
                  </p>
                )}
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={handleInvest}
                disabled={isLoading || !canInvest}
              >
                {isLoading ? "Memproses..." : `Investasi ${formatCurrency(product.price)}`}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default InvestDialog;
