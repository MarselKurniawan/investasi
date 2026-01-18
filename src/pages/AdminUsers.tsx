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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import {
  getAllUsers,
  formatCurrency,
  User,
  saveAllUsers,
  getTransactions,
  getInvestments,
  getTeamMembers,
  getCommissionRate,
  TeamMember,
  Transaction,
  Investment,
} from "@/lib/store";
import {
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Eye,
  Edit,
  Plus,
  Minus,
  Trash2,
  UserCog,
  TrendingUp,
  Wallet,
  Crown,
  Share2,
  ChevronLeft,
  History,
  Package,
  DollarSign,
} from "lucide-react";
import { Link } from "react-router-dom";

const AdminUsers = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);

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
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [userTransactions, setUserTransactions] = useState<Transaction[]>([]);
  const [userInvestments, setUserInvestments] = useState<Investment[]>([]);
  const [userReferrals, setUserReferrals] = useState<TeamMember[]>([]);
  const [detailTab, setDetailTab] = useState("overview");

  const loadData = () => {
    const allUsers = getAllUsers();
    setUsers(allUsers);
    setFilteredUsers(allUsers);
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = users.filter(
        (u) =>
          u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.referralCode.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchTerm, users]);

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
    setUserReferrals(getTeamMembers(user.id));
    setDetailTab("overview");
    setDetailDialogOpen(true);
  };

  // Find referrer name
  const getReferrerName = (referralCode: string | null): string => {
    if (!referralCode) return "-";
    const referrer = users.find((u) => u.referralCode === referralCode);
    return referrer ? referrer.name : referralCode;
  };

  // Calculate total commission earned from a user's referrals
  const getTotalReferralCommission = (userId: string): number => {
    const transactions = getTransactions(userId);
    return transactions
      .filter((t) => t.type === "commission" && t.status === "success")
      .reduce((sum, t) => sum + t.amount, 0);
  };

  // Stats summary
  const stats = {
    totalUsers: users.length,
    totalBalance: users.reduce((sum, u) => sum + u.balance, 0),
    totalIncome: users.reduce((sum, u) => sum + u.totalIncome, 0),
    totalInvest: users.reduce((sum, u) => sum + u.totalInvest, 0),
    totalRecharge: users.reduce((sum, u) => sum + u.totalRecharge, 0),
    totalWithdraw: users.reduce((sum, u) => sum + u.totalWithdraw, 0),
    totalReferrals: users.reduce((sum, u) => getTeamMembers(u.id).length, 0),
  };

  return (
    <div className="space-y-6 p-4 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link to="/admin" className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-2">
            <ChevronLeft className="w-4 h-4" />
            <span className="text-sm">Kembali ke Admin</span>
          </Link>
          <div className="flex items-center gap-2">
            <UserCog className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-heading font-bold text-foreground">Manage Users</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">Kelola pengguna, saldo, dan referral</p>
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
              <TrendingUp className="w-4 h-4 text-primary" />
              <p className="text-xs text-muted-foreground">Total Income</p>
            </div>
            <p className="text-lg font-bold">{formatCurrency(stats.totalIncome)}</p>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Share2 className="w-4 h-4 text-accent" />
              <p className="text-xs text-muted-foreground">Total Referrals</p>
            </div>
            <p className="text-2xl font-bold">{stats.totalReferrals}</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Cari nama, email, atau kode referral..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Users List */}
      <div className="space-y-3">
        {filteredUsers.length === 0 ? (
          <Card className="shadow-card">
            <CardContent className="p-8 text-center">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-muted-foreground">Tidak ada user ditemukan</p>
            </CardContent>
          </Card>
        ) : (
          filteredUsers.map((user) => {
            const referralCount = getTeamMembers(user.id).length;
            const commissionEarned = getTotalReferralCommission(user.id);

            return (
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
                          <Crown className="w-3 h-3 mr-1" />
                          VIP {user.vipLevel}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-muted-foreground">
                          Ref: <span className="text-primary font-medium">{user.referralCode}</span>
                        </p>
                        {user.referredBy && (
                          <p className="text-xs text-muted-foreground">
                            | Dari: <span className="font-medium">{getReferrerName(user.referredBy)}</span>
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-foreground">
                        {formatCurrency(user.balance)}
                      </p>
                      <p className="text-xs text-muted-foreground">Saldo</p>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-4 gap-2 text-center bg-muted rounded-lg p-3 mb-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Investasi</p>
                      <p className="text-sm font-semibold">{formatCurrency(user.totalInvest)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Pendapatan</p>
                      <p className="text-sm font-semibold text-success">{formatCurrency(user.totalIncome)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Referral</p>
                      <p className="text-sm font-semibold text-primary">{referralCount} orang</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Komisi</p>
                      <p className="text-sm font-semibold text-accent">{formatCurrency(commissionEarned)}</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => openUserDetail(user)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Detail
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditUser(user)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
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
                    <select
                      className="px-3 py-1.5 text-sm rounded-md bg-muted border border-border"
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
                      variant={user.isAdmin ? "destructive" : "outline"}
                      size="sm"
                      onClick={() => handleToggleAdmin(user.id)}
                    >
                      {user.isAdmin ? "Hapus Admin" : "Jadikan Admin"}
                    </Button>
                    {!user.isAdmin && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Edit User Dialog */}
      <Dialog open={editUserOpen} onOpenChange={setEditUserOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Ubah informasi user</DialogDescription>
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
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Telepon</Label>
              <Input
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {balanceAction === "add" ? "Tambah Saldo" : "Kurangi Saldo"}
            </DialogTitle>
            <DialogDescription>
              {selectedUser?.name} - Saldo saat ini: {formatCurrency(selectedUser?.balance || 0)}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Jumlah</Label>
              <Input
                type="number"
                value={balanceAmount}
                onChange={(e) => setBalanceAmount(e.target.value)}
                placeholder="Masukkan jumlah"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBalanceDialogOpen(false)}>
              Batal
            </Button>
            <Button
              onClick={handleUpdateBalance}
              className={balanceAction === "subtract" ? "bg-destructive hover:bg-destructive/90" : ""}
            >
              {balanceAction === "add" ? "Tambah" : "Kurangi"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* User Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCog className="w-5 h-5" />
              Detail User: {selectedUser?.name}
            </DialogTitle>
            <DialogDescription>
              {selectedUser?.email} | VIP {selectedUser?.vipLevel} | Rate Komisi: {((getCommissionRate(selectedUser?.vipLevel || 1)) * 100).toFixed(0)}%
            </DialogDescription>
          </DialogHeader>

          <Tabs value={detailTab} onValueChange={setDetailTab} className="w-full">
            <TabsList className="w-full grid grid-cols-4">
              <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
              <TabsTrigger value="referrals" className="text-xs">Referral ({userReferrals.length})</TabsTrigger>
              <TabsTrigger value="transactions" className="text-xs">Transaksi</TabsTrigger>
              <TabsTrigger value="investments" className="text-xs">Investasi</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Wallet className="w-4 h-4 text-primary" />
                      <p className="text-xs text-muted-foreground">Saldo</p>
                    </div>
                    <p className="text-xl font-bold">{formatCurrency(selectedUser?.balance || 0)}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-success" />
                      <p className="text-xs text-muted-foreground">Total Pendapatan</p>
                    </div>
                    <p className="text-xl font-bold text-success">{formatCurrency(selectedUser?.totalIncome || 0)}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="w-4 h-4 text-primary" />
                      <p className="text-xs text-muted-foreground">Total Investasi</p>
                    </div>
                    <p className="text-xl font-bold">{formatCurrency(selectedUser?.totalInvest || 0)}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Share2 className="w-4 h-4 text-accent" />
                      <p className="text-xs text-muted-foreground">Komisi Referral</p>
                    </div>
                    <p className="text-xl font-bold text-accent">{formatCurrency(selectedUser?.teamIncome || 0)}</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Statistik Keuangan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Recharge</span>
                    <span className="font-medium text-success">{formatCurrency(selectedUser?.totalRecharge || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Withdraw</span>
                    <span className="font-medium text-destructive">{formatCurrency(selectedUser?.totalWithdraw || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Rabat</span>
                    <span className="font-medium">{formatCurrency(selectedUser?.totalRabat || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Kode Referral</span>
                    <span className="font-medium text-primary">{selectedUser?.referralCode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Direferensikan Oleh</span>
                    <span className="font-medium">{getReferrerName(selectedUser?.referredBy || null)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Bergabung</span>
                    <span className="font-medium">{selectedUser?.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString("id-ID") : "-"}</span>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Referrals Tab */}
            <TabsContent value="referrals" className="mt-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Share2 className="w-4 h-4" />
                    Daftar Referral ({userReferrals.length} orang)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {userReferrals.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Belum ada referral
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Nama</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>VIP</TableHead>
                            <TableHead>Komisi Dihasilkan</TableHead>
                            <TableHead>Bergabung</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {userReferrals.map((member) => (
                            <TableRow key={member.id}>
                              <TableCell className="font-medium">{member.name}</TableCell>
                              <TableCell className="text-muted-foreground text-sm">{member.email}</TableCell>
                              <TableCell>
                                <Badge variant="outline">VIP {member.vipLevel}</Badge>
                              </TableCell>
                              <TableCell className="text-accent font-medium">
                                {formatCurrency(member.totalEarnings)}
                              </TableCell>
                              <TableCell className="text-muted-foreground text-sm">
                                {new Date(member.joinedAt).toLocaleDateString("id-ID")}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Transactions Tab */}
            <TabsContent value="transactions" className="mt-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <History className="w-4 h-4" />
                    Riwayat Transaksi ({userTransactions.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {userTransactions.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Belum ada transaksi
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {userTransactions.slice(0, 20).map((tx) => (
                        <div
                          key={tx.id}
                          className="flex items-center justify-between p-3 bg-muted rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                tx.type === "recharge" || tx.type === "income" || tx.type === "commission"
                                  ? "bg-success/20"
                                  : "bg-destructive/20"
                              }`}
                            >
                              {tx.type === "recharge" || tx.type === "income" || tx.type === "commission" ? (
                                <ArrowUpRight className="w-4 h-4 text-success" />
                              ) : (
                                <ArrowDownRight className="w-4 h-4 text-destructive" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-sm capitalize">{tx.type}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(tx.date).toLocaleDateString("id-ID")}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p
                              className={`font-semibold ${
                                tx.type === "recharge" || tx.type === "income" || tx.type === "commission"
                                  ? "text-success"
                                  : "text-destructive"
                              }`}
                            >
                              {tx.type === "recharge" || tx.type === "income" || tx.type === "commission" ? "+" : "-"}
                              {formatCurrency(tx.amount)}
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
                </CardContent>
              </Card>
            </TabsContent>

            {/* Investments Tab */}
            <TabsContent value="investments" className="mt-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    Investasi Aktif ({userInvestments.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {userInvestments.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Belum ada investasi
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {userInvestments.map((inv) => (
                        <div
                          key={inv.id}
                          className="p-3 bg-muted rounded-lg"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <p className="font-medium text-sm">{inv.productName}</p>
                            <Badge variant={inv.status === "active" ? "default" : "outline"}>
                              {inv.status}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div>
                              <p className="text-muted-foreground">Modal</p>
                              <p className="font-medium">{formatCurrency(inv.amount)}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Income/Hari</p>
                              <p className="font-medium text-success">{formatCurrency(inv.dailyIncome)}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Total Earned</p>
                              <p className="font-medium text-primary">{formatCurrency(inv.totalEarned)}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsers;
