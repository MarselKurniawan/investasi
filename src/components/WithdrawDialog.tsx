import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { addTransaction, updateUser, getCurrentUser, formatCurrency } from "@/lib/store";
import { ArrowDownRight, Building2, Clock, AlertCircle } from "lucide-react";

interface WithdrawDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  balance: number;
  onSuccess: () => void;
}

interface BankData {
  bankName: string;
  bankAccount: string;
  bankAccountName: string;
}

const WithdrawDialog = ({ open, onOpenChange, balance, onSuccess }: WithdrawDialogProps) => {
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [bankData, setBankData] = useState<BankData | null>(null);

  useEffect(() => {
    if (open) {
      const user = getCurrentUser();
      if (user) {
        const savedBank = localStorage.getItem(`bank_${user.id}`);
        if (savedBank) {
          setBankData(JSON.parse(savedBank));
        } else {
          setBankData(null);
        }
      }
    }
  }, [open]);

  const handleSubmit = async () => {
    const amountNum = parseInt(amount);
    if (!amountNum || amountNum < 50000) {
      toast({
        title: "Error",
        description: "Minimum withdraw adalah Rp 50.000",
        variant: "destructive",
      });
      return;
    }

    if (amountNum > balance) {
      toast({
        title: "Error",
        description: "Saldo tidak mencukupi",
        variant: "destructive",
      });
      return;
    }

    if (!bankData) {
      toast({
        title: "Error",
        description: "Silakan atur rekening bank terlebih dahulu di halaman Profile",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Deduct balance immediately but set status to pending for admin approval
    const user = getCurrentUser();
    if (user) {
      updateUser({ 
        balance: user.balance - amountNum,
      });
    }

    // Add transaction with pending status - requires admin approval
    addTransaction({
      userId: "",
      type: "withdraw",
      amount: amountNum,
      status: "pending",
      description: `Withdraw ke ${bankData.bankName} - ${bankData.bankAccount} (${bankData.bankAccountName})`,
    });

    toast({
      title: "Permintaan Withdraw Dikirim",
      description: `${formatCurrency(amountNum)} menunggu persetujuan admin.`,
    });

    setIsLoading(false);
    setAmount("");
    onOpenChange(false);
    onSuccess();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowDownRight className="w-5 h-5 text-accent" />
            Withdraw Saldo
          </DialogTitle>
          <DialogDescription>
            Tarik saldo ke rekening bank Anda
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Balance Info */}
          <div className="bg-muted rounded-lg p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Saldo Tersedia</p>
              <p className="text-xl font-bold text-foreground">{formatCurrency(balance)}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAmount(balance.toString())}
            >
              Withdraw Semua
            </Button>
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <Label>Jumlah Withdraw</Label>
            <Input
              type="number"
              placeholder="Masukkan jumlah"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="text-lg font-semibold"
            />
          </div>

          {/* Bank Details from Profile */}
          <div className="space-y-3 pt-2 border-t border-border">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Building2 className="w-4 h-4" />
              Rekening Tujuan
            </div>

            {bankData ? (
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Bank</span>
                  <span className="text-sm font-medium">{bankData.bankName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">No. Rekening</span>
                  <span className="text-sm font-medium">{bankData.bankAccount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Nama</span>
                  <span className="text-sm font-medium">{bankData.bankAccountName}</span>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-2 p-3 bg-destructive/10 rounded-lg">
                <AlertCircle className="w-4 h-4 text-destructive mt-0.5" />
                <p className="text-xs text-muted-foreground">
                  Belum ada data rekening. Silakan atur rekening bank Anda terlebih dahulu di halaman <span className="text-primary font-medium">Profile → Account Bank</span>.
                </p>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex items-start gap-2 p-3 bg-accent/10 rounded-lg">
            <Clock className="w-4 h-4 text-accent mt-0.5" />
            <p className="text-xs text-muted-foreground">
              Withdraw memerlukan persetujuan admin. Proses 1-24 jam kerja.
            </p>
          </div>

          <Button
            className="w-full"
            size="lg"
            onClick={handleSubmit}
            disabled={isLoading || !amount || !bankData}
          >
            {isLoading ? "Memproses..." : "Ajukan Withdraw"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WithdrawDialog;
