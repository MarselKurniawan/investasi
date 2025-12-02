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
} from "lucide-react";

const Account = () => {
  const monitoringData = {
    totalIncome: 3250000,
    totalRecharge: 5000000,
    totalInvest: 4500000,
    totalWithdraw: 2750000,
    totalRabat: 450000,
    teamIncome: 320000,
  };

  const transactions = [
    { id: 1, type: "recharge", amount: 1000000, date: "2025-12-01", status: "Success" },
    { id: 2, type: "invest", amount: -500000, date: "2025-11-30", status: "Success" },
    { id: 3, type: "withdraw", amount: 750000, date: "2025-11-29", status: "Pending" },
    { id: 4, type: "income", amount: 15000, date: "2025-11-28", status: "Success" },
    { id: 5, type: "commission", amount: 45000, date: "2025-11-27", status: "Success" },
    { id: 6, type: "recharge", amount: 2000000, date: "2025-11-25", status: "Success" },
    { id: 7, type: "invest", amount: -1000000, date: "2025-11-24", status: "Success" },
    { id: 8, type: "withdraw", amount: 500000, date: "2025-11-23", status: "Success" },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
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
          <Card className="shadow-card bg-gradient-success border-0 text-success-foreground">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4" />
                <p className="text-xs font-medium opacity-90">Total Income</p>
              </div>
              <p className="text-xl font-bold">{formatCurrency(monitoringData.totalIncome)}</p>
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

          <Card className="shadow-card bg-gradient-primary border-0 text-primary-foreground">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4" />
                <p className="text-xs font-medium opacity-90">Team Income</p>
              </div>
              <p className="text-xl font-bold">{formatCurrency(monitoringData.teamIncome)}</p>
            </CardContent>
          </Card>
        </div>
      </div>

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
              {transactions.map((transaction) => (
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
                      <p className="text-xs text-muted-foreground">{transaction.date}</p>
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
                      variant={transaction.status === "Success" ? "success" : "outline"}
                      className="text-xs"
                    >
                      {transaction.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="recharge" className="space-y-2">
              {transactions
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
                        <p className="text-xs text-muted-foreground">{transaction.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-success">
                        +{formatCurrency(transaction.amount)}
                      </p>
                      <Badge variant="success" className="text-xs">
                        {transaction.status}
                      </Badge>
                    </div>
                  </div>
                ))}
            </TabsContent>

            <TabsContent value="withdraw" className="space-y-2">
              {transactions
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
                        <p className="text-xs text-muted-foreground">{transaction.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-foreground">
                        {formatCurrency(transaction.amount)}
                      </p>
                      <Badge
                        variant={transaction.status === "Success" ? "success" : "outline"}
                        className="text-xs"
                      >
                        {transaction.status}
                      </Badge>
                    </div>
                  </div>
                ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Account;
