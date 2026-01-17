import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  getAllUsers,
  getAllPendingTransactions,
  updateTransactionStatus,
  formatCurrency,
  User,
  saveAllUsers,
  getTransactions,
  getInvestments,
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
  Trash2,
  Edit,
  Plus,
  Minus,
  UserCog,
  History,
  Package,
} from "lucide-react";

const Admin = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [pendingTransactions, setPendingTransactions] = useState<
    (ReturnType<typeof getAllPendingTransactions>[0])[]
  >([]);
  const [isLoading, setIsLoading] = useState<string | null>(null);

  // Edit user dialog
  const [editUserOpen, setEditUserOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");

  // Add balance dialog
  const [balanceDialogOpen, setBalanceDialogOpen] = useState(false);
  const [balanceAmount, setBalanceAmount] = useState("");
  const [balanceAction, setBalanceAction] = useState<"add" | "subtract">("add");

  // User detail dialog
  const [detailUserOpen, setDetailUserOpen] = useState(false);
  const [userTransactions, setUserTransactions] = useState<any[]>([]);
  const [userInvestments, setUserInvestments] = useState<any[]>([]);

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

  const handleToggleAdmin = (userId: string) => {
    const allUsers = getAllUsers();
    const idx = allUsers.findIndex((u) => u.id === userId);
    if (idx !== -1) {
      allUsers[idx].isAdmin = !allUsers[idx].isAdmin;
      saveAllUsers(allUsers);
      loadData();
      toast({
        title: allUsers[idx].isAdmin ? "Admin Ditambahkan" : "Admin Dihapus",
        description: `${allUsers[idx].name} ${allUsers[idx].isAdmin ? "sekarang admin" : "bukan admin lagi"}`,
      });
    }
  };

  const handleDeleteUser = (userId: string) => {
    const allUsers = getAllUsers();
    const user = allUsers.find((u) => u.id === userId);
    if (user?.isAdmin) {
      toast({
        title: "Tidak Bisa Hapus",
        description: "Tidak bisa menghapus akun admin",
        variant: "destructive",
      });
      return;
    }
    const filtered = allUsers.filter((u) => u.id !== userId);
    saveAllUsers(filtered);
    loadData();
    toast({
      title: "User Dihapus",
      description: "User berhasil dihapus dari sistem",
    });
  };

  const openEditUser = (user: User) => {
    setSelectedUser(user);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditPhone(user.phone || "");
    setEditUserOpen(true);
  };

  const handleSaveUser = () => {
    if (!selectedUser) return;
    const allUsers = getAllUsers();
    const idx = allUsers.findIndex((u) => u.id === selectedUser.id);
    if (idx !== -1) {
      allUsers[idx].name = editName;
      allUsers[idx].email = editEmail;
      allUsers[idx].phone = editPhone;
      saveAllUsers(allUsers);
      loadData();
      toast({
        title: "User Updated",
        description: "Data user berhasil diperbarui",
      });
    }
    setEditUserOpen(false);
  };

  const openBalanceDialog = (user: User, action: "add" | "subtract") => {
    setSelectedUser(user);
    setBalanceAction(action);
    setBalanceAmount("");
    setBalanceDialogOpen(true);
  };

  const handleUpdateBalance = () => {
    if (!selectedUser || !balanceAmount) return;
    const amount = parseInt(balanceAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Error",
        description: "Masukkan jumlah yang valid",
        variant: "destructive",
      });
      return;
    }

    const allUsers = getAllUsers();
    const idx = allUsers.findIndex((u) => u.id === selectedUser.id);
    if (idx !== -1) {
      if (balanceAction === "add") {
        allUsers[idx].balance += amount;
      } else {
        allUsers[idx].balance = Math.max(0, allUsers[idx].balance - amount);
      }
      saveAllUsers(allUsers);
      loadData();
      toast({
        title: "Balance Updated",
        description: `${balanceAction === "add" ? "Ditambahkan" : "Dikurangi"} ${formatCurrency(amount)}`,
      });
    }
    setBalanceDialogOpen(false);
  };

  const openUserDetail = (user: User) => {
    setSelectedUser(user);
    setUserTransactions(getTransactions(user.id));
    setUserInvestments(getInvestments(user.id));
    setDetailUserOpen(true);
  };

  const stats = {
    totalUsers: users.length,
    totalBalance: users.reduce((sum, u) => sum + u.balance, 0),
    pendingCount: pendingTransactions.length,
    totalInvest: users.reduce((sum, u) => sum + u.totalInvest, 0),
    totalRecharge: users.reduce((sum, u) => sum + u.totalRecharge, 0),
    totalWithdraw: users.reduce((sum, u) => sum + u.totalWithdraw, 0),
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
              <p className="text-xs text-muted-foreground">Total Invest</p>
            </div>
            <p className="text-sm font-bold">{formatCurrency(stats.totalInvest)}</p>
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

      {/* Tabs */}
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="pending" className="text-sm">
            Pending ({pendingTransactions.length})
          </TabsTrigger>
          <TabsTrigger value="users" className="text-sm">
            Users ({users.length})
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
                      variant="default"
                      size="sm"
                      className="flex-1 bg-success hover:bg-success/90"
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
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-foreground">{user.name}</p>
                      {user.isAdmin && (
                        <Badge variant="default" className="text-xs bg-primary">
                          Admin
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-xs">
                        VIP {user.vipLevel}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Ref: {user.referralCode}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-foreground">
                      {formatCurrency(user.balance)}
                    </p>
                    <p className="text-xs text-muted-foreground">Saldo</p>
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

                {/* Action Buttons Row 1: VIP & Balance */}
                <div className="flex gap-2 mb-2">
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
                    onClick={() => openBalanceDialog(user, "add")}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openBalanceDialog(user, "subtract")}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                </div>

                {/* Action Buttons Row 2: Edit, Detail, Admin, Delete */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => openEditUser(user)}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => openUserDetail(user)}
                  >
                    <History className="w-4 h-4 mr-1" />
                    Detail
                  </Button>
                  <Button
                    variant={user.isAdmin ? "secondary" : "default"}
                    size="sm"
                    onClick={() => handleToggleAdmin(user.id)}
                  >
                    <UserCog className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteUser(user.id)}
                    disabled={user.isAdmin}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {/* Edit User Dialog */}
      <Dialog open={editUserOpen} onOpenChange={setEditUserOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Ubah data user</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nama</Label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Telepon</Label>
              <Input
                type="tel"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditUserOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleSaveUser}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Balance Dialog */}
      <Dialog open={balanceDialogOpen} onOpenChange={setBalanceDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {balanceAction === "add" ? "Tambah" : "Kurangi"} Saldo
            </DialogTitle>
            <DialogDescription>
              {selectedUser?.name} - Saldo: {formatCurrency(selectedUser?.balance || 0)}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Jumlah</Label>
              <Input
                type="number"
                placeholder="Masukkan jumlah"
                value={balanceAmount}
                onChange={(e) => setBalanceAmount(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[100000, 500000, 1000000].map((amt) => (
                <Button
                  key={amt}
                  variant="outline"
                  size="sm"
                  onClick={() => setBalanceAmount(amt.toString())}
                >
                  {formatCurrency(amt)}
                </Button>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBalanceDialogOpen(false)}>
              Batal
            </Button>
            <Button
              onClick={handleUpdateBalance}
              variant={balanceAction === "add" ? "default" : "destructive"}
            >
              {balanceAction === "add" ? "Tambah" : "Kurangi"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* User Detail Dialog */}
      <Dialog open={detailUserOpen} onOpenChange={setDetailUserOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detail User: {selectedUser?.name}</DialogTitle>
            <DialogDescription>{selectedUser?.email}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* User Info */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-muted p-3 rounded-lg">
                <p className="text-muted-foreground text-xs">VIP Level</p>
                <p className="font-bold">VIP {selectedUser?.vipLevel}</p>
              </div>
              <div className="bg-muted p-3 rounded-lg">
                <p className="text-muted-foreground text-xs">Saldo</p>
                <p className="font-bold">{formatCurrency(selectedUser?.balance || 0)}</p>
              </div>
              <div className="bg-muted p-3 rounded-lg">
                <p className="text-muted-foreground text-xs">Referral Code</p>
                <p className="font-bold">{selectedUser?.referralCode}</p>
              </div>
              <div className="bg-muted p-3 rounded-lg">
                <p className="text-muted-foreground text-xs">Referred By</p>
                <p className="font-bold">{selectedUser?.referredBy || "-"}</p>
              </div>
            </div>

            {/* Investments */}
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Package className="w-4 h-4" />
                Investasi ({userInvestments.length})
              </h4>
              {userInvestments.length === 0 ? (
                <p className="text-sm text-muted-foreground">Belum ada investasi</p>
              ) : (
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {userInvestments.map((inv: any) => (
                    <div key={inv.id} className="bg-muted p-2 rounded text-sm">
                      <div className="flex justify-between">
                        <span>{inv.productName}</span>
                        <Badge variant={inv.status === "active" ? "default" : "secondary"}>
                          {inv.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(inv.amount)} • {inv.daysRemaining} hari tersisa
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Transactions */}
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <History className="w-4 h-4" />
                Transaksi ({userTransactions.length})
              </h4>
              {userTransactions.length === 0 ? (
                <p className="text-sm text-muted-foreground">Belum ada transaksi</p>
              ) : (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {userTransactions.slice(0, 10).map((tx: any) => (
                    <div key={tx.id} className="bg-muted p-2 rounded text-sm flex justify-between items-center">
                      <div>
                        <span className="capitalize">{tx.type}</span>
                        <p className="text-xs text-muted-foreground">
                          {new Date(tx.date).toLocaleDateString("id-ID")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${tx.amount > 0 ? "text-success" : ""}`}>
                          {tx.amount > 0 ? "+" : ""}{formatCurrency(Math.abs(tx.amount))}
                        </p>
                        <Badge
                          variant={
                            tx.status === "success"
                              ? "default"
                              : tx.status === "pending"
                              ? "outline"
                              : "destructive"
                          }
                          className="text-xs"
                        >
                          {tx.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;
