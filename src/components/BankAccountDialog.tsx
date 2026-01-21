import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { getBankAccounts, createBankAccount, deleteBankAccount, BankAccount } from "@/lib/database";
import { Landmark, Wallet, Plus, Trash2, Check, ChevronsUpDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";

interface BankAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const BANKS = [
  { value: "bca", label: "BCA (Bank Central Asia)" },
  { value: "mandiri", label: "Bank Mandiri" },
  { value: "bni", label: "BNI (Bank Negara Indonesia)" },
  { value: "bri", label: "BRI (Bank Rakyat Indonesia)" },
  { value: "bsi", label: "BSI (Bank Syariah Indonesia)" },
  { value: "cimb", label: "CIMB Niaga" },
  { value: "danamon", label: "Bank Danamon" },
  { value: "permata", label: "Bank Permata" },
  { value: "panin", label: "Bank Panin" },
  { value: "ocbc", label: "OCBC NISP" },
  { value: "maybank", label: "Maybank Indonesia" },
  { value: "btpn", label: "Bank BTPN" },
  { value: "mega", label: "Bank Mega" },
  { value: "bukopin", label: "Bank KB Bukopin" },
  { value: "btn", label: "BTN (Bank Tabungan Negara)" },
  { value: "bjb", label: "Bank BJB (Bank Jabar Banten)" },
  { value: "dki", label: "Bank DKI" },
  { value: "jatim", label: "Bank Jatim" },
  { value: "jateng", label: "Bank Jateng" },
  { value: "sumut", label: "Bank Sumut" },
  { value: "jago", label: "Bank Jago" },
  { value: "seabank", label: "SeaBank Indonesia" },
  { value: "blu", label: "Blu by BCA Digital" },
  { value: "neo", label: "Bank Neo Commerce" },
  { value: "allo", label: "Allo Bank" },
  { value: "line", label: "LINE Bank" },
  { value: "superbank", label: "Superbank" },
  { value: "hsbc", label: "HSBC Indonesia" },
  { value: "uob", label: "UOB Indonesia" },
  { value: "citibank", label: "Citibank Indonesia" },
  { value: "standard_chartered", label: "Standard Chartered" },
  { value: "dbs", label: "DBS Indonesia" },
  { value: "commonwealth", label: "Commonwealth Bank" },
  { value: "bca_syariah", label: "BCA Syariah" },
  { value: "muamalat", label: "Bank Muamalat" },
  { value: "mandiri_syariah", label: "BSM (Bank Syariah Mandiri)" },
  { value: "bni_syariah", label: "BNI Syariah" },
  { value: "bri_syariah", label: "BRI Syariah" },
];

const EWALLETS = [
  { value: "gopay", label: "GoPay" },
  { value: "ovo", label: "OVO" },
  { value: "dana", label: "DANA" },
  { value: "shopeepay", label: "ShopeePay" },
  { value: "linkaja", label: "LinkAja" },
  { value: "isaku", label: "iSaku" },
  { value: "sakuku", label: "Sakuku" },
  { value: "doku", label: "DOKU" },
  { value: "jenius", label: "Jenius Pay" },
  { value: "gopay_later", label: "GoPayLater" },
  { value: "kredivo", label: "Kredivo" },
  { value: "akulaku", label: "Akulaku" },
  { value: "payfazz", label: "Payfazz" },
  { value: "octo_mobile", label: "OCTO Mobile" },
  { value: "livin", label: "Livin' by Mandiri" },
  { value: "bca_mobile", label: "BCA Mobile" },
  { value: "brimo", label: "BRImo" },
  { value: "bni_mobile", label: "BNI Mobile" },
  { value: "flip", label: "Flip" },
  { value: "netzme", label: "Netzme" },
  { value: "qris", label: "QRIS (General)" },
];

const BankAccountDialog = ({ open, onOpenChange, onSuccess }: BankAccountDialogProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [accountType, setAccountType] = useState<"bank" | "ewallet">("bank");
  const [provider, setProvider] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [providerOpen, setProviderOpen] = useState(false);

  const loadAccounts = async () => {
    if (user) {
      const data = await getBankAccounts(user.id);
      setAccounts(data);
    }
  };

  useEffect(() => {
    if (open) {
      loadAccounts();
      resetForm();
    }
  }, [open, user]);

  const resetForm = () => {
    setIsAdding(false);
    setAccountType("bank");
    setProvider("");
    setAccountNumber("");
    setAccountName("");
  };

  const providers = accountType === "bank" ? BANKS : EWALLETS;
  const selectedProviderLabel = useMemo(() => providers.find(p => p.value === provider)?.label || "", [provider, providers]);

  const handleAddAccount = async () => {
    if (!user || !provider || !accountNumber.trim() || !accountName.trim()) {
      toast({ title: "Error", description: "Semua field harus diisi", variant: "destructive" });
      return;
    }

    const result = await createBankAccount({
      user_id: user.id,
      account_type: accountType,
      provider: selectedProviderLabel,
      account_number: accountNumber.trim(),
      account_name: accountName.trim(),
    });

    if (result) {
      toast({ title: "Berhasil", description: "Rekening berhasil ditambahkan" });
      await loadAccounts();
      resetForm();
      onSuccess();
    }
  };

  const handleDeleteAccount = async (id: string) => {
    const success = await deleteBankAccount(id);
    if (success) {
      toast({ title: "Dihapus", description: "Akun berhasil dihapus" });
      await loadAccounts();
      onSuccess();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-md mx-auto max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Landmark className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            Account Bank & E-Wallet
          </DialogTitle>
          <DialogDescription className="text-sm">Kelola rekening untuk penarikan</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col gap-4">
          <ScrollArea className="flex-1 max-h-[200px]">
            <div className="space-y-2 pr-4">
              {accounts.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <Wallet className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Belum ada rekening tersimpan</p>
                </div>
              ) : accounts.map((account) => (
                <div key={account.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border/50">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${account.account_type === "bank" ? "bg-primary/20 text-primary" : "bg-accent/20 text-accent"}`}>
                      {account.account_type === "bank" ? <Landmark className="w-5 h-5" /> : <Wallet className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="font-medium text-sm text-foreground">{account.provider}</p>
                      <p className="text-xs text-muted-foreground">{account.account_number} - {account.account_name}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/20" onClick={() => handleDeleteAccount(account.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>

          {isAdding ? (
            <div className="space-y-3 border-t pt-4">
              <div className="flex gap-2">
                <Button type="button" variant={accountType === "bank" ? "default" : "outline"} className="flex-1" onClick={() => { setAccountType("bank"); setProvider(""); }}>
                  <Landmark className="w-4 h-4 mr-2" />Bank
                </Button>
                <Button type="button" variant={accountType === "ewallet" ? "default" : "outline"} className="flex-1" onClick={() => { setAccountType("ewallet"); setProvider(""); }}>
                  <Wallet className="w-4 h-4 mr-2" />E-Wallet
                </Button>
              </div>
              <div className="space-y-2">
                <Label>{accountType === "bank" ? "Nama Bank" : "Nama E-Wallet"}</Label>
                <Popover open={providerOpen} onOpenChange={setProviderOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-between bg-muted/50">
                      {provider ? selectedProviderLabel : `Pilih ${accountType === "bank" ? "bank" : "e-wallet"}...`}
                      <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0 z-[100]" align="start">
                    <Command>
                      <CommandInput placeholder="Cari..." />
                      <CommandList>
                        <CommandEmpty>Tidak ditemukan.</CommandEmpty>
                        <CommandGroup>
                          {providers.map((item) => (
                            <CommandItem key={item.value} value={item.label} onSelect={() => { setProvider(item.value); setProviderOpen(false); }}>
                              <Check className={cn("mr-2 h-4 w-4", provider === item.value ? "opacity-100" : "opacity-0")} />
                              {item.label}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>{accountType === "bank" ? "Nomor Rekening" : "Nomor HP/ID"}</Label>
                <Input value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} placeholder="Masukkan nomor" className="bg-muted/50" />
              </div>
              <div className="space-y-2">
                <Label>Nama Pemilik</Label>
                <Input value={accountName} onChange={(e) => setAccountName(e.target.value)} placeholder="Nama sesuai rekening" className="bg-muted/50" />
              </div>
              <div className="flex gap-2 pt-2">
                <Button className="flex-1" onClick={handleAddAccount}><Check className="w-4 h-4 mr-2" />Simpan</Button>
                <Button variant="outline" onClick={resetForm}>Batal</Button>
              </div>
            </div>
          ) : (
            <Button variant="outline" className="w-full border-dashed" onClick={() => setIsAdding(true)}>
              <Plus className="w-4 h-4 mr-2" />Tambah Rekening Baru
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BankAccountDialog;
