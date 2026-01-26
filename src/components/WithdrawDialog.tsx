import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { createTransaction, updateProfile, getBankAccounts, formatCurrency, BankAccount } from "@/lib/database";
import { ArrowDownRight, Building2, Clock, AlertCircle, Wallet, Check, Landmark } from "lucide-react";

interface WithdrawDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  balance: number;
  onSuccess: () => void;
}

const WithdrawDialog = ({ open, onOpenChange, balance, onSuccess }: WithdrawDialogProps) => {
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(null);

  useEffect(() => {
    const loadAccounts = async () => {
      if (open && user) {
        const savedAccounts = await getBankAccounts(user.id);
        setAccounts(savedAccounts);
        if (savedAccounts.length > 0 && !selectedAccount) {
          setSelectedAccount(savedAccounts[0]);
        }
      }
    };
    loadAccounts();
  }, [open, user]);

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
      // Deduct balance immediately
      await updateProfile(user.id, {
        balance: profile.balance - amountNum,
      });

      // Add transaction with pending status - requires admin approval
      await createTransaction({
        user_id: user.id,
        type: "withdraw",
        amount: amountNum,
        status: "pending",
        description: `Withdraw ke ${selectedAccount.provider} - ${selectedAccount.account_number} (${selectedAccount.account_name})`,
      });

      toast({
        title: "Permintaan Withdraw Dikirim",
        description: `${formatCurrency(amountNum)} menunggu persetujuan admin.`,
      });

      setAmount("");
      setSelectedAccount(null);
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal memproses withdraw. Silakan coba lagi.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-md mx-auto max-h-[85vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
            <ArrowDownRight className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
            Withdraw Saldo
          </DialogTitle>
          <DialogDescription className="text-sm">
            Tarik saldo ke rekening bank atau e-wallet Anda
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6">
          <div className="flex flex-col gap-4 py-4 pb-2">
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
                <div className="space-y-2">
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
                          account.account_type === "bank" 
                            ? "bg-primary/20 text-primary" 
                            : "bg-accent/20 text-accent"
                        }`}>
                          {account.account_type === "bank" ? (
                            <Landmark className="w-5 h-5" />
                          ) : (
                            <Wallet className="w-5 h-5" />
                          )}
                        </div>
                        <div className="text-left">
                          <p className="font-medium text-sm text-foreground">{account.provider}</p>
                          <p className="text-xs text-muted-foreground">{account.account_number}</p>
                        </div>
                      </div>
                      {selectedAccount?.id === account.id && (
                        <Check className="w-5 h-5 text-primary" />
                      )}
                    </button>
                  ))}
                </div>
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
                  {selectedAccount.provider} - {selectedAccount.account_number}
                </p>
                <p className="text-xs text-muted-foreground">{selectedAccount.account_name}</p>
              </div>
            )}

            {/* Info */}
            <div className="flex items-start gap-2 p-3 bg-accent/10 rounded-lg">
              <Clock className="w-4 h-4 text-accent mt-0.5" />
              <p className="text-xs text-muted-foreground">
                Withdraw memerlukan persetujuan admin. Proses 1-24 jam kerja.
              </p>
            </div>
          </div>
        </ScrollArea>

        {/* Fixed Button at Bottom */}
        <div className="px-6 pb-6 pt-4 border-t border-border bg-background">
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
