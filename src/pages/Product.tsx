import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, TrendingUp } from "lucide-react";

const Product = () => {
  const [userVipLevel] = useState(1);

  const allProducts = [
    // VIP 1
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
      name: "Paket Investasi Basic",
      price: 300000,
      dailyIncome: 33000,
      validity: 20,
      totalIncome: 660000,
      vipLevel: 1,
    },
    {
      id: 3,
      name: "Paket Investasi Pro",
      price: 500000,
      dailyIncome: 55000,
      validity: 20,
      totalIncome: 1100000,
      vipLevel: 1,
    },
    // VIP 2
    {
      id: 4,
      name: "Paket Premium A",
      price: 1000000,
      dailyIncome: 115000,
      validity: 20,
      totalIncome: 2300000,
      vipLevel: 2,
    },
    {
      id: 5,
      name: "Paket Premium B",
      price: 2000000,
      dailyIncome: 240000,
      validity: 20,
      totalIncome: 4800000,
      vipLevel: 2,
    },
    // VIP 3
    {
      id: 6,
      name: "Paket Elite Gold",
      price: 5000000,
      dailyIncome: 625000,
      validity: 20,
      totalIncome: 12500000,
      vipLevel: 3,
    },
    {
      id: 7,
      name: "Paket Elite Platinum",
      price: 10000000,
      dailyIncome: 1300000,
      validity: 20,
      totalIncome: 26000000,
      vipLevel: 3,
    },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const availableProducts = allProducts.filter(
    (product) => product.vipLevel <= userVipLevel
  );

  const lockedProducts = allProducts.filter(
    (product) => product.vipLevel > userVipLevel
  );

  return (
    <div className="space-y-6 p-4 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Katalog Produk</h1>
          <p className="text-sm text-muted-foreground">Pilih paket investasi terbaik</p>
        </div>
        <Badge variant="vip" className="text-sm px-3 py-1">
          VIP {userVipLevel}
        </Badge>
      </div>

      {/* Available Products */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Package className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-heading font-bold text-foreground">Tersedia untuk Anda</h2>
        </div>

        <div className="space-y-3">
          {availableProducts.map((product) => (
            <Card key={product.id} className="shadow-card hover:shadow-elegant transition-all">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground text-lg mb-2">{product.name}</h3>
                    <Badge variant="vip" className="text-xs">
                      VIP {product.vipLevel}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground mb-1">Harga Investasi</p>
                    <p className="text-2xl font-bold text-primary">{formatCurrency(product.price)}</p>
                  </div>
                </div>

                <div className="bg-muted rounded-lg p-4 mb-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Penghasilan Harian</span>
                    <span className="text-base font-bold text-success">{formatCurrency(product.dailyIncome)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Masa Berlaku</span>
                    <span className="text-base font-semibold text-foreground">{product.validity} Hari</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <span className="text-sm font-medium text-foreground">Total Penghasilan</span>
                    <span className="text-lg font-bold text-accent">{formatCurrency(product.totalIncome)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-3 p-3 bg-success-light rounded-md">
                  <TrendingUp className="w-4 h-4 text-success" />
                  <span className="text-sm font-medium text-success">
                    ROI: {((product.totalIncome / product.price - 1) * 100).toFixed(0)}%
                  </span>
                </div>

                <Button className="w-full">
                  Investasi Sekarang
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Locked Products */}
      {lockedProducts.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Package className="w-5 h-5 text-muted-foreground" />
            <h2 className="text-lg font-heading font-bold text-foreground">Produk Terkunci</h2>
          </div>

          <div className="space-y-3">
            {lockedProducts.map((product) => (
              <Card key={product.id} className="opacity-60 relative overflow-hidden">
                <div className="absolute top-3 right-3 z-10">
                  <Badge variant="outline" className="bg-background/80 backdrop-blur-sm">
                    Butuh VIP {product.vipLevel}
                  </Badge>
                </div>
                <CardContent className="p-5 blur-[2px]">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground text-lg mb-2">{product.name}</h3>
                      <Badge variant="vip" className="text-xs">
                        VIP {product.vipLevel}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground mb-1">Harga Investasi</p>
                      <p className="text-2xl font-bold text-primary">{formatCurrency(product.price)}</p>
                    </div>
                  </div>

                  <div className="bg-muted rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Penghasilan Harian</span>
                      <span className="text-base font-bold text-success">{formatCurrency(product.dailyIncome)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Total Penghasilan</span>
                      <span className="text-lg font-bold text-accent">{formatCurrency(product.totalIncome)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="mt-4 bg-gradient-primary text-primary-foreground border-0">
            <CardContent className="p-5 text-center">
              <h3 className="font-bold text-lg mb-2">Tingkatkan Level VIP Anda!</h3>
              <p className="text-sm opacity-90 mb-4">
                Ajak teman untuk membuka produk eksklusif dengan penghasilan lebih tinggi
              </p>
              <Button variant="secondary" asChild>
                <a href="/team">Lihat Program Referral</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Product;
