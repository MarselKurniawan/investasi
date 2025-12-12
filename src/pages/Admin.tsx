import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  getAllUsers,
  getAllPendingTransactions,
  updateTransactionStatus,
  formatCurrency,
  User,
  saveAllUsers,
} from "@/lib/store";
import {
  Users,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle,
  XCircle,
  ShieldCheck,
  TrendingUp,
  Wallet,
  Crown,
} from "lucide-react";

const Admin = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [pendingTransactions, setPendingTransactions] = useState<
    (ReturnType<typeof getAllPendingTransactions>[0])[]
  >([]);
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const loadData = () => {
    setUsers(getAllUsers());
    setPendingTransactions(getAllPendingTransactions());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApprove = async (userId: string, txId: string) => {
    setIsLoading(txId);
    await new Promise((resolve) => setTimeout(resolve, 500));
    updateTransactionStatus(userId, txId, "success");
    loadData();
    toast({
      title: "Transaksi Disetujui",
      description: "Status transaksi berhasil diupdate",
    });
    setIsLoading(null);
  };

  const handleReject = async (userId: string, txId: string) => {
    setIsLoading(txId);
    await new Promise((resolve) => setTimeout(resolve, 500));
    updateTransactionStatus(userId, txId, "rejected");
    loadData();
    toast({
      title: "Transaksi Ditolak",
      description: "Status transaksi berhasil diupdate",
      variant: "destructive",
    });
    setIsLoading(null);
  };

  const handleUpdateVip = (userId: string, newLevel: number) => {
    const allUsers = getAllUsers();
    const idx = allUsers.findIndex((u) => u.id === userId);
    if (idx !== -1) {
      allUsers[idx].vipLevel = newLevel;
      saveAllUsers(allUsers);
      loadData();
      toast({
        title: "VIP Level Updated",
        description: `User sekarang VIP ${newLevel}`,
      });
    }
  };

  const handleAddBalance = (userId: string, amount: number) => {
    const allUsers = getAllUsers();
    const idx = allUsers.findIndex((u) => u.id === userId);
    if (idx !== -1) {
      allUsers[idx].balance += amount;
      saveAllUsers(allUsers);
      loadData();
      toast({
        title: "Balance Updated",
        description: `Ditambahkan ${formatCurrency(amount)}`,
      });
    }
  };

  const stats = {
    totalUsers: users.length,
    totalBalance: users.reduce((sum, u) => sum + u.balance, 0),
    pendingCount: pendingTransactions.length,
    totalInvest: users.reduce((sum, u) => sum + u.totalInvest, 0),
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
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-accent" />
              <p className="text-xs text-muted-foreground">Total Invest</p>
            </div>
            <p className="text-lg font-bold">{formatCurrency(stats.totalInvest)}</p>
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
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="pending" className="text-sm">
            Transaksi Pending ({pendingTransactions.length})
          </TabsTrigger>
          <TabsTrigger value="users" className="text-sm">
            Daftar User ({users.length})
          </TabsTrigger>
        </TabsList>

        {/* Pending Transactions */}
        <TabsContent value="pending" className="mt-4 space-y-3">
          {pendingTransactions.length === 0 ? (
            <Card className="shadow-card">
              <CardContent className="p-8 text-center">
                <CheckCircle className="w-12 h-12 text-success mx-auto mb-3 opacity-50" />
                <p className="text-muted-foreground">Tidak ada transaksi pending</p>
              </CardContent>
            </Card>
          ) : (
            pendingTransactions.map((tx) => (
              <Card key={tx.id} className="shadow-card">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          tx.type === "recharge" ? "bg-success/20" : "bg-accent/20"
                        }`}
                      >
                        {tx.type === "recharge" ? (
                          <ArrowUpRight className="w-5 h-5 text-success" />
                        ) : (
                          <ArrowDownRight className="w-5 h-5 text-accent" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{tx.userName}</p>
                        <p className="text-xs text-muted-foreground">{tx.userEmail}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-accent">
                      Pending
                    </Badge>
                  </div>

                  <div className="bg-muted rounded-lg p-3 mb-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground capitalize">{tx.type}</span>
                      <span
                        className={`text-lg font-bold ${
                          tx.type === "recharge" ? "text-success" : "text-accent"
                        }`}
                      >
                        {tx.type === "recharge" ? "+" : "-"}
                        {formatCurrency(tx.amount)}
                      </span>
                    </div>
                    {tx.description && (
                      <p className="text-xs text-muted-foreground mt-1">{tx.description}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(tx.date).toLocaleString("id-ID")}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="success"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleApprove(tx.userId, tx.id)}
                      disabled={isLoading === tx.id}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleReject(tx.userId, tx.id)}
                      disabled={isLoading === tx.id}
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Users List */}
        <TabsContent value="users" className="mt-4 space-y-3">
          {users.map((user) => (
            <Card key={user.id} className="shadow-card">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-foreground">{user.name}</p>
                      {user.isAdmin && (
                        <Badge variant="vip" className="text-xs">
                          Admin
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Ref: {user.referralCode}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant="vip">VIP {user.vipLevel}</Badge>
                    <p className="text-lg font-bold text-foreground mt-1">
                      {formatCurrency(user.balance)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center bg-muted rounded-lg p-3 mb-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Recharge</p>
                    <p className="text-sm font-semibold">{formatCurrency(user.totalRecharge)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Invest</p>
                    <p className="text-sm font-semibold">{formatCurrency(user.totalInvest)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Withdraw</p>
                    <p className="text-sm font-semibold">{formatCurrency(user.totalWithdraw)}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <select
                    className="flex-1 px-3 py-2 text-sm rounded-md bg-muted border border-border"
                    value={user.vipLevel}
                    onChange={(e) => handleUpdateVip(user.id, parseInt(e.target.value))}
                  >
                    {[1, 2, 3, 4, 5].map((level) => (
                      <option key={level} value={level}>
                        VIP {level}
                      </option>
                    ))}
                  </select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddBalance(user.id, 500000)}
                  >
                    +500rb
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddBalance(user.id, 1000000)}
                  >
                    +1jt
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Admin;
