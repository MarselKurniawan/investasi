import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Building2, MapPin, Phone, Mail, Globe, Shield, Award, Users, TrendingUp } from "lucide-react";

interface CompanyProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CompanyProfileDialog = ({ open, onOpenChange }: CompanyProfileDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            Profil Perusahaan
          </DialogTitle>
          <DialogDescription>
            Informasi lengkap tentang InvestPro
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Company Logo & Name */}
          <div className="text-center">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-primary via-accent to-vip-gold rounded-2xl flex items-center justify-center shadow-glow mb-4">
              <span className="text-3xl font-bold text-white">IP</span>
            </div>
            <h2 className="text-xl font-bold text-foreground">PT InvestPro Indonesia</h2>
            <Badge variant="vip" className="mt-2">Platform Investasi Terpercaya</Badge>
          </div>

          <Separator />

          {/* About */}
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Award className="w-4 h-4 text-vip-gold" />
              Tentang Kami
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              InvestPro adalah platform investasi digital terkemuka di Indonesia yang menyediakan 
              berbagai produk investasi dengan return tinggi dan keamanan terjamin. Didirikan pada 
              tahun 2020, kami telah melayani lebih dari 100.000 investor di seluruh Indonesia.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-muted/50 rounded-lg p-3 text-center border border-border/50">
              <Users className="w-5 h-5 mx-auto text-primary mb-1" />
              <p className="text-lg font-bold text-foreground">100K+</p>
              <p className="text-xs text-muted-foreground">Investor</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3 text-center border border-border/50">
              <TrendingUp className="w-5 h-5 mx-auto text-success mb-1" />
              <p className="text-lg font-bold text-foreground">15%</p>
              <p className="text-xs text-muted-foreground">Avg Return</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3 text-center border border-border/50">
              <Shield className="w-5 h-5 mx-auto text-accent mb-1" />
              <p className="text-lg font-bold text-foreground">100%</p>
              <p className="text-xs text-muted-foreground">Aman</p>
            </div>
          </div>

          <Separator />

          {/* Contact Info */}
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Phone className="w-4 h-4 text-primary" />
              Kontak
            </h3>
            
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-2 bg-muted/50 rounded-lg">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-foreground">
                  Jl. Sudirman No. 123, Jakarta Pusat 10220
                </span>
              </div>
              
              <div className="flex items-center gap-3 p-2 bg-muted/50 rounded-lg">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-foreground">
                  +62 812-3456-7890
                </span>
              </div>
              
              <div className="flex items-center gap-3 p-2 bg-muted/50 rounded-lg">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-foreground">
                  support@investpro.id
                </span>
              </div>
              
              <div className="flex items-center gap-3 p-2 bg-muted/50 rounded-lg">
                <Globe className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-foreground">
                  www.investpro.id
                </span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Legal */}
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Shield className="w-4 h-4 text-success" />
              Legalitas
            </h3>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between p-2 bg-success/10 rounded-lg border border-success/30">
                <span className="text-muted-foreground">NIB</span>
                <span className="font-medium text-foreground">1234567890123</span>
              </div>
              <div className="flex justify-between p-2 bg-success/10 rounded-lg border border-success/30">
                <span className="text-muted-foreground">NPWP</span>
                <span className="font-medium text-foreground">12.345.678.9-012.345</span>
              </div>
              <div className="flex justify-between p-2 bg-success/10 rounded-lg border border-success/30">
                <span className="text-muted-foreground">SK Kemenkumham</span>
                <span className="font-medium text-foreground">AHU-0012345</span>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="p-3 bg-accent/10 rounded-lg border border-accent/30">
            <p className="text-xs text-muted-foreground">
              ⚠️ <strong>Disclaimer:</strong> Investasi mengandung risiko. Pastikan Anda memahami 
              produk investasi sebelum berinvestasi. Kinerja masa lalu bukan jaminan kinerja masa depan.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CompanyProfileDialog;
