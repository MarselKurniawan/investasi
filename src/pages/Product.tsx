import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { getProducts, formatCurrency, Product } from "@/lib/database";
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

  const filteredProducts = activeCategory === "all" 
    ? products 
    : products.filter(p => p.category === activeCategory);

  const availableProducts = filteredProducts.filter(p => p.vip_level <= userVipLevel);
  const lockedProducts = filteredProducts.filter(p => p.vip_level > userVipLevel);

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
    <div className="space-y-4 p-4 pt-5">
      {/* Category Tabs - Sticky */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm -mx-4 px-4 py-2">
        <Tabs value={activeCategory} onValueChange={setActiveCategory}>
          <TabsList className="w-full grid grid-cols-4 h-9">
            <TabsTrigger value="all" className="text-[11px]">Semua</TabsTrigger>
            <TabsTrigger value="reguler" className="text-[11px]">Reguler</TabsTrigger>
            <TabsTrigger value="promo" className="text-[11px]">🔥 Promo</TabsTrigger>
            <TabsTrigger value="vip" className="text-[11px]">👑 VIP</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Available Products */}
      <div className="space-y-3">
        {availableProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onViewDetail={handleViewDetail}
            onInvest={handleInvest}
          />
        ))}
      </div>

      {/* Empty State */}
      {availableProducts.length === 0 && lockedProducts.length === 0 && (
        <div className="text-center py-12 text-muted-foreground text-xs">
          Tidak ada produk dalam kategori ini
        </div>
      )}

      {/* Locked Products */}
      {lockedProducts.length > 0 && (
        <div className="space-y-3">
          {lockedProducts.map((product) => {
            const displayPrice = product.promo_price ?? product.price;
            return (
              <Card key={product.id} className="opacity-60 relative overflow-hidden border-border/50">
                <div className="absolute inset-0 bg-background/60 backdrop-blur-sm z-10 flex items-center justify-center">
                  <div className="text-center">
                    <Lock className="w-5 h-5 text-vip-gold mx-auto mb-1" />
                    <p className="text-[10px] text-vip-gold font-medium">Buka kunci VIP {product.vip_level}</p>
                  </div>
                </div>
                <CardContent className="p-3">
                  <div className="flex gap-3">
                    <div className="w-28 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover grayscale" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">{product.name}</p>
                      <p className="text-xs text-primary/50 mt-1">{formatCurrency(displayPrice)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <ProductDetailDialog open={detailOpen} onOpenChange={setDetailOpen} product={selectedProduct} userName={profile?.name} onInvest={handleInvestFromDetail} />
      <InvestDialog open={investOpen} onOpenChange={setInvestOpen} product={selectedProduct} balance={profile?.balance || 0} onSuccess={loadData} />
    </div>
  );
};

export default ProductPage;
