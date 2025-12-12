import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Users,
  Gift,
  Package,
} from "lucide-react";
import { getCurrentUser, getTransactions, getInvestments, formatCurrency, User, Transaction, Investment } from "@/lib/store";

const Account = () => {
  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      setTransactions(getTransactions(currentUser.id));
      setInvestments(getInvestments(currentUser.id));
    }
  }, []);

  const monitoringData = {
    totalIncome: user?.totalIncome || 0,
    totalRecharge: user?.totalRecharge || 0,
    totalInvest: user?.totalInvest || 0,
    totalWithdraw: user?.totalWithdraw || 0,
    totalRabat: user?.totalRabat || 0,
    teamIncome: user?.teamIncome || 0,
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "recharge":
        return <ArrowUpRight className="w-4 h-4 text-success" />;
      case "withdraw":
        return <ArrowDownRight className="w-4 h-4 text-accent" />;
      case "income":
        return <TrendingUp className="w-4 h-4 text-success" />;
      case "commission":
        return <Users className="w-4 h-4 text-primary" />;
      case "invest":
        return <Package className="w-4 h-4 text-primary" />;
      default:
        return <Wallet className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getTransactionLabel = (type: string) => {
    const labels: Record<string, string> = {
      recharge: "Recharge",
      withdraw: "Withdraw",
      invest: "Investasi",
      income: "Penghasilan Harian",
      commission: "Komisi Referral",
    };
    return labels[type] || type;
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "success":
        return "success";
      case "pending":
        return "outline";
      case "rejected":
        return "destructive";
      default:
        return "outline";
    }
  };

  const activeInvestments = investments.filter(i => i.status === 'active');

  return (
    <div className="space-y-6 p-4 pt-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground mb-1">Akun Saya</h1>
        <p className="text-sm text-muted-foreground">Monitor aktivitas dan performa Anda</p>
      </div>

      {/* Monitoring Dashboard */}
      <div>
        <h2 className="text-lg font-heading font-bold text-foreground mb-4">Monitoring</h2>
        <div className="grid grid-cols-2 gap-3">
          <Card className="shadow-card bg-gradient-to-br from-success/20 to-success/5 border-success/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-success" />
                <p className="text-xs font-medium text-muted-foreground">Total Income</p>
              </div>
              <p className="text-xl font-bold text-success">{formatCurrency(monitoringData.totalIncome)}</p>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <ArrowUpRight className="w-4 h-4 text-success" />
                <p className="text-xs font-medium text-muted-foreground">Total Recharge</p>
              </div>
              <p className="text-xl font-bold text-foreground">
                {formatCurrency(monitoringData.totalRecharge)}
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Wallet className="w-4 h-4 text-primary" />
                <p className="text-xs font-medium text-muted-foreground">Total Invest</p>
              </div>
              <p className="text-xl font-bold text-foreground">
                {formatCurrency(monitoringData.totalInvest)}
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <ArrowDownRight className="w-4 h-4 text-accent" />
                <p className="text-xs font-medium text-muted-foreground">Total Withdraw</p>
              </div>
              <p className="text-xl font-bold text-foreground">
                {formatCurrency(monitoringData.totalWithdraw)}
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Gift className="w-4 h-4 text-accent" />
                <p className="text-xs font-medium text-muted-foreground">Total Rabat</p>
              </div>
              <p className="text-xl font-bold text-foreground">
                {formatCurrency(monitoringData.totalRabat)}
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card bg-gradient-to-br from-primary/20 to-primary/5 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-primary" />
                <p className="text-xs font-medium text-muted-foreground">Team Income</p>
              </div>
              <p className="text-xl font-bold text-primary">{formatCurrency(monitoringData.teamIncome)}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Active Investments */}
      {activeInvestments.length > 0 && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              Investasi Aktif
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {activeInvestments.map((inv) => (
              <div key={inv.id} className="bg-muted rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-foreground">{inv.productName}</p>
                    <p className="text-xs text-muted-foreground">
                      {inv.daysRemaining} hari tersisa
                    </p>
                  </div>
                  <Badge variant="success" className="text-xs">Aktif</Badge>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-border">
                  <div>
                    <p className="text-xs text-muted-foreground">Investasi</p>
                    <p className="text-sm font-semibold">{formatCurrency(inv.amount)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Harian</p>
                    <p className="text-sm font-semibold text-success">{formatCurrency(inv.dailyIncome)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Earned</p>
                    <p className="text-sm font-semibold text-accent">{formatCurrency(inv.totalEarned)}</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Transaction History */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-base">Riwayat Transaksi</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="w-full grid grid-cols-3 mb-4">
              <TabsTrigger value="all" className="text-xs">Semua</TabsTrigger>
              <TabsTrigger value="recharge" className="text-xs">Recharge</TabsTrigger>
              <TabsTrigger value="withdraw" className="text-xs">Withdraw</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-2">
              {transactions.length === 0 ? (
                <div className="text-center py-8">
                  <Wallet className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground">Belum ada transaksi</p>
                </div>
              ) : (
                transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-background rounded-full flex items-center justify-center">
                        {getTransactionIcon(transaction.type)}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-foreground">
                          {getTransactionLabel(transaction.type)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(transaction.date).toLocaleDateString("id-ID")}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-sm font-bold ${
                          transaction.amount > 0 ? "text-success" : "text-foreground"
                        }`}
                      >
                        {transaction.amount > 0 ? "+" : ""}
                        {formatCurrency(Math.abs(transaction.amount))}
                      </p>
                      <Badge
                        variant={getStatusVariant(transaction.status) as any}
                        className="text-xs capitalize"
                      >
                        {transaction.status}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>

            <TabsContent value="recharge" className="space-y-2">
              {transactions.filter((t) => t.type === "recharge").length === 0 ? (
                <div className="text-center py-8">
                  <ArrowUpRight className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground">Belum ada recharge</p>
                </div>
              ) : (
                transactions
                  .filter((t) => t.type === "recharge")
                  .map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-3 bg-muted rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-background rounded-full flex items-center justify-center">
                          {getTransactionIcon(transaction.type)}
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-foreground">
                            {getTransactionLabel(transaction.type)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(transaction.date).toLocaleDateString("id-ID")}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-success">
                          +{formatCurrency(transaction.amount)}
                        </p>
                        <Badge
                          variant={getStatusVariant(transaction.status) as any}
                          className="text-xs capitalize"
                        >
                          {transaction.status}
                        </Badge>
                      </div>
                    </div>
                  ))
              )}
            </TabsContent>

            <TabsContent value="withdraw" className="space-y-2">
              {transactions.filter((t) => t.type === "withdraw").length === 0 ? (
                <div className="text-center py-8">
                  <ArrowDownRight className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground">Belum ada withdraw</p>
                </div>
              ) : (
                transactions
                  .filter((t) => t.type === "withdraw")
                  .map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-3 bg-muted rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-background rounded-full flex items-center justify-center">
                          {getTransactionIcon(transaction.type)}
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-foreground">
                            {getTransactionLabel(transaction.type)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(transaction.date).toLocaleDateString("id-ID")}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-foreground">
                          {formatCurrency(transaction.amount)}
                        </p>
                        <Badge
                          variant={getStatusVariant(transaction.status) as any}
                          className="text-xs capitalize"
                        >
                          {transaction.status}
                        </Badge>
                      </div>
                    </div>
                  ))
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Account;
