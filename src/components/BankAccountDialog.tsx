import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { getCurrentUser } from "@/lib/store";
import { Landmark, Wallet, Plus, Trash2, Check, Search, ChevronsUpDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";

interface BankAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface BankAccount {
  id: string;
  type: "bank" | "ewallet";
  provider: string;
  accountNumber: string;
  accountName: string;
}

// Real Indonesian banks
const BANKS = [
  { value: "bca", label: "BCA (Bank Central Asia)" },
  { value: "mandiri", label: "Bank Mandiri" },
  { value: "bni", label: "BNI (Bank Negara Indonesia)" },
  { value: "bri", label: "BRI (Bank Rakyat Indonesia)" },
  { value: "cimb", label: "CIMB Niaga" },
  { value: "danamon", label: "Bank Danamon" },
  { value: "permata", label: "Bank Permata" },
  { value: "btn", label: "BTN (Bank Tabungan Negara)" },
  { value: "ocbc", label: "OCBC NISP" },
  { value: "maybank", label: "Maybank Indonesia" },
  { value: "panin", label: "Panin Bank" },
  { value: "hsbc", label: "HSBC Indonesia" },
  { value: "uob", label: "UOB Indonesia" },
  { value: "dbs", label: "DBS Indonesia" },
  { value: "citibank", label: "Citibank Indonesia" },
  { value: "mega", label: "Bank Mega" },
  { value: "bukopin", label: "KB Bukopin" },
  { value: "bsi", label: "BSI (Bank Syariah Indonesia)" },
  { value: "btpn", label: "Bank BTPN" },
  { value: "jago", label: "Bank Jago" },
  { value: "seabank", label: "SeaBank Indonesia" },
  { value: "blu", label: "Blu by BCA Digital" },
  { value: "neo", label: "Neo Commerce Bank" },
  { value: "allo", label: "Allo Bank" },
  { value: "line", label: "LINE Bank" },
];

// Real Indonesian e-wallets
const EWALLETS = [
  { value: "gopay", label: "GoPay" },
  { value: "ovo", label: "OVO" },
  { value: "dana", label: "DANA" },
  { value: "shopeepay", label: "ShopeePay" },
  { value: "linkaja", label: "LinkAja" },
  { value: "isaku", label: "iSaku" },
  { value: "sakuku", label: "Sakuku" },
  { value: "doku", label: "DOKU" },
  { value: "jenius", label: "Jenius" },
  { value: "paypro", label: "PayPro" },
  { value: "kredivo", label: "Kredivo" },
  { value: "akulaku", label: "Akulaku PayLater" },
];

const getBankAccounts = (userId: string): BankAccount[] => {
  const stored = localStorage.getItem(`bank_accounts_${userId}`);
  return stored ? JSON.parse(stored) : [];
};

const saveBankAccounts = (userId: string, accounts: BankAccount[]): void => {
  localStorage.setItem(`bank_accounts_${userId}`, JSON.stringify(accounts));
  
  // Also save the first one in old format for backward compatibility with withdraw
  if (accounts.length > 0) {
    localStorage.setItem(`bank_${userId}`, JSON.stringify({
      bankName: accounts[0].provider,
      bankAccount: accounts[0].accountNumber,
      bankAccountName: accounts[0].accountName,
    }));
  }
};

const BankAccountDialog = ({ open, onOpenChange, onSuccess }: BankAccountDialogProps) => {
  const { toast } = useToast();
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  
  // Form states
  const [accountType, setAccountType] = useState<"bank" | "ewallet">("bank");
  const [provider, setProvider] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [providerOpen, setProviderOpen] = useState(false);

  const user = getCurrentUser();

  useEffect(() => {
    if (open && user) {
      const savedAccounts = getBankAccounts(user.id);
      setAccounts(savedAccounts);
      resetForm();
    }
  }, [open]);

  const resetForm = () => {
    setIsAdding(false);
    setAccountType("bank");
    setProvider("");
    setAccountNumber("");
    setAccountName("");
  };

  const providers = accountType === "bank" ? BANKS : EWALLETS;

  const selectedProviderLabel = useMemo(() => {
    return providers.find(p => p.value === provider)?.label || "";
  }, [provider, providers]);

  const handleAddAccount = () => {
    if (!user) return;

    if (!provider || !accountNumber.trim() || !accountName.trim()) {
      toast({
        title: "Error",
        description: "Semua field harus diisi",
        variant: "destructive",
      });
      return;
    }

    const newAccount: BankAccount = {
      id: Date.now().toString(),
      type: accountType,
      provider: selectedProviderLabel,
      accountNumber: accountNumber.trim(),
      accountName: accountName.trim(),
    };

    const updatedAccounts = [...accounts, newAccount];
    setAccounts(updatedAccounts);
    saveBankAccounts(user.id, updatedAccounts);

    toast({
      title: "Berhasil",
      description: `${accountType === "bank" ? "Rekening bank" : "E-Wallet"} berhasil ditambahkan`,
    });

    resetForm();
    onSuccess();
  };

  const handleDeleteAccount = (id: string) => {
    if (!user) return;

    const updatedAccounts = accounts.filter(a => a.id !== id);
    setAccounts(updatedAccounts);
    saveBankAccounts(user.id, updatedAccounts);

    toast({
      title: "Dihapus",
      description: "Akun berhasil dihapus",
    });
    onSuccess();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Landmark className="w-5 h-5 text-primary" />
            Account Bank & E-Wallet
          </DialogTitle>
          <DialogDescription>
            Kelola rekening bank dan e-wallet Anda untuk penarikan
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col gap-4">
          {/* Existing Accounts */}
          <ScrollArea className="flex-1 max-h-[200px]">
            <div className="space-y-2 pr-4">
              {accounts.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <Wallet className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Belum ada rekening tersimpan</p>
                </div>
              ) : (
                accounts.map((account) => (
                  <div
                    key={account.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${account.type === "bank" ? "bg-primary/20 text-primary" : "bg-accent/20 text-accent"}`}>
                        {account.type === "bank" ? (
                          <Landmark className="w-5 h-5" />
                        ) : (
                          <Wallet className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm text-foreground">{account.provider}</p>
                        <p className="text-xs text-muted-foreground">{account.accountNumber}</p>
                        <p className="text-xs text-muted-foreground">{account.accountName}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:bg-destructive/20"
                      onClick={() => handleDeleteAccount(account.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>

          {/* Add New Account Form */}
          {isAdding ? (
            <div className="space-y-3 border-t pt-4">
              {/* Account Type Toggle */}
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={accountType === "bank" ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => {
                    setAccountType("bank");
                    setProvider("");
                  }}
                >
                  <Landmark className="w-4 h-4 mr-2" />
                  Bank
                </Button>
                <Button
                  type="button"
                  variant={accountType === "ewallet" ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => {
                    setAccountType("ewallet");
                    setProvider("");
                  }}
                >
                  <Wallet className="w-4 h-4 mr-2" />
                  E-Wallet
                </Button>
              </div>

              {/* Provider Selection - Searchable */}
              <div className="space-y-2">
                <Label>{accountType === "bank" ? "Nama Bank" : "Nama E-Wallet"}</Label>
                <Popover open={providerOpen} onOpenChange={setProviderOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={providerOpen}
                      className="w-full justify-between bg-muted/50"
                    >
                      {provider ? selectedProviderLabel : `Pilih ${accountType === "bank" ? "bank" : "e-wallet"}...`}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0 z-[100]" align="start">
                    <Command>
                      <CommandInput placeholder={`Cari ${accountType === "bank" ? "bank" : "e-wallet"}...`} />
                      <CommandList>
                        <CommandEmpty>Tidak ditemukan.</CommandEmpty>
                        <CommandGroup>
                          {providers.map((item) => (
                            <CommandItem
                              key={item.value}
                              value={item.label}
                              onSelect={() => {
                                setProvider(item.value);
                                setProviderOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  provider === item.value ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {item.label}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Account Number */}
              <div className="space-y-2">
                <Label>{accountType === "bank" ? "Nomor Rekening" : "Nomor HP/ID"}</Label>
                <Input
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder={accountType === "bank" ? "Masukkan nomor rekening" : "Masukkan nomor HP/ID"}
                  className="bg-muted/50"
                />
              </div>

              {/* Account Name */}
              <div className="space-y-2">
                <Label>Nama Pemilik</Label>
                <Input
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder="Nama sesuai rekening/akun"
                  className="bg-muted/50"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <Button className="flex-1" onClick={handleAddAccount}>
                  <Check className="w-4 h-4 mr-2" />
                  Simpan
                </Button>
                <Button variant="outline" onClick={resetForm}>
                  Batal
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              className="w-full border-dashed"
              onClick={() => setIsAdding(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Tambah Rekening Baru
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BankAccountDialog;
