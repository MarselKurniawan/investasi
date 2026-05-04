import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { consumeSpinTicket, formatCurrency, getWheelPrizes, pickWheelPrize } from "@/lib/database";
import { Sparkles, Ticket } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSuccess?: () => void;
}

const LuckyWheelDialog = ({ open, onOpenChange, onSuccess }: Props) => {
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const prizes = getWheelPrizes();
  const slice = 360 / prizes.length;
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [lastReward, setLastReward] = useState<number | null>(null);

  const tickets = (profile as unknown as { spin_tickets?: number })?.spin_tickets ?? 0;

  const handleSpin = async () => {
    if (!user || tickets <= 0 || spinning) return;
    setSpinning(true);
    setLastReward(null);
    const { index, amount } = pickWheelPrize();
    // Pointer at top (0deg). We want slice center at -90deg from start.
    const targetCenter = index * slice + slice / 2;
    const finalRotation = 360 * 6 + (360 - targetCenter);
    setRotation(finalRotation);

    setTimeout(async () => {
      const ok = await consumeSpinTicket(user.id, amount);
      if (ok) {
        setLastReward(amount);
        await refreshProfile();
        onSuccess?.();
        toast({ title: "🎉 Selamat!", description: `Anda mendapat ${formatCurrency(amount)}` });
      } else {
        toast({ title: "Gagal", description: "Tiket tidak tersedia", variant: "destructive" });
      }
      setSpinning(false);
    }, 4200);
  };

  const colors = [
    "hsl(var(--primary))",
    "hsl(var(--accent))",
    "hsl(var(--success))",
    "hsl(var(--vip-gold))",
    "hsl(var(--primary))",
    "hsl(var(--accent))",
    "hsl(var(--success))",
    "hsl(var(--vip-gold))",
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Sparkles className="w-4 h-4 text-vip-gold" /> Roda Keberuntungan
          </DialogTitle>
          <DialogDescription className="text-xs">
            Undang teman → dapat 1x spin. Hadiah Rp1.000 – Rp50.000
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-2">
          <div className="flex items-center gap-2 text-xs">
            <Ticket className="w-3.5 h-3.5 text-primary" />
            <span className="font-semibold">Tiket:</span>
            <span className="text-primary font-bold">{tickets}</span>
          </div>

          <div className="relative w-64 h-64">
            {/* Pointer */}
            <div className="absolute left-1/2 -translate-x-1/2 -top-1 z-10">
              <div className="w-0 h-0 border-l-8 border-r-8 border-t-[14px] border-l-transparent border-r-transparent border-t-destructive" />
            </div>
            <div
              className="w-full h-full rounded-full border-4 border-border overflow-hidden"
              style={{
                transform: `rotate(${rotation}deg)`,
                transition: spinning ? "transform 4s cubic-bezier(0.17, 0.67, 0.21, 1)" : "none",
                background: `conic-gradient(${prizes
                  .map((_, i) => `${colors[i]} ${i * slice}deg ${(i + 1) * slice}deg`)
                  .join(", ")})`,
              }}
            >
              {prizes.map((p, i) => {
                const angle = i * slice + slice / 2;
                return (
                  <div
                    key={i}
                    className="absolute left-1/2 top-1/2 origin-[0_0] text-[10px] font-bold text-white"
                    style={{
                      transform: `rotate(${angle}deg) translate(0, -100px) rotate(90deg)`,
                    }}
                  >
                    {p >= 1000 ? `${p / 1000}k` : p}
                  </div>
                );
              })}
            </div>
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background border-2 border-primary flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-vip-gold" />
            </div>
          </div>

          {lastReward !== null && !spinning && (
            <p className="text-sm font-bold text-success">+{formatCurrency(lastReward)}</p>
          )}

          <Button
            onClick={handleSpin}
            disabled={tickets <= 0 || spinning}
            className="w-full"
          >
            {spinning ? "Berputar..." : tickets > 0 ? "Putar Roda" : "Tidak Ada Tiket"}
          </Button>
          <p className="text-[10px] text-muted-foreground text-center">
            Ajak teman daftar pakai kode referral Anda untuk mendapat tiket gratis.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LuckyWheelDialog;
