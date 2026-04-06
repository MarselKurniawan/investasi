import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

  const displayPrice = hasPromoPrice ? product.promo_price! : product.price;
  const displayDailyIncome = hasPromoDailyIncome ? product.promo_daily_income! : product.daily_income;
  const displayValidity = hasPromoValidity ? product.promo_validity! : product.validity;
  const dailyPercent = ((displayDailyIncome / displayPrice) * 100).toFixed(2);

  return (
    <Card className="overflow-hidden border-border/50 hover:border-primary/30 transition-colors">
      <CardContent className="p-0">
        {/* Top: Image + Name */}
        <div className="flex gap-3 p-3 pb-0">
          {/* Product Image */}
          <div className="relative w-28 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
            <img 
              src={product.image} 
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Product Name + Specs Grid */}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-foreground mb-2 leading-tight truncate">{product.name}</h3>
            
            {/* 2x2 Specs Grid */}
            <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 bg-muted/50 rounded-lg p-2">
              <div>
                <p className="text-success text-xs font-bold">{dailyPercent}%</p>
                <p className="text-[10px] text-muted-foreground">Performa Harian</p>
              </div>
              <div>
                <p className="text-success text-xs font-bold">
                  {hasPromoDailyIncome ? (
                    <>{formatCurrency(product.promo_daily_income!)}</>
                  ) : (
                    formatCurrency(product.daily_income)
                  )}
                </p>
                <p className="text-[10px] text-muted-foreground">sehari-hari</p>
              </div>
              <div>
                <p className="text-primary text-xs font-bold">
                  {hasPromoValidity ? (
                    <>{product.promo_validity!}Hari</>
                  ) : (
                    <>{product.validity}Hari</>
                  )}
                </p>
                <p className="text-[10px] text-muted-foreground">Periode Minimum</p>
              </div>
              <div>
                <p className="text-primary text-xs font-bold">1Unit</p>
                <p className="text-[10px] text-muted-foreground">Batas per orang</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom: Price + Action */}
        <div className="flex items-center gap-2 px-3 py-2.5 mt-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-muted-foreground">Investasi:</span>
              {hasPromoPrice && (
                <span className="text-[10px] text-muted-foreground line-through">{formatCurrency(product.price)}</span>
              )}
              <span className="text-sm font-bold text-destructive">{formatCurrency(displayPrice)}</span>
            </div>
          </div>
          <Button 
            size="sm"
            className="text-xs px-5 h-8 rounded-full font-semibold"
            onClick={() => onInvest(product)}
          >
            Beli sekarang
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
