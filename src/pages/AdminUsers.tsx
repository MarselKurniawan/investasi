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
  deleteUser,
  formatCurrency,
  getCommissionRate,
  Profile,
  Transaction,
  Investment,
} from "@/lib/database";
import { supabase } from "@/integrations/supabase/client";
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
  ShieldCheck,
  ShieldOff,
} from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
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
  const [editEmail, setEditEmail] = useState("");

  // Delete user dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<Profile | null>(null);

  // Admin roles cache
  const [adminUserIds, setAdminUserIds] = useState<Set<string>>(new Set());

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

    // Load admin roles
    const { data: rolesData } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'admin');
    const adminIds = new Set((rolesData || []).map(r => r.user_id));
    setAdminUserIds(adminIds);
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
    setEditEmail(user.email || "");
    setEditUserOpen(true);
  };

  const handleSaveUser = async () => {
    if (!selectedUser) return;
    await updateProfile(selectedUser.user_id, { name: editName, email: editEmail });
    toast({ title: "User Updated", description: "Data user berhasil diperbarui" });
    setEditUserOpen(false);
    loadData();
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    const success = await deleteUser(userToDelete.user_id);
    if (success) {
      toast({ title: "User Dihapus", description: `${userToDelete.name} berhasil dihapus` });
    } else {
      toast({ title: "Error", description: "Gagal menghapus user", variant: "destructive" });
    }
    setDeleteDialogOpen(false);
    setUserToDelete(null);
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
        <Card className="min-w-0 overflow-hidden">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-1.5 mb-1"><Users className="w-4 h-4 shrink-0 text-primary" /><p className="text-[10px] sm:text-xs text-muted-foreground">Total Users</p></div>
            <p className="text-lg sm:text-2xl font-bold">{stats.totalUsers}</p>
          </CardContent>
        </Card>
        <Card className="min-w-0 overflow-hidden">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-1.5 mb-1"><Wallet className="w-4 h-4 shrink-0 text-success" /><p className="text-[10px] sm:text-xs text-muted-foreground">Total Balance</p></div>
            <p className="text-[10px] sm:text-lg font-bold break-all">{formatCurrency(stats.totalBalance)}</p>
          </CardContent>
        </Card>
        <Card className="min-w-0 overflow-hidden">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-1.5 mb-1"><TrendingUp className="w-4 h-4 shrink-0 text-primary" /><p className="text-[10px] sm:text-xs text-muted-foreground">Total Income</p></div>
            <p className="text-[10px] sm:text-lg font-bold break-all">{formatCurrency(stats.totalIncome)}</p>
          </CardContent>
        </Card>
        <Card className="min-w-0 overflow-hidden">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-1.5 mb-1"><Share2 className="w-4 h-4 shrink-0 text-accent" /><p className="text-[10px] sm:text-xs text-muted-foreground">Total Referrals</p></div>
            <p className="text-lg sm:text-2xl font-bold">{stats.totalReferrals}</p>
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
            <Card key={user.id} className="min-w-0 overflow-hidden">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-foreground">{user.name}</p>
                      <Badge variant="outline" className="text-xs"><Crown className="w-3 h-3 mr-1" />VIP {user.vip_level}</Badge>
                      {adminUserIds.has(user.user_id) && <Badge className="text-xs bg-primary">Admin</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                    <p className="text-xs text-muted-foreground mt-1">Ref: <span className="text-primary font-medium">{user.referral_code}</span></p>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <p className="text-sm sm:text-lg font-bold text-foreground break-all">{formatCurrency(user.balance)}</p>
                    <p className="text-xs text-muted-foreground">Saldo</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-1 sm:gap-2 text-center bg-muted rounded-lg p-2 sm:p-3 mb-3">
                  <div className="min-w-0">
                    <p className="text-[10px] sm:text-xs text-muted-foreground">Recharge</p>
                    <p className="text-[10px] sm:text-sm font-semibold break-all">{formatCurrency(user.total_recharge)}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] sm:text-xs text-muted-foreground">Pendapatan</p>
                    <p className="text-[10px] sm:text-sm font-semibold text-success break-all">{formatCurrency(user.total_income)}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] sm:text-xs text-muted-foreground">Withdraw</p>
                    <p className="text-[10px] sm:text-sm font-semibold text-accent break-all">{formatCurrency(user.total_withdraw)}</p>
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
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className={`px-2 ${adminUserIds.has(user.user_id) ? 'text-primary border-primary' : ''}`}
                    onClick={() => handleToggleAdmin(user.user_id, adminUserIds.has(user.user_id))}
                  >
                    {adminUserIds.has(user.user_id) ? <ShieldOff className="w-3 h-3 sm:w-4 sm:h-4" /> : <ShieldCheck className="w-3 h-3 sm:w-4 sm:h-4" />}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="px-2 text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => { setUserToDelete(user); setDeleteDialogOpen(true); }}
                  >
                    <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
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
              <Label>Email</Label>
              <Input value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
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

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="w-[95vw] max-w-md mx-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus User?</AlertDialogTitle>
            <AlertDialogDescription>
              Anda yakin ingin menghapus <strong>{userToDelete?.name}</strong>? Semua data user termasuk investasi, transaksi, dan profil akan dihapus permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser} className="bg-destructive hover:bg-destructive/90">Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminUsers;
