import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, TrendingUp, Lock, Sparkles } from "lucide-react";
import { getCurrentUser, getAllProducts, formatCurrency, User, Product } from "@/lib/store";
import InvestDialog from "@/components/InvestDialog";

const ProductPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [investOpen, setInvestOpen] = useState(false);

  const loadData = () => {
    setUser(getCurrentUser());
  };

  useEffect(() => {
    loadData();
  }, []);

  const userVipLevel = user?.vipLevel || 1;
  const balance = user?.balance || 0;
  const allProducts = getAllProducts();

  const availableProducts = allProducts.filter(
    (product) => product.vipLevel <= userVipLevel
  );

  const lockedProducts = allProducts.filter(
    (product) => product.vipLevel > userVipLevel
  );

  const handleInvest = (product: Product) => {
    setSelectedProduct(product);
    setInvestOpen(true);
  };

  return (
    <div className="space-y-6 p-4 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            Katalog Produk
          </h1>
          <p className="text-sm text-muted-foreground">Pilih paket investasi terbaik</p>
        </div>
        <div className="text-right">
          <Badge variant="vip" className="text-sm px-3 py-1 gold-pulse">
            VIP {userVipLevel}
          </Badge>
          <p className="text-xs text-muted-foreground mt-1">
            Saldo: <span className="text-primary font-semibold">{formatCurrency(balance)}</span>
          </p>
        </div>
      </div>

      {/* Available Products */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Package className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-heading font-bold text-foreground">Tersedia untuk Anda</h2>
        </div>

        <div className="space-y-4">
          {availableProducts.map((product) => (
            <Card 
              key={product.id} 
              className="shadow-card hover:shadow-glow transition-all duration-300 overflow-hidden border-primary/20 hover:border-primary/50"
            >
              {/* Product Image */}
              <div className="relative h-40 overflow-hidden">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
                <Badge variant="vip" className="absolute top-3 right-3 text-xs">
                  VIP {product.vipLevel}
                </Badge>
              </div>

              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground text-lg mb-1">{product.name}</h3>
                    <p className="text-sm text-muted-foreground">{product.description}</p>
                  </div>
                </div>

                <div className="text-right mb-4">
                  <p className="text-xs text-muted-foreground mb-1">Harga Investasi</p>
                  <p className="text-2xl font-bold text-primary drop-shadow-[0_0_10px_hsl(185,100%,50%)]">
                    {formatCurrency(product.price)}
                  </p>
                </div>

                <div className="bg-muted/50 rounded-lg p-4 mb-4 space-y-3 border border-border/50">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Penghasilan Harian</span>
                    <span className="text-base font-bold text-success drop-shadow-[0_0_8px_hsl(145,100%,50%)]">
                      {formatCurrency(product.dailyIncome)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Masa Berlaku</span>
                    <span className="text-base font-semibold text-foreground">{product.validity} Hari</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-border/50">
                    <span className="text-sm font-medium text-foreground">Total Penghasilan</span>
                    <span className="text-lg font-bold text-accent drop-shadow-[0_0_8px_hsl(330,100%,60%)]">
                      {formatCurrency(product.totalIncome)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-3 p-3 bg-success/10 rounded-md border border-success/20">
                  <TrendingUp className="w-4 h-4 text-success" />
                  <span className="text-sm font-medium text-success">
                    ROI: {((product.totalIncome / product.price - 1) * 100).toFixed(0)}%
                  </span>
                </div>

                <Button 
                  className="w-full neon-pulse" 
                  onClick={() => handleInvest(product)}
                >
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
            <Lock className="w-5 h-5 text-muted-foreground" />
            <h2 className="text-lg font-heading font-bold text-foreground">Produk Terkunci</h2>
          </div>

          <div className="space-y-4">
            {lockedProducts.map((product) => (
              <Card 
                key={product.id} 
                className="opacity-60 relative overflow-hidden border-muted"
              >
                <div className="absolute inset-0 bg-background/60 backdrop-blur-sm z-10 flex items-center justify-center">
                  <div className="text-center p-4">
                    <Lock className="w-8 h-8 text-vip-gold mx-auto mb-2" />
                    <Badge variant="outline" className="bg-card/80 border-vip-gold text-vip-gold">
                      Butuh VIP {product.vipLevel}
                    </Badge>
                  </div>
                </div>
                
                {/* Product Image */}
                <div className="relative h-32 overflow-hidden">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover grayscale"
                  />
                </div>

                <CardContent className="p-4">
                  <h3 className="font-semibold text-foreground text-lg mb-1">{product.name}</h3>
                  <p className="text-xl font-bold text-primary/50">{formatCurrency(product.price)}</p>
                  <p className="text-sm text-success/50 mt-1">
                    +{formatCurrency(product.dailyIncome)}/hari
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="mt-4 bg-gradient-to-r from-primary/20 via-accent/20 to-vip-gold/20 border-primary/30 shadow-glow">
            <CardContent className="p-5 text-center">
              <Sparkles className="w-10 h-10 text-vip-gold mx-auto mb-3" />
              <h3 className="font-bold text-lg mb-2 text-foreground">Tingkatkan Level VIP Anda!</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Ajak teman untuk membuka produk eksklusif dengan penghasilan lebih tinggi
              </p>
              <Button variant="vip" asChild className="gold-pulse">
                <a href="/team">Lihat Program Referral</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Invest Dialog */}
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

export default ProductPage;
