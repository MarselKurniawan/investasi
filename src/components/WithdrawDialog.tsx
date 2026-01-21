import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { addTransaction, updateUser, getCurrentUser, formatCurrency } from "@/lib/store";
import { ArrowDownRight, Building2, Clock, AlertCircle, Wallet, Check, Landmark } from "lucide-react";

interface WithdrawDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  balance: number;
  onSuccess: () => void;
}

interface BankAccount {
  id: string;
  type: "bank" | "ewallet";
  provider: string;
  accountNumber: string;
  accountName: string;
}

const getBankAccounts = (userId: string): BankAccount[] => {
  const stored = localStorage.getItem(`bank_accounts_${userId}`);
  return stored ? JSON.parse(stored) : [];
};

const WithdrawDialog = ({ open, onOpenChange, balance, onSuccess }: WithdrawDialogProps) => {
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(null);

  useEffect(() => {
    if (open) {
      const user = getCurrentUser();
      if (user) {
        const savedAccounts = getBankAccounts(user.id);
        setAccounts(savedAccounts);
        // Auto-select first account if available
        if (savedAccounts.length > 0 && !selectedAccount) {
          setSelectedAccount(savedAccounts[0]);
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

    if (!selectedAccount) {
      toast({
        title: "Error",
        description: "Silakan pilih rekening tujuan",
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
      description: `Withdraw ke ${selectedAccount.provider} - ${selectedAccount.accountNumber} (${selectedAccount.accountName})`,
    });

    toast({
      title: "Permintaan Withdraw Dikirim",
      description: `${formatCurrency(amountNum)} menunggu persetujuan admin.`,
    });

    setIsLoading(false);
    setAmount("");
    setSelectedAccount(null);
    onOpenChange(false);
    onSuccess();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowDownRight className="w-5 h-5 text-accent" />
            Withdraw Saldo
          </DialogTitle>
          <DialogDescription>
            Tarik saldo ke rekening bank atau e-wallet Anda
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col gap-4 py-4">
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

          {/* Account Selection */}
          <div className="space-y-3 border-t border-border pt-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Building2 className="w-4 h-4" />
              Pilih Rekening Tujuan
            </div>

            {accounts.length > 0 ? (
              <ScrollArea className="max-h-[150px]">
                <div className="space-y-2 pr-4">
                  {accounts.map((account) => (
                    <button
                      key={account.id}
                      onClick={() => setSelectedAccount(account)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
                        selectedAccount?.id === account.id
                          ? "border-primary bg-primary/10"
                          : "border-border/50 bg-muted/50 hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          account.type === "bank" 
                            ? "bg-primary/20 text-primary" 
                            : "bg-accent/20 text-accent"
                        }`}>
                          {account.type === "bank" ? (
                            <Landmark className="w-5 h-5" />
                          ) : (
                            <Wallet className="w-5 h-5" />
                          )}
                        </div>
                        <div className="text-left">
                          <p className="font-medium text-sm text-foreground">{account.provider}</p>
                          <p className="text-xs text-muted-foreground">{account.accountNumber}</p>
                        </div>
                      </div>
                      {selectedAccount?.id === account.id && (
                        <Check className="w-5 h-5 text-primary" />
                      )}
                    </button>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="flex items-start gap-2 p-3 bg-destructive/10 rounded-lg">
                <AlertCircle className="w-4 h-4 text-destructive mt-0.5" />
                <p className="text-xs text-muted-foreground">
                  Belum ada rekening tersimpan. Silakan tambahkan rekening di halaman <span className="text-primary font-medium">Profil → Account Bank</span>.
                </p>
              </div>
            )}
          </div>

          {/* Selected Account Summary */}
          {selectedAccount && (
            <div className="bg-success/10 rounded-lg p-3 border border-success/30">
              <p className="text-xs text-muted-foreground mb-1">Withdraw ke:</p>
              <p className="font-medium text-sm text-foreground">
                {selectedAccount.provider} - {selectedAccount.accountNumber}
              </p>
              <p className="text-xs text-muted-foreground">{selectedAccount.accountName}</p>
            </div>
          )}

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
            disabled={isLoading || !amount || !selectedAccount}
          >
            {isLoading ? "Memproses..." : "Ajukan Withdraw"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WithdrawDialog;
