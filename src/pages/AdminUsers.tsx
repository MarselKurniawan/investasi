import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import {
  getAllProfiles,
  getTransactions,
  getInvestments,
  getTeamMembers,
  updateProfile,
  setUserAdmin,
  formatCurrency,
  getCommissionRate,
  Profile,
  Transaction,
  Investment,
} from "@/lib/database";
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
  Package,
} from "lucide-react";
import { Link } from "react-router-dom";

const AdminUsers = () => {
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<Profile[]>([]);

  // Edit user dialog
  const [editUserOpen, setEditUserOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");

  // Add balance dialog
  const [balanceDialogOpen, setBalanceDialogOpen] = useState(false);
  const [balanceAmount, setBalanceAmount] = useState("");
  const [balanceAction, setBalanceAction] = useState<"add" | "subtract">("add");

  // User detail dialog
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [userTransactions, setUserTransactions] = useState<Transaction[]>([]);
  const [userInvestments, setUserInvestments] = useState<Investment[]>([]);
  const [userReferrals, setUserReferrals] = useState<Profile[]>([]);
  const [detailTab, setDetailTab] = useState("overview");
  const [userIsAdmin, setUserIsAdmin] = useState(false);

  const loadData = async () => {
    const data = await getAllProfiles();
    setProfiles(data);
    setFilteredUsers(data);
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = profiles.filter(
        (u) =>
          u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (u.referral_code?.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(profiles);
    }
  }, [searchTerm, profiles]);

  const handleUpdateVip = async (userId: string, newLevel: number) => {
    await updateProfile(userId, { vip_level: newLevel });
    toast({ title: "VIP Level Updated", description: `User sekarang VIP ${newLevel}` });
    loadData();
  };

  const handleToggleAdmin = async (userId: string, currentIsAdmin: boolean) => {
    await setUserAdmin(userId, !currentIsAdmin);
    toast({
      title: !currentIsAdmin ? "Admin Ditambahkan" : "Admin Dihapus",
      description: `Status admin berhasil diubah`,
    });
    loadData();
  };

  const openEditUser = (user: Profile) => {
    setSelectedUser(user);
    setEditName(user.name);
    setEditPhone(user.phone || "");
    setEditUserOpen(true);
  };

  const handleSaveUser = async () => {
    if (!selectedUser) return;
    await updateProfile(selectedUser.user_id, { name: editName, phone: editPhone });
    toast({ title: "User Updated", description: "Data user berhasil diperbarui" });
    setEditUserOpen(false);
    loadData();
  };

  const openBalanceDialog = (user: Profile, action: "add" | "subtract") => {
    setSelectedUser(user);
    setBalanceAction(action);
    setBalanceAmount("");
    setBalanceDialogOpen(true);
  };

  const handleUpdateBalance = async () => {
    if (!selectedUser || !balanceAmount) return;
    const amount = parseInt(balanceAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({ title: "Error", description: "Masukkan jumlah yang valid", variant: "destructive" });
      return;
    }

    const newBalance = balanceAction === "add"
      ? selectedUser.balance + amount
      : Math.max(0, selectedUser.balance - amount);
    
    await updateProfile(selectedUser.user_id, { balance: newBalance });
    toast({
      title: "Balance Updated",
      description: `${balanceAction === "add" ? "Ditambahkan" : "Dikurangi"} ${formatCurrency(amount)}`,
    });
    setBalanceDialogOpen(false);
    loadData();
  };

  const openUserDetail = async (user: Profile) => {
    setSelectedUser(user);
    const [txData, invData, teamData] = await Promise.all([
      getTransactions(user.user_id),
      getInvestments(user.user_id),
      user.referral_code ? getTeamMembers(user.referral_code) : Promise.resolve([]),
    ]);
    setUserTransactions(txData);
    setUserInvestments(invData);
    setUserReferrals(teamData);
    setDetailTab("overview");
    setDetailDialogOpen(true);
  };

  const getReferrerName = (referralCode: string | null): string => {
    if (!referralCode) return "-";
    const referrer = profiles.find((u) => u.referral_code === referralCode);
    return referrer ? referrer.name : referralCode;
  };

  const getTotalReferralCommission = (transactions: Transaction[]): number => {
    return transactions
      .filter((t) => t.type === "commission" && t.status === "success")
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const stats = {
    totalUsers: profiles.length,
    totalBalance: profiles.reduce((sum, u) => sum + u.balance, 0),
    totalIncome: profiles.reduce((sum, u) => sum + u.total_income, 0),
    totalReferrals: profiles.filter(p => p.referred_by).length,
  };

  return (
    <div className="space-y-6 p-4 pt-6 pb-24">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <Link to="/admin" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
          <ChevronLeft className="w-4 h-4" /><span className="text-sm">Kembali ke Admin</span>
        </Link>
        <div className="flex items-center gap-2">
          <UserCog className="w-6 h-6 text-primary" />
          <h1 className="text-xl sm:text-2xl font-heading font-bold text-foreground">Manage Users</h1>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2"><Users className="w-4 h-4 text-primary" /><p className="text-xs text-muted-foreground">Total Users</p></div>
            <p className="text-2xl font-bold">{stats.totalUsers}</p>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2"><Wallet className="w-4 h-4 text-success" /><p className="text-xs text-muted-foreground">Total Balance</p></div>
            <p className="text-lg font-bold">{formatCurrency(stats.totalBalance)}</p>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2"><TrendingUp className="w-4 h-4 text-primary" /><p className="text-xs text-muted-foreground">Total Income</p></div>
            <p className="text-lg font-bold">{formatCurrency(stats.totalIncome)}</p>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2"><Share2 className="w-4 h-4 text-accent" /><p className="text-xs text-muted-foreground">Total Referrals</p></div>
            <p className="text-2xl font-bold">{stats.totalReferrals}</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Cari nama, email, atau kode referral..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
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
          filteredUsers.map((user) => (
            <Card key={user.id} className="shadow-card">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-foreground">{user.name}</p>
                      <Badge variant="outline" className="text-xs"><Crown className="w-3 h-3 mr-1" />VIP {user.vip_level}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                    <p className="text-xs text-muted-foreground mt-1">Ref: <span className="text-primary font-medium">{user.referral_code}</span></p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-foreground">{formatCurrency(user.balance)}</p>
                    <p className="text-xs text-muted-foreground">Saldo</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-1 sm:gap-2 text-center bg-muted rounded-lg p-2 sm:p-3 mb-3">
                  <div>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">Recharge</p>
                    <p className="text-xs sm:text-sm font-semibold truncate">{formatCurrency(user.total_recharge)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">Pendapatan</p>
                    <p className="text-xs sm:text-sm font-semibold text-success truncate">{formatCurrency(user.total_income)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">Withdraw</p>
                    <p className="text-xs sm:text-sm font-semibold text-accent truncate">{formatCurrency(user.total_withdraw)}</p>
                  </div>
                </div>

                <div className="flex gap-1.5 sm:gap-2 flex-wrap">
                  <Button variant="default" size="sm" className="text-xs px-2 sm:px-3" onClick={() => openUserDetail(user)}>
                    <Eye className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
                    <span className="hidden sm:inline">Detail</span>
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs px-2 sm:px-3" onClick={() => openEditUser(user)}>
                    <Edit className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
                    <span className="hidden sm:inline">Edit</span>
                  </Button>
                  <Button variant="outline" size="sm" className="px-2" onClick={() => openBalanceDialog(user, "add")}>
                    <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="px-2" onClick={() => openBalanceDialog(user, "subtract")}>
                    <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                  <select 
                    className="px-2 sm:px-3 py-1.5 text-xs sm:text-sm rounded-md bg-muted border border-border" 
                    value={user.vip_level} 
                    onChange={(e) => handleUpdateVip(user.user_id, parseInt(e.target.value))}
                  >
                    {[1, 2, 3, 4, 5].map((level) => <option key={level} value={level}>VIP {level}</option>)}
                  </select>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit User Dialog */}
      <Dialog open={editUserOpen} onOpenChange={setEditUserOpen}>
        <DialogContent className="w-[95vw] max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Ubah informasi user</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nama</Label>
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Telepon</Label>
              <Input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} />
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setEditUserOpen(false)} className="w-full sm:w-auto">Batal</Button>
            <Button onClick={handleSaveUser} className="w-full sm:w-auto">Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Balance Dialog */}
      <Dialog open={balanceDialogOpen} onOpenChange={setBalanceDialogOpen}>
        <DialogContent className="w-[95vw] max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle>{balanceAction === "add" ? "Tambah" : "Kurangi"} Saldo</DialogTitle>
            <DialogDescription>Untuk: {selectedUser?.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Jumlah</Label>
              <Input type="number" value={balanceAmount} onChange={(e) => setBalanceAmount(e.target.value)} placeholder="Masukkan jumlah" />
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setBalanceDialogOpen(false)} className="w-full sm:w-auto">Batal</Button>
            <Button onClick={handleUpdateBalance} className={`w-full sm:w-auto ${balanceAction === "subtract" ? "bg-destructive hover:bg-destructive/90" : ""}`}>
              {balanceAction === "add" ? "Tambah" : "Kurangi"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* User Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="w-[95vw] max-w-lg mx-auto max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg truncate">Detail: {selectedUser?.name}</DialogTitle>
          </DialogHeader>
          <Tabs value={detailTab} onValueChange={setDetailTab} className="flex-1 overflow-hidden">
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="overview" className="text-[10px] sm:text-sm px-1">Overview</TabsTrigger>
              <TabsTrigger value="referrals" className="text-[10px] sm:text-sm px-1">Referral</TabsTrigger>
              <TabsTrigger value="transactions" className="text-[10px] sm:text-sm px-1">Transaksi</TabsTrigger>
              <TabsTrigger value="investments" className="text-[10px] sm:text-sm px-1">Investasi</TabsTrigger>
            </TabsList>
            <div className="overflow-y-auto max-h-[45vh] sm:max-h-[50vh] mt-4">
              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-muted p-3 rounded-lg"><p className="text-xs text-muted-foreground">Balance</p><p className="font-bold">{formatCurrency(selectedUser?.balance || 0)}</p></div>
                  <div className="bg-muted p-3 rounded-lg"><p className="text-xs text-muted-foreground">VIP Level</p><p className="font-bold">VIP {selectedUser?.vip_level}</p></div>
                  <div className="bg-muted p-3 rounded-lg"><p className="text-xs text-muted-foreground">Total Income</p><p className="font-bold text-success">{formatCurrency(selectedUser?.total_income || 0)}</p></div>
                  <div className="bg-muted p-3 rounded-lg"><p className="text-xs text-muted-foreground">Team Income</p><p className="font-bold text-primary">{formatCurrency(selectedUser?.team_income || 0)}</p></div>
                </div>
                <div className="bg-muted p-3 rounded-lg"><p className="text-xs text-muted-foreground">Referral Code</p><p className="font-bold text-primary">{selectedUser?.referral_code}</p></div>
                <div className="bg-muted p-3 rounded-lg"><p className="text-xs text-muted-foreground">Referred By</p><p className="font-bold">{getReferrerName(selectedUser?.referred_by || null)}</p></div>
              </TabsContent>
              <TabsContent value="referrals" className="space-y-3">
                {userReferrals.length === 0 ? <p className="text-center text-muted-foreground py-4">Tidak ada referral</p> : userReferrals.map((ref) => (
                  <div key={ref.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div><p className="font-medium">{ref.name}</p><p className="text-xs text-muted-foreground">VIP {ref.vip_level}</p></div>
                    <p className="text-sm font-semibold">{formatCurrency(ref.total_income)}</p>
                  </div>
                ))}
              </TabsContent>
              <TabsContent value="transactions" className="space-y-2">
                {userTransactions.length === 0 ? <p className="text-center text-muted-foreground py-4">Tidak ada transaksi</p> : userTransactions.slice(0, 20).map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      {tx.type === 'recharge' || tx.type === 'income' ? <ArrowUpRight className="w-4 h-4 text-success" /> : <ArrowDownRight className="w-4 h-4 text-accent" />}
                      <div><p className="text-sm font-medium capitalize">{tx.type}</p><p className="text-xs text-muted-foreground">{new Date(tx.created_at).toLocaleDateString('id-ID')}</p></div>
                    </div>
                    <div className="text-right"><p className={`font-semibold ${tx.type === 'withdraw' || tx.type === 'invest' ? '' : 'text-success'}`}>{tx.type === 'withdraw' || tx.type === 'invest' ? '-' : '+'}{formatCurrency(tx.amount)}</p><Badge variant="outline" className="text-xs">{tx.status}</Badge></div>
                  </div>
                ))}
              </TabsContent>
              <TabsContent value="investments" className="space-y-2">
                {userInvestments.length === 0 ? <p className="text-center text-muted-foreground py-4">Tidak ada investasi</p> : userInvestments.map((inv) => (
                  <div key={inv.id} className="p-3 bg-muted rounded-lg">
                    <div className="flex items-center justify-between mb-2"><p className="font-medium">{inv.product_name}</p><Badge variant={inv.status === 'active' ? 'success' : 'outline'}>{inv.status}</Badge></div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div><p className="text-muted-foreground">Investasi</p><p className="font-semibold">{formatCurrency(inv.amount)}</p></div>
                      <div><p className="text-muted-foreground">Harian</p><p className="font-semibold text-success">{formatCurrency(inv.daily_income)}</p></div>
                      <div><p className="text-muted-foreground">Sisa</p><p className="font-semibold">{inv.days_remaining} hari</p></div>
                    </div>
                  </div>
                ))}
              </TabsContent>
            </div>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsers;
