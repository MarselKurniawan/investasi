import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { addTransaction, updateUser, getCurrentUser, formatCurrency } from "@/lib/store";
import { ArrowUpRight, CreditCard, Wallet, Building2, CheckCircle } from "lucide-react";

interface RechargeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const RechargeDialog = ({ open, onOpenChange, onSuccess }: RechargeDialogProps) => {
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const presetAmounts = [100000, 250000, 500000, 1000000, 2500000, 5000000];

  const paymentMethods = [
    { id: "bank", name: "Transfer Bank", icon: Building2 },
    { id: "ewallet", name: "E-Wallet", icon: Wallet },
    { id: "card", name: "Kartu Kredit", icon: CreditCard },
  ];

  const handleSubmit = async () => {
    const amountNum = parseInt(amount);
    if (!amountNum || amountNum < 50000) {
      toast({
        title: "Error",
        description: "Minimum recharge adalah Rp 50.000",
        variant: "destructive",
      });
      return;
    }

    if (!method) {
      toast({
        title: "Error",
        description: "Pilih metode pembayaran",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Auto approve: Update balance immediately
    const user = getCurrentUser();
    if (user) {
      updateUser({ 
        balance: user.balance + amountNum,
        totalRecharge: user.totalRecharge + amountNum 
      });
    }

    // Add transaction with success status
    addTransaction({
      userId: "",
      type: "recharge",
      amount: amountNum,
      status: "success",
      description: `Recharge via ${method}`,
    });

    toast({
      title: "Recharge Berhasil!",
      description: `Saldo ${formatCurrency(amountNum)} telah ditambahkan.`,
    });

    setIsLoading(false);
    setAmount("");
    setMethod(null);
    onOpenChange(false);
    onSuccess();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowUpRight className="w-5 h-5 text-success" />
            Recharge Saldo
          </DialogTitle>
          <DialogDescription>
            Top up saldo untuk mulai berinvestasi
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Amount Input */}
          <div className="space-y-3">
            <Label>Jumlah Recharge</Label>
            <Input
              type="number"
              placeholder="Masukkan jumlah"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="text-lg font-semibold"
            />
            <div className="grid grid-cols-3 gap-2">
              {presetAmounts.map((preset) => (
                <Button
                  key={preset}
                  variant={amount === preset.toString() ? "default" : "outline"}
                  size="sm"
                  onClick={() => setAmount(preset.toString())}
                  className="text-xs"
                >
                  {formatCurrency(preset)}
                </Button>
              ))}
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-3">
            <Label>Metode Pembayaran</Label>
            <div className="grid grid-cols-3 gap-2">
              {paymentMethods.map((pm) => (
                <Button
                  key={pm.id}
                  variant={method === pm.id ? "default" : "outline"}
                  className="flex flex-col h-auto py-4 gap-2"
                  onClick={() => setMethod(pm.id)}
                >
                  <pm.icon className="w-5 h-5" />
                  <span className="text-xs">{pm.name}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Summary */}
          {amount && method && (
            <div className="bg-muted rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Jumlah</span>
                <span className="font-semibold">{formatCurrency(parseInt(amount) || 0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Biaya Admin</span>
                <span className="font-semibold text-success">Gratis</span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t border-border">
                <span className="font-medium">Total</span>
                <span className="font-bold text-primary">{formatCurrency(parseInt(amount) || 0)}</span>
              </div>
            </div>
          )}

          <Button
            className="w-full"
            size="lg"
            onClick={handleSubmit}
            disabled={isLoading || !amount || !method}
          >
            {isLoading ? "Memproses..." : "Konfirmasi Recharge"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RechargeDialog;
