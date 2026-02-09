import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, TrendingUp, Lock, Sparkles, Eye, Calendar, Zap } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { getProducts, formatCurrency, Product } from "@/lib/database";
import InvestDialog from "@/components/InvestDialog";
import ProductDetailDialog from "@/components/ProductDetailDialog";

const ProductPage = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [investOpen, setInvestOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);

  const loadData = async () => {
    const productsData = await getProducts();
    setProducts(productsData);
    await refreshProfile();
  };

  useEffect(() => {
    loadData();
  }, []);

  const userVipLevel = profile?.vip_level || 1;
  const balance = profile?.balance || 0;

  const availableProducts = products.filter(
    (product) => product.vip_level <= userVipLevel
  );

  const lockedProducts = products.filter(
    (product) => product.vip_level > userVipLevel
  );

  const handleViewDetail = (product: Product) => {
    setSelectedProduct(product);
    setDetailOpen(true);
  };

  const handleInvest = (product: Product) => {
    setSelectedProduct(product);
    setInvestOpen(true);
  };

  const handleInvestFromDetail = () => {
    if (selectedProduct) {
      setDetailOpen(false);
      setTimeout(() => setInvestOpen(true), 200);
    }
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
              <CardContent className="p-0">
                <div className="flex">
                  {/* Product Image - Left Side */}
                  <div className="relative w-32 sm:w-40 flex-shrink-0">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-full object-cover min-h-[180px]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-card/50" />
                    <Badge variant="vip" className="absolute top-2 left-2 text-xs">
                      VIP {product.vip_level}
                    </Badge>
                  </div>

                  {/* Product Info - Right Side */}
                  <div className="flex-1 p-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between mb-1">
                        <h3 className="font-semibold text-foreground text-lg leading-tight">{product.name}</h3>
                      </div>
                      <p className="text-xs text-muted-foreground mb-3">{product.description}</p>

                      {/* Price */}
                      <p className="text-xl font-bold text-primary mb-3">
                        {formatCurrency(product.price)}
                      </p>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <div className="flex items-center gap-1.5">
                          <TrendingUp className="w-3.5 h-3.5 text-success" />
                          <div>
                            <p className="text-[10px] text-muted-foreground">Harian</p>
                            <p className="text-xs font-bold text-success">{formatCurrency(product.daily_income)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-accent" />
                          <div>
                            <p className="text-[10px] text-muted-foreground">Durasi</p>
                            <p className="text-xs font-bold text-foreground">{product.validity} hari</p>
                          </div>
                        </div>
                      </div>

                      {/* ROI Badge */}
                      <div className="flex items-center gap-1.5 mb-3">
                        <Zap className="w-3.5 h-3.5 text-vip-gold" />
                        <span className="text-xs font-semibold text-vip-gold">
                          ROI: {((product.total_income / product.price - 1) * 100).toFixed(0)}% • Total: {formatCurrency(product.total_income)}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="flex-1"
                        onClick={() => handleViewDetail(product)}
                      >
                        <Eye className="w-3.5 h-3.5 mr-1.5" />
                        Detail
                      </Button>
                      <Button 
                        size="sm"
                        className="flex-1 neon-pulse" 
                        onClick={() => handleInvest(product)}
                      >
                        Investasi
                      </Button>
                    </div>
                  </div>
                </div>
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

          <div className="space-y-3">
            {lockedProducts.map((product) => (
              <Card 
                key={product.id} 
                className="opacity-60 relative overflow-hidden border-muted"
              >
                <div className="absolute inset-0 bg-background/60 backdrop-blur-sm z-10 flex items-center justify-center">
                  <div className="text-center p-4">
                    <Lock className="w-6 h-6 text-vip-gold mx-auto mb-2" />
                    <Badge variant="outline" className="bg-card/80 border-vip-gold text-vip-gold text-xs">
                      Butuh VIP {product.vip_level}
                    </Badge>
                  </div>
                </div>
                
                <CardContent className="p-0">
                  <div className="flex">
                    {/* Product Image */}
                    <div className="relative w-24 flex-shrink-0">
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-full h-full object-cover min-h-[100px] grayscale"
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 p-3">
                      <h3 className="font-semibold text-foreground text-sm mb-1">{product.name}</h3>
                      <p className="text-sm font-bold text-primary/50">{formatCurrency(product.price)}</p>
                      <p className="text-xs text-success/50 mt-0.5">
                        +{formatCurrency(product.daily_income)}/hari
                      </p>
                    </div>
                  </div>
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

      {/* Product Detail Dialog */}
      <ProductDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        product={selectedProduct}
        userName={profile?.name}
        onInvest={handleInvestFromDetail}
      />

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
