import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, ArrowDownRight, Wallet, LogOut, ShieldCheck, Sparkles, Gift, Bell, PartyPopper, Coins, Sun, Moon } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { getProducts, getInvestments, formatCurrency, canClaimToday, updateInvestment, updateProfile, createTransaction, processReferralRabat, Product, Investment } from "@/lib/database";
import { useTheme } from "@/hooks/useTheme";
import RechargeDialog from "@/components/RechargeDialog";
import WithdrawDialog from "@/components/WithdrawDialog";
import InvestDialog from "@/components/InvestDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const Home = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, profile, isAdmin, signOut, refreshProfile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [rechargeOpen, setRechargeOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [investOpen, setInvestOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [claimDialogOpen, setClaimDialogOpen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);

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
  
  // Calculate claimable investments
  const claimableInvestments = activeInvestments.filter(inv => canClaimToday(inv.last_claimed_at));
  const totalClaimable = claimableInvestments.reduce((sum, inv) => sum + inv.daily_income, 0);

  const handleOpenClaimDialog = () => {
    setClaimed(false);
    setShowConfetti(false);
    setClaimDialogOpen(true);
  };

  const handleClaimAll = async () => {
    if (!user || !profile || claimableInvestments.length === 0 || isClaiming) return;
    
    setIsClaiming(true);
    
    try {
      let totalClaimed = 0;
      
      for (const investment of claimableInvestments) {
        const newTotalEarned = investment.total_earned + investment.daily_income;
        const newDaysRemaining = investment.days_remaining - 1;
        
        await updateInvestment(investment.id, {
          total_earned: newTotalEarned,
          days_remaining: newDaysRemaining,
          last_claimed_at: new Date().toISOString(),
          status: newDaysRemaining <= 0 ? 'completed' : 'active'
        });

        await createTransaction({
          user_id: user.id,
          type: 'income',
          amount: investment.daily_income,
          status: 'success',
          description: `Income harian dari ${investment.product_name}`
        });

        await processReferralRabat(user.id, investment.daily_income);
        
        totalClaimed += investment.daily_income;
      }

      // Update profile balance and total income
      await updateProfile(user.id, {
        balance: profile.balance + totalClaimed,
        total_income: profile.total_income + totalClaimed
      });

      setClaimed(true);
      setShowConfetti(true);

      await loadData();

      toast({
        title: "🎉 Klaim Berhasil!",
        description: `Anda mendapatkan ${formatCurrency(totalClaimed)} dari ${claimableInvestments.length} investasi`,
      });

      setTimeout(() => {
        setClaimDialogOpen(false);
      }, 2500);
    } catch (error) {
      console.error('Error claiming income:', error);
      toast({
        title: "Gagal Klaim",
        description: "Terjadi kesalahan saat mengklaim penghasilan.",
        variant: "destructive",
      });
    } finally {
      setIsClaiming(false);
    }
  };

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
        <div className="flex items-center gap-1">
          <Badge variant="vip" className="text-sm px-3 py-1">
            VIP {vipLevel}
          </Badge>
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="hover:bg-muted">
            {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </Button>
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
          <p className="text-3xl font-heading font-bold text-primary mb-4">
            {formatCurrency(balance)}
          </p>

          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="success"
              className="flex items-center gap-2"
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

      {/* Claim Today Notification Banner - Outside Balance Card */}
      {claimableInvestments.length > 0 && (
        <Card 
          className="shadow-card bg-gradient-to-r from-success/10 via-primary/5 to-success/10 border-success/40 hover:border-success/60 transition-all cursor-pointer overflow-hidden group"
          onClick={handleOpenClaimDialog}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-success/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Gift className="w-6 h-6 text-success" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Bell className="w-3.5 h-3.5 text-success animate-bounce" />
                  <p className="text-base font-semibold text-foreground">Klaim Hari Ini</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  {claimableInvestments.length} investasi siap diklaim
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-success">
                  +{formatCurrency(totalClaimable)}
                </p>
                <Button 
                  size="sm" 
                  variant="success"
                  className="mt-1 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenClaimDialog();
                  }}
                >
                  {claimableInvestments.length > 1 ? 'Klaim Semua' : 'Klaim'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Investments Summary */}
      {activeInvestments.length > 0 && (
        <Card className="shadow-card bg-success/10 border-success/30 transition-all">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Investasi Aktif</p>
                <p className="text-lg font-bold text-foreground">{activeInvestments.length} Paket</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Income Harian</p>
                <p className="text-lg font-bold text-success">
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
              className="shadow-card transition-all duration-300 cursor-pointer border-primary/20 hover:border-primary/50 overflow-hidden"
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

                <Button className="w-full mt-3" size="sm" onClick={() => handleInvest(product)}>
                  Investasi Sekarang
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="shadow-card border-success/20 hover:border-success/40 transition-colors">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-2">Total Income</p>
            <p className="text-lg font-bold text-success">
              {formatCurrency(profile?.total_income || 0)}
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-card border-primary/20 hover:border-primary/40 transition-colors">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-2">Komisi</p>
            <p className="text-lg font-bold text-primary">
              {formatCurrency(profile?.team_income || 0)}
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-card border-vip-gold/20 hover:border-vip-gold/40 transition-colors">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-2">Rabat</p>
            <p className="text-lg font-bold text-vip-gold">
              {formatCurrency(profile?.rabat_income || 0)}
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

      {/* Claim All Dialog with Confetti */}
      <Dialog open={claimDialogOpen} onOpenChange={setClaimDialogOpen}>
        <DialogContent className="max-w-sm bg-gradient-to-br from-background via-background to-success/10 border-success/30">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-heading">
              {claimed ? "🎉 Selamat!" : "Klaim Income Hari Ini"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="relative py-6">
            {/* Confetti Animation */}
            {showConfetti && (
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(30)].map((_, i) => (
                  <div 
                    key={i} 
                    className="absolute animate-confetti" 
                    style={{ 
                      left: `${Math.random() * 100}%`, 
                      animationDelay: `${Math.random() * 0.5}s`, 
                      animationDuration: `${1 + Math.random() * 1}s` 
                    }}
                  >
                    <Sparkles 
                      className="w-4 h-4" 
                      style={{ color: ['#00F5FF', '#FF00E5', '#FFD700', '#00FF88'][Math.floor(Math.random() * 4)] }} 
                    />
                  </div>
                ))}
              </div>
            )}

            <div className={`flex flex-col items-center gap-4 transition-all duration-500 ${claimed ? 'scale-110' : ''}`}>
              <div className={`relative ${claimed ? 'animate-bounce' : 'animate-pulse'}`}>
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-success via-primary to-success flex items-center justify-center">
                  {claimed ? (
                    <PartyPopper className="w-12 h-12 text-primary-foreground" />
                  ) : (
                    <Gift className="w-12 h-12 text-primary-foreground" />
                  )}
                </div>
                {claimed && (
                  <div className="absolute -top-2 -right-2 animate-ping">
                    <Coins className="w-6 h-6 text-accent" />
                  </div>
                )}
              </div>

              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  {claimableInvestments.length} Investasi Aktif
                </p>
                <p className={`text-3xl font-bold transition-all duration-300 ${claimed ? 'text-success scale-125' : 'text-foreground'}`}>
                  {claimed ? '+' : ''}{formatCurrency(totalClaimable)}
                </p>
                {claimed && (
                  <p className="text-sm text-success animate-fade-in">
                    Berhasil ditambahkan ke saldo!
                  </p>
                )}
              </div>
            </div>

            {claimed && (
              <div className="absolute inset-0 bg-gradient-to-t from-success/20 to-transparent rounded-xl animate-pulse" />
            )}
          </div>

          {!claimed && (
            <Button 
              onClick={handleClaimAll} 
              disabled={isClaiming}
              className="w-full bg-gradient-to-r from-success to-primary hover:from-success/90 hover:to-primary/90 text-primary-foreground font-semibold h-12 shadow-lg shadow-success/30"
            >
              <Gift className="w-5 h-5 mr-2" />
              {isClaiming ? 'Memproses...' : claimableInvestments.length > 1 ? 'Klaim Semua Sekarang' : 'Klaim Sekarang'}
            </Button>
          )}

          {claimed && (
            <div className="flex items-center justify-center gap-2 text-success animate-fade-in">
              <Sparkles className="w-4 h-4" />
              <span className="font-medium">Semua income berhasil di-klaim!</span>
              <Sparkles className="w-4 h-4" />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Home;
