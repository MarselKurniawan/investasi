import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, ArrowDownRight, TrendingUp, Wallet } from "lucide-react";
import { Link } from "react-router-dom";

const Home = () => {
  const balance = 2500000;
  const vipLevel = 1;
  
  const popularProducts = [
    {
      id: 1,
      name: "Paket Investasi Starter",
      price: 150000,
      dailyIncome: 15000,
      validity: 20,
      totalIncome: 300000,
      vipLevel: 1,
    },
    {
      id: 2,
      name: "Paket Investasi Pro",
      price: 500000,
      dailyIncome: 55000,
      validity: 20,
      totalIncome: 1100000,
      vipLevel: 1,
    },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6 p-4 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Selamat Datang!</h1>
          <p className="text-sm text-muted-foreground">Kelola investasi Anda dengan mudah</p>
        </div>
        <Badge variant="vip" className="text-sm px-3 py-1">
          VIP {vipLevel}
        </Badge>
      </div>

      {/* Banner Promo */}
      <Card className="bg-gradient-primary text-primary-foreground border-0 shadow-glow overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h3 className="text-xl font-heading font-bold">Promo Spesial!</h3>
              <p className="text-sm opacity-90">Bonus 20% untuk member baru</p>
              <Button variant="secondary" size="sm" className="mt-2">
                Klaim Sekarang
              </Button>
            </div>
            <TrendingUp className="w-20 h-20 opacity-20" />
          </div>
        </CardContent>
      </Card>

      {/* Balance Card */}
      <Card className="shadow-card">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Wallet className="w-5 h-5 text-primary" />
            <span className="text-sm text-muted-foreground font-medium">Saldo Tersedia</span>
          </div>
          <p className="text-3xl font-heading font-bold text-foreground mb-6">
            {formatCurrency(balance)}
          </p>
          
          <div className="grid grid-cols-2 gap-3">
            <Button variant="success" className="flex items-center gap-2">
              <ArrowUpRight className="w-4 h-4" />
              Recharge
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowDownRight className="w-4 h-4" />
              Withdraw
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Popular Products */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-heading font-bold text-foreground">Produk Populer</h2>
          <Link to="/product">
            <Button variant="link" className="text-primary p-0 h-auto">
              Lihat Semua →
            </Button>
          </Link>
        </div>

        <div className="space-y-3">
          {popularProducts.map((product) => (
            <Card key={product.id} className="shadow-card hover:shadow-elegant transition-all cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">{product.name}</h3>
                    <Badge variant="vip" className="text-xs">
                      VIP {product.vipLevel}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Harga</p>
                    <p className="text-lg font-bold text-primary">{formatCurrency(product.price)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 py-3 border-t border-border">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Harian</p>
                    <p className="text-sm font-semibold text-success">{formatCurrency(product.dailyIncome)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Durasi</p>
                    <p className="text-sm font-semibold text-foreground">{product.validity} Hari</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Total</p>
                    <p className="text-sm font-semibold text-accent">{formatCurrency(product.totalIncome)}</p>
                  </div>
                </div>

                <Button className="w-full mt-3" size="sm">
                  Investasi Sekarang
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="shadow-card">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-2">Total Income</p>
            <p className="text-xl font-bold text-success">{formatCurrency(1250000)}</p>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-2">Tim Aktif</p>
            <p className="text-xl font-bold text-primary">12 Orang</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Home;
