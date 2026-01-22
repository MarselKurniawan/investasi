import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TrendingUp, ShoppingCart, Calendar, Percent } from "lucide-react";

interface RabatInfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const RabatInfoDialog = ({ open, onOpenChange }: RabatInfoDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Percent className="w-5 h-5 text-accent" />
            Komisi & Rabat
          </DialogTitle>
          <DialogDescription>
            Pelajari cara mendapatkan penghasilan dari tim Anda
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Komisi Section */}
          <div className="bg-success/10 rounded-lg p-4 border border-success/20">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-success" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Komisi</h3>
                <p className="text-xs text-muted-foreground">Satu kali saat pembelian</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Anda mendapat komisi setiap kali bawahan <strong>membeli produk</strong>.
            </p>
            <div className="bg-background/50 rounded-lg p-3 space-y-1">
              <p className="text-xs text-muted-foreground">Contoh:</p>
              <p className="text-sm">Bawahan beli produk <strong className="text-primary">Rp 100.000</strong></p>
              <p className="text-sm">Komisi 10% = <strong className="text-success">Rp 10.000</strong> (sekali)</p>
            </div>
          </div>

          {/* Rabat Section */}
          <div className="bg-accent/10 rounded-lg p-4 border border-accent/20">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Rabat</h3>
                <p className="text-xs text-muted-foreground">Setiap hari dari profit</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Anda mendapat rabat dari <strong>profit harian</strong> bawahan setiap kali mereka claim.
            </p>
            <div className="bg-background/50 rounded-lg p-3 space-y-1">
              <p className="text-xs text-muted-foreground">Contoh:</p>
              <p className="text-sm">Profit harian bawahan <strong className="text-primary">Rp 3.000</strong></p>
              <p className="text-sm">Rabat 5% = <strong className="text-accent">Rp 150</strong> (setiap hari)</p>
            </div>
          </div>

          {/* Rate Table */}
          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Tingkat Berdasarkan VIP
            </h4>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="font-medium text-muted-foreground">Tier</div>
              <div className="font-medium text-muted-foreground text-center">Komisi</div>
              <div className="font-medium text-muted-foreground text-center">Rabat</div>
              
              <div className="text-foreground">Tier A (VIP 4-5)</div>
              <div className="text-success text-center font-semibold">10%</div>
              <div className="text-accent text-center font-semibold">5%</div>
              
              <div className="text-foreground">Tier B (VIP 2-3)</div>
              <div className="text-success text-center font-semibold">3%</div>
              <div className="text-accent text-center font-semibold">3%</div>
              
              <div className="text-foreground">Tier C (VIP 1)</div>
              <div className="text-success text-center font-semibold">2%</div>
              <div className="text-accent text-center font-semibold">2%</div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RabatInfoDialog;
