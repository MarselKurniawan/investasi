import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, Eye, Calendar, Zap } from "lucide-react";
import { formatCurrency, Product } from "@/lib/database";

interface ProductCardProps {
  product: Product;
  onViewDetail: (product: Product) => void;
  onInvest: (product: Product) => void;
}

const ProductCard = ({ product, onViewDetail, onInvest }: ProductCardProps) => {
  const hasPromoPrice = product.promo_price !== null && product.promo_price !== undefined;
  const hasPromoDailyIncome = product.promo_daily_income !== null && product.promo_daily_income !== undefined;
  const hasPromoValidity = product.promo_validity !== null && product.promo_validity !== undefined;
  const isPromo = hasPromoPrice || hasPromoDailyIncome || hasPromoValidity;

  const displayPrice = hasPromoPrice ? product.promo_price! : product.price;
  const displayDailyIncome = hasPromoDailyIncome ? product.promo_daily_income! : product.daily_income;
  const displayValidity = hasPromoValidity ? product.promo_validity! : product.validity;
  const displayTotalIncome = displayDailyIncome * displayValidity;

  const getCategoryBadge = () => {
    switch (product.category) {
      case 'promo':
        return <Badge className="bg-destructive/90 text-destructive-foreground text-[10px] px-1.5">🔥 PROMO</Badge>;
      case 'vip':
        return <Badge variant="vip" className="text-[10px] px-1.5">👑 VIP</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card className="shadow-card transition-all duration-300 overflow-hidden border-primary/20 hover:border-primary/50">
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
            {getCategoryBadge() && (
              <div className="absolute bottom-2 left-2">
                {getCategoryBadge()}
              </div>
            )}
          </div>

          {/* Product Info - Right Side */}
          <div className="flex-1 p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between mb-1">
                <h3 className="font-semibold text-foreground text-lg leading-tight">{product.name}</h3>
              </div>
              <p className="text-xs text-muted-foreground mb-3">{product.description}</p>

              {/* Price */}
              <div className="mb-3">
                {hasPromoPrice ? (
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-muted-foreground line-through">{formatCurrency(product.price)}</p>
                    <p className="text-xl font-bold text-destructive">{formatCurrency(product.promo_price!)}</p>
                  </div>
                ) : (
                  <p className="text-xl font-bold text-primary">{formatCurrency(product.price)}</p>
                )}
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-success" />
                  <div>
                    <p className="text-[10px] text-muted-foreground">Harian</p>
                    {hasPromoDailyIncome ? (
                      <div>
                        <p className="text-[10px] text-muted-foreground line-through">{formatCurrency(product.daily_income)}</p>
                        <p className="text-xs font-bold text-success">{formatCurrency(product.promo_daily_income!)}</p>
                      </div>
                    ) : (
                      <p className="text-xs font-bold text-success">{formatCurrency(product.daily_income)}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-accent" />
                  <div>
                    <p className="text-[10px] text-muted-foreground">Durasi</p>
                    {hasPromoValidity ? (
                      <div>
                        <p className="text-[10px] text-muted-foreground line-through">{product.validity} hari</p>
                        <p className="text-xs font-bold text-foreground">{product.promo_validity!} hari</p>
                      </div>
                    ) : (
                      <p className="text-xs font-bold text-foreground">{product.validity} hari</p>
                    )}
                  </div>
                </div>
              </div>

              {/* ROI Badge */}
              <div className="flex items-center gap-1.5 mb-3">
                <Zap className="w-3.5 h-3.5 text-vip-gold" />
                <span className="text-xs font-semibold text-vip-gold">
                  ROI: {((displayTotalIncome / displayPrice - 1) * 100).toFixed(0)}% • Total: {formatCurrency(displayTotalIncome)}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                className="flex-1"
                onClick={() => onViewDetail(product)}
              >
                <Eye className="w-3.5 h-3.5 mr-1.5" />
                Detail
              </Button>
              <Button 
                size="sm"
                className="flex-1" 
                onClick={() => onInvest(product)}
              >
                Investasi
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
