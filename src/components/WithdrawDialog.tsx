import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { addTransaction, updateUser, getCurrentUser, formatCurrency } from "@/lib/store";
import { ArrowDownRight, Building2, AlertCircle } from "lucide-react";

interface WithdrawDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  balance: number;
  onSuccess: () => void;
}

const WithdrawDialog = ({ open, onOpenChange, balance, onSuccess }: WithdrawDialogProps) => {
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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

    if (!bankName || !accountNumber || !accountName) {
      toast({
        title: "Error",
        description: "Lengkapi data rekening bank",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Deduct balance immediately
    const user = getCurrentUser();
    if (user) {
      updateUser({ balance: user.balance - amountNum });
    }

    addTransaction({
      userId: "",
      type: "withdraw",
      amount: amountNum,
      status: "pending",
      description: `Withdraw ke ${bankName} - ${accountNumber}`,
    });

    toast({
      title: "Withdraw Diajukan!",
      description: `Permintaan withdraw ${formatCurrency(amountNum)} sedang diproses.`,
    });

    setIsLoading(false);
    setAmount("");
    setBankName("");
    setAccountNumber("");
    setAccountName("");
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

          {/* Bank Details */}
          <div className="space-y-3 pt-2 border-t border-border">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Building2 className="w-4 h-4" />
              Detail Rekening Bank
            </div>

            <div className="space-y-2">
              <Label>Nama Bank</Label>
              <Input
                placeholder="BCA, BNI, Mandiri, dll"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Nomor Rekening</Label>
              <Input
                type="text"
                placeholder="Masukkan nomor rekening"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Nama Pemilik Rekening</Label>
              <Input
                placeholder="Sesuai buku rekening"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
              />
            </div>
          </div>

          {/* Warning */}
          <div className="flex items-start gap-2 p-3 bg-accent/10 rounded-lg">
            <AlertCircle className="w-4 h-4 text-accent mt-0.5" />
            <p className="text-xs text-muted-foreground">
              Proses withdraw membutuhkan waktu 1-24 jam kerja. Pastikan data rekening sudah benar.
            </p>
          </div>

          <Button
            className="w-full"
            size="lg"
            onClick={handleSubmit}
            disabled={isLoading || !amount || !bankName || !accountNumber || !accountName}
          >
            {isLoading ? "Memproses..." : "Ajukan Withdraw"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WithdrawDialog;
