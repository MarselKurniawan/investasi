import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, ArrowDownRight, Wallet, LogOut, ShieldCheck, Sparkles } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { getProducts, getInvestments, formatCurrency, Product, Investment } from "@/lib/database";
import RechargeDialog from "@/components/RechargeDialog";
import WithdrawDialog from "@/components/WithdrawDialog";
import InvestDialog from "@/components/InvestDialog";

const Home = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, profile, isAdmin, signOut, refreshProfile } = useAuth();
  
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [rechargeOpen, setRechargeOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [investOpen, setInvestOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const loadData = async () => {
    if (user) {
      const [investmentsData, productsData] = await Promise.all([
        getInvestments(user.id),
        getProducts()
      ]);
      setInvestments(investmentsData);
      setProducts(productsData);
    }
    await refreshProfile();
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleLogout = async () => {
    await signOut();
    toast({
      title: "Logout Berhasil",
      description: "Sampai jumpa lagi!",
    });
    navigate("/auth");
  };

  const balance = profile?.balance || 0;
  const vipLevel = profile?.vip_level || 1;

  const popularProducts = products.slice(0, 2);

  const handleInvest = (product: Product) => {
    setSelectedProduct(product);
    setInvestOpen(true);
  };

  const activeInvestments = investments.filter(i => i.status === 'active');
  const totalDailyIncome = activeInvestments.reduce((sum, i) => sum + i.daily_income, 0);

  return (
    <div className="space-y-6 p-4 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">
            {profile ? `Halo, ${profile.name}!` : "Selamat Datang!"}
          </h1>
          <p className="text-sm text-muted-foreground">Kelola investasi Anda dengan mudah</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="vip" className="text-sm px-3 py-1 gold-pulse">
            VIP {vipLevel}
          </Badge>
          {isAdmin && (
            <Button variant="ghost" size="icon" onClick={() => navigate("/admin")} className="hover:bg-primary/20">
              <ShieldCheck className="w-5 h-5 text-primary" />
            </Button>
          )}
          {user && (
            <Button variant="ghost" size="icon" onClick={handleLogout} className="hover:bg-destructive/20">
              <LogOut className="w-5 h-5" />
            </Button>
          )}
        </div>
      </div>

      {/* Balance Card */}
      <Card className="shadow-card border-primary/20 hover:border-primary/40 transition-colors">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Wallet className="w-5 h-5 text-primary" />
            <span className="text-sm text-muted-foreground font-medium">Saldo Tersedia</span>
          </div>
          <p className="text-3xl font-heading font-bold text-primary mb-6 drop-shadow-[0_0_15px_hsl(185,100%,50%)]">
            {formatCurrency(balance)}
          </p>

          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="success"
              className="flex items-center gap-2 shadow-success-glow"
              onClick={() => setRechargeOpen(true)}
            >
              <ArrowUpRight className="w-4 h-4" />
              Recharge
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2 border-accent/50 hover:border-accent hover:bg-accent/10"
              onClick={() => setWithdrawOpen(true)}
            >
              <ArrowDownRight className="w-4 h-4" />
              Withdraw
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Active Investments Summary */}
      {activeInvestments.length > 0 && (
        <Card className="shadow-card bg-success/10 border-success/30 hover:shadow-success-glow transition-all">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Investasi Aktif</p>
                <p className="text-lg font-bold text-foreground">{activeInvestments.length} Paket</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Income Harian</p>
                <p className="text-lg font-bold text-success drop-shadow-[0_0_8px_hsl(145,100%,50%)]">
                  {formatCurrency(totalDailyIncome)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Popular Products */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-heading font-bold text-foreground flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-vip-gold" />
            Produk Populer
          </h2>
          <Link to="/product">
            <Button variant="link" className="text-primary p-0 h-auto">
              Lihat Semua →
            </Button>
          </Link>
        </div>

        <div className="space-y-4">
          {popularProducts.map((product) => (
            <Card 
              key={product.id} 
              className="shadow-card hover:shadow-glow transition-all duration-300 cursor-pointer border-primary/20 hover:border-primary/50 overflow-hidden"
            >
              {/* Product Image */}
              <div className="relative h-32 overflow-hidden">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
                <Badge variant="vip" className="absolute top-3 right-3 text-xs">
                  VIP {product.vip_level}
                </Badge>
              </div>

              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">{product.name}</h3>
                    <p className="text-xs text-muted-foreground">{product.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Harga</p>
                    <p className="text-lg font-bold text-primary">{formatCurrency(product.price)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 py-3 border-t border-border/50">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Harian</p>
                    <p className="text-sm font-semibold text-success">{formatCurrency(product.daily_income)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Durasi</p>
                    <p className="text-sm font-semibold text-foreground">{product.validity} Hari</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Total</p>
                    <p className="text-sm font-semibold text-accent">{formatCurrency(product.total_income)}</p>
                  </div>
                </div>

                <Button className="w-full mt-3 neon-pulse" size="sm" onClick={() => handleInvest(product)}>
                  Investasi Sekarang
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="shadow-card border-success/20 hover:border-success/40 transition-colors">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-2">Total Income</p>
            <p className="text-xl font-bold text-success drop-shadow-[0_0_8px_hsl(145,100%,50%)]">
              {formatCurrency(profile?.total_income || 0)}
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-card border-primary/20 hover:border-primary/40 transition-colors">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-2">Komisi Referral</p>
            <p className="text-xl font-bold text-primary drop-shadow-[0_0_8px_hsl(185,100%,50%)]">
              {formatCurrency(profile?.team_income || 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Dialogs */}
      <RechargeDialog
        open={rechargeOpen}
        onOpenChange={setRechargeOpen}
        onSuccess={loadData}
      />
      <WithdrawDialog
        open={withdrawOpen}
        onOpenChange={setWithdrawOpen}
        balance={balance}
        onSuccess={loadData}
      />
      <InvestDialog
        open={investOpen}
        onOpenChange={setInvestOpen}
        product={selectedProduct}
        balance={balance}
        onSuccess={loadData}
      />
    </div>
  );
};

export default Home;
