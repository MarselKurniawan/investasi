import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import {
  getAllProfiles,
  getPendingTransactions,
  updateTransactionStatus,
  updateProfile,
  getCoupons,
  createCoupon,
  deleteCoupon,
  formatCurrency,
  Profile,
  Transaction,
  Coupon,
} from "@/lib/database";
import {
  Users,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle,
  XCircle,
  ShieldCheck,
  TrendingUp,
  Wallet,
  Trash2,
  UserCog,
  Package,
  Ticket,
  Copy,
} from "lucide-react";
import { Link } from "react-router-dom";

interface PendingTx extends Transaction {
  userName?: string;
  userEmail?: string;
}

const Admin = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [pendingTransactions, setPendingTransactions] = useState<PendingTx[]>([]);
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [couponDialogOpen, setCouponDialogOpen] = useState(false);
  const [coupons, setCoupons] = useState<Coupon[]>([]);

  const loadData = async () => {
    const [profilesData, txData, couponData] = await Promise.all([
      getAllProfiles(),
      getPendingTransactions(),
      getCoupons(),
    ]);
    setProfiles(profilesData);
    
    // Enrich transactions with user info
    const enrichedTx = txData.map(tx => {
      const profile = profilesData.find(p => p.user_id === tx.user_id);
      return {
        ...tx,
        userName: profile?.name || 'Unknown',
        userEmail: profile?.email || '',
      };
    });
    setPendingTransactions(enrichedTx);
    setCoupons(couponData);
  };

  useEffect(() => {
    loadData();
  }, []);

  const generateCoupon = async () => {
    const code = "CPK" + Math.random().toString(36).substring(2, 8).toUpperCase();
    const result = await createCoupon(code);
    if (result) {
      toast({ title: "Kupon Dibuat", description: `Kode: ${code}` });
      loadData();
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    await deleteCoupon(id);
    toast({ title: "Kupon Dihapus" });
    loadData();
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: "Disalin", description: `Kode ${code} disalin ke clipboard` });
  };

  const handleApprove = async (tx: PendingTx) => {
    setIsLoading(tx.id);
    
    // Update transaction status
    await updateTransactionStatus(tx.id, "success");
    
    // For withdrawals, also update total_withdraw
    if (tx.type === 'withdraw') {
      const profile = profiles.find(p => p.user_id === tx.user_id);
      if (profile) {
        await updateProfile(tx.user_id, {
          total_withdraw: profile.total_withdraw + tx.amount
        });
      }
    }
    
    toast({ title: "Transaksi Disetujui", description: "Status berhasil diupdate" });
    setIsLoading(null);
    loadData();
  };

  const handleReject = async (tx: PendingTx) => {
    setIsLoading(tx.id);
    
    // Update transaction status
    await updateTransactionStatus(tx.id, "rejected");
    
    // For withdrawals, refund the balance
    if (tx.type === 'withdraw') {
      const profile = profiles.find(p => p.user_id === tx.user_id);
      if (profile) {
        await updateProfile(tx.user_id, {
          balance: profile.balance + tx.amount
        });
      }
    }
    
    toast({ title: "Transaksi Ditolak", description: "Balance dikembalikan", variant: "destructive" });
    setIsLoading(null);
    loadData();
  };

  const stats = {
    totalUsers: profiles.length,
    totalBalance: profiles.reduce((sum, u) => sum + u.balance, 0),
    pendingCount: pendingTransactions.length,
    totalRecharge: profiles.reduce((sum, u) => sum + u.total_recharge, 0),
    totalWithdraw: profiles.reduce((sum, u) => sum + u.total_withdraw, 0),
    totalIncome: profiles.reduce((sum, u) => sum + u.total_income, 0),
  };

  return (
    <div className="space-y-6 p-4 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-heading font-bold text-foreground">Admin Panel</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">Kelola pengguna dan transaksi</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setCouponDialogOpen(true)}>
            <Ticket className="w-4 h-4 mr-2" />Kupon
          </Button>
          <Link to="/admin/products">
            <Button variant="outline" size="sm"><Package className="w-4 h-4 mr-2" />Produk</Button>
          </Link>
          <Link to="/admin/users">
            <Button variant="default" size="sm"><UserCog className="w-4 h-4 mr-2" />Users</Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-primary" />
              <p className="text-xs text-muted-foreground">Total Users</p>
            </div>
            <p className="text-2xl font-bold">{stats.totalUsers}</p>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="w-4 h-4 text-success" />
              <p className="text-xs text-muted-foreground">Total Balance</p>
            </div>
            <p className="text-lg font-bold">{formatCurrency(stats.totalBalance)}</p>
          </CardContent>
        </Card>
        <Card className="shadow-card bg-accent/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <ArrowUpRight className="w-4 h-4 text-accent" />
              <p className="text-xs text-muted-foreground">Pending</p>
            </div>
            <p className="text-2xl font-bold text-accent">{stats.pendingCount}</p>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <p className="text-xs text-muted-foreground">Total Income</p>
            </div>
            <p className="text-sm font-bold">{formatCurrency(stats.totalIncome)}</p>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <ArrowUpRight className="w-4 h-4 text-success" />
              <p className="text-xs text-muted-foreground">Total Recharge</p>
            </div>
            <p className="text-sm font-bold">{formatCurrency(stats.totalRecharge)}</p>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <ArrowDownRight className="w-4 h-4 text-destructive" />
              <p className="text-xs text-muted-foreground">Total Withdraw</p>
            </div>
            <p className="text-sm font-bold">{formatCurrency(stats.totalWithdraw)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Transactions */}
      <div>
        <h2 className="text-lg font-bold mb-3">Transaksi Pending ({pendingTransactions.length})</h2>
        {pendingTransactions.length === 0 ? (
          <Card className="shadow-card">
            <CardContent className="p-8 text-center">
              <CheckCircle className="w-12 h-12 text-success mx-auto mb-3 opacity-50" />
              <p className="text-muted-foreground">Tidak ada transaksi pending</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {pendingTransactions.map((tx) => (
              <Card key={tx.id} className="shadow-card">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === "recharge" ? "bg-success/20" : "bg-accent/20"}`}>
                        {tx.type === "recharge" ? <ArrowUpRight className="w-5 h-5 text-success" /> : <ArrowDownRight className="w-5 h-5 text-accent" />}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{tx.userName}</p>
                        <p className="text-xs text-muted-foreground">{tx.userEmail}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-accent">Pending</Badge>
                  </div>
                  <div className="bg-muted rounded-lg p-3 mb-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground capitalize">{tx.type}</span>
                      <span className={`text-lg font-bold ${tx.type === "recharge" ? "text-success" : "text-accent"}`}>
                        {tx.type === "recharge" ? "+" : "-"}{formatCurrency(tx.amount)}
                      </span>
                    </div>
                    {tx.description && <p className="text-xs text-muted-foreground mt-1">{tx.description}</p>}
                    <p className="text-xs text-muted-foreground mt-1">{new Date(tx.created_at).toLocaleString("id-ID")}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="default" size="sm" className="flex-1 bg-success hover:bg-success/90" onClick={() => handleApprove(tx)} disabled={isLoading === tx.id}>
                      <CheckCircle className="w-4 h-4 mr-1" />Approve
                    </Button>
                    <Button variant="destructive" size="sm" className="flex-1" onClick={() => handleReject(tx)} disabled={isLoading === tx.id}>
                      <XCircle className="w-4 h-4 mr-1" />Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Coupon Dialog */}
      <Dialog open={couponDialogOpen} onOpenChange={setCouponDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Ticket className="w-5 h-5 text-primary" />Kelola Kupon</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Button onClick={generateCoupon} className="w-full"><Ticket className="w-4 h-4 mr-2" />Generate Kupon Baru</Button>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {coupons.map((coupon) => (
                <div key={coupon.id} className={`flex items-center justify-between p-3 rounded-lg border ${coupon.is_used ? "bg-muted/50 opacity-60" : "bg-muted"}`}>
                  <div>
                    <p className="font-mono font-bold text-foreground">{coupon.code}</p>
                    <p className="text-xs text-muted-foreground">
                      {coupon.is_used ? `Digunakan - ${formatCurrency(coupon.reward_amount || 0)}` : "Belum digunakan"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {!coupon.is_used && (
                      <Button variant="ghost" size="icon" onClick={() => copyToClipboard(coupon.code)}>
                        <Copy className="w-4 h-4" />
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteCoupon(coupon.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {coupons.length === 0 && <p className="text-center text-muted-foreground py-4">Belum ada kupon</p>}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;
