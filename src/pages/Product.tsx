import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, TrendingUp, Lock, Sparkles, Eye, Calendar, Zap } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { getProducts, formatCurrency, Product, ProductCategory } from "@/lib/database";
import InvestDialog from "@/components/InvestDialog";
import ProductDetailDialog from "@/components/ProductDetailDialog";
import ProductCard from "@/components/ProductCard";

const ProductPage = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [investOpen, setInvestOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const loadData = async () => {
    const productsData = await getProducts();
    setProducts(productsData);
    await refreshProfile();
  };

  useEffect(() => {
    loadData();
  }, []);

  const userVipLevel = profile?.vip_level || 0;
  const balance = profile?.balance || 0;

  const filteredProducts = activeCategory === "all" 
    ? products 
    : products.filter(p => p.category === activeCategory);

  const availableProducts = filteredProducts.filter(
    (product) => product.vip_level <= userVipLevel
  );

  const lockedProducts = filteredProducts.filter(
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

  const categoryCount = (cat: string) => {
    if (cat === "all") return products.length;
    return products.filter(p => p.category === cat).length;
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
          <Badge variant="vip" className="text-sm px-3 py-1">
            VIP {userVipLevel}
          </Badge>
          <p className="text-xs text-muted-foreground mt-1">
            Saldo: <span className="text-primary font-semibold">{formatCurrency(balance)}</span>
          </p>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm pb-2 -mx-4 px-4 pt-1">
        <Tabs value={activeCategory} onValueChange={setActiveCategory}>
          <TabsList className="w-full grid grid-cols-4">
            <TabsTrigger value="all" className="text-xs">
              Semua ({categoryCount("all")})
            </TabsTrigger>
            <TabsTrigger value="reguler" className="text-xs">
              Reguler ({categoryCount("reguler")})
            </TabsTrigger>
            <TabsTrigger value="promo" className="text-xs">
              🔥 Promo ({categoryCount("promo")})
            </TabsTrigger>
            <TabsTrigger value="vip" className="text-xs">
              👑 VIP ({categoryCount("vip")})
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Available Products */}
      {availableProducts.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Package className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-heading font-bold text-foreground">Tersedia untuk Anda</h2>
          </div>

          <div className="space-y-4">
            {availableProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onViewDetail={handleViewDetail}
                onInvest={handleInvest}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {availableProducts.length === 0 && lockedProducts.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Tidak ada produk dalam kategori ini</p>
        </div>
      )}

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
                    <div className="relative w-24 flex-shrink-0">
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-full h-full object-cover min-h-[100px] grayscale"
                      />
                    </div>
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

          <Card className="mt-4 bg-gradient-to-r from-primary/20 via-accent/20 to-vip-gold/20 border-primary/30">
            <CardContent className="p-5 text-center">
              <Sparkles className="w-10 h-10 text-vip-gold mx-auto mb-3" />
              <h3 className="font-bold text-lg mb-2 text-foreground">Tingkatkan Level VIP Anda!</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Ajak teman untuk membuka produk eksklusif dengan penghasilan lebih tinggi
              </p>
              <Button variant="vip" asChild>
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
