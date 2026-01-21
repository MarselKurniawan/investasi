import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  formatCurrency,
  Product,
} from "@/lib/database";
import { Package, Plus, Edit, Trash2, ArrowLeft, TrendingUp, DollarSign } from "lucide-react";
import { Link } from "react-router-dom";

const AdminProducts = () => {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    daily_income: "",
    validity: "",
    vip_level: "1",
    image: "",
    description: "",
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    const data = await getAllProducts();
    setProducts(data);
  };

  const calculateTotalIncome = (dailyIncome: number, validity: number) => dailyIncome * validity;

  const resetForm = () => {
    setFormData({ name: "", price: "", daily_income: "", validity: "", vip_level: "1", image: "", description: "" });
  };

  const openCreateDialog = () => {
    setIsCreating(true);
    resetForm();
    setSelectedProduct(null);
    setEditDialogOpen(true);
  };

  const openEditDialog = (product: Product) => {
    setIsCreating(false);
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      daily_income: product.daily_income.toString(),
      validity: product.validity.toString(),
      vip_level: product.vip_level.toString(),
      image: product.image || "",
      description: product.description || "",
    });
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (product: Product) => {
    setSelectedProduct(product);
    setDeleteDialogOpen(true);
  };

  const handleSave = async () => {
    const price = parseInt(formData.price);
    const daily_income = parseInt(formData.daily_income);
    const validity = parseInt(formData.validity);

    if (!formData.name || isNaN(price) || isNaN(daily_income) || isNaN(validity)) {
      toast({ title: "Error", description: "Mohon isi semua field dengan benar", variant: "destructive" });
      return;
    }

    const productData = {
      name: formData.name,
      price,
      daily_income,
      validity,
      total_income: calculateTotalIncome(daily_income, validity),
      vip_level: parseInt(formData.vip_level),
      image: formData.image || "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=400&h=300&fit=crop",
      description: formData.description || "Investasi dengan return menarik",
      is_active: true,
    };

    if (isCreating) {
      const result = await createProduct(productData);
      if (result) {
        toast({ title: "Produk Ditambahkan", description: `${productData.name} berhasil ditambahkan` });
      }
    } else if (selectedProduct) {
      await updateProduct(selectedProduct.id, productData);
      toast({ title: "Produk Diperbarui", description: `${productData.name} berhasil diperbarui` });
    }

    setEditDialogOpen(false);
    resetForm();
    loadProducts();
  };

  const handleDelete = async () => {
    if (!selectedProduct) return;
    await deleteProduct(selectedProduct.id);
    toast({ title: "Produk Dihapus", description: `${selectedProduct.name} berhasil dihapus` });
    setDeleteDialogOpen(false);
    loadProducts();
  };

  const calculatedTotalIncome = parseInt(formData.daily_income) * parseInt(formData.validity) || 0;

  return (
    <div className="space-y-6 p-4 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/admin"><Button variant="ghost" size="icon" className="h-8 w-8"><ArrowLeft className="w-4 h-4" /></Button></Link>
          <div>
            <div className="flex items-center gap-2"><Package className="w-6 h-6 text-primary" /><h1 className="text-2xl font-heading font-bold text-foreground">Kelola Produk</h1></div>
            <p className="text-sm text-muted-foreground mt-1">Tambah, edit, dan hapus produk investasi</p>
          </div>
        </div>
        <Button onClick={openCreateDialog} className="neon-pulse"><Plus className="w-4 h-4 mr-2" />Tambah</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="shadow-card"><CardContent className="p-4"><div className="flex items-center gap-2 mb-2"><Package className="w-4 h-4 text-primary" /><p className="text-xs text-muted-foreground">Total Produk</p></div><p className="text-2xl font-bold">{products.length}</p></CardContent></Card>
        <Card className="shadow-card"><CardContent className="p-4"><div className="flex items-center gap-2 mb-2"><TrendingUp className="w-4 h-4 text-success" /><p className="text-xs text-muted-foreground">VIP 1</p></div><p className="text-2xl font-bold">{products.filter((p) => p.vip_level === 1).length}</p></CardContent></Card>
        <Card className="shadow-card"><CardContent className="p-4"><div className="flex items-center gap-2 mb-2"><DollarSign className="w-4 h-4 text-accent" /><p className="text-xs text-muted-foreground">VIP 2-3</p></div><p className="text-2xl font-bold">{products.filter((p) => p.vip_level >= 2 && p.vip_level <= 3).length}</p></CardContent></Card>
        <Card className="shadow-card"><CardContent className="p-4"><div className="flex items-center gap-2 mb-2"><TrendingUp className="w-4 h-4 text-vip-gold" /><p className="text-xs text-muted-foreground">VIP 4-5</p></div><p className="text-2xl font-bold">{products.filter((p) => p.vip_level >= 4).length}</p></CardContent></Card>
      </div>

      {/* Products List */}
      <div className="space-y-3">
        {products.map((product) => (
          <Card key={product.id} className="shadow-card overflow-hidden">
            <CardContent className="p-0">
              <div className="flex gap-4">
                <div className="w-24 h-24 flex-shrink-0">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 py-3 pr-3">
                  <div className="flex items-start justify-between mb-2">
                    <div><h3 className="font-semibold text-foreground">{product.name}</h3><p className="text-xs text-muted-foreground">{product.description}</p></div>
                    <Badge variant="vip" className="text-xs">VIP {product.vip_level}</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs mb-2">
                    <div><p className="text-muted-foreground">Harga</p><p className="font-semibold text-primary">{formatCurrency(product.price)}</p></div>
                    <div><p className="text-muted-foreground">Harian</p><p className="font-semibold text-success">{formatCurrency(product.daily_income)}</p></div>
                    <div><p className="text-muted-foreground">Total</p><p className="font-semibold text-accent">{formatCurrency(product.total_income)}</p></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => openEditDialog(product)}><Edit className="w-3 h-3 mr-1" />Edit</Button>
                    <Button variant="destructive" size="sm" onClick={() => openDeleteDialog(product)}><Trash2 className="w-3 h-3 mr-1" />Hapus</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit/Create Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{isCreating ? "Tambah Produk Baru" : "Edit Produk"}</DialogTitle><DialogDescription>{isCreating ? "Tambahkan produk investasi baru" : "Perbarui informasi produk"}</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Nama Produk *</Label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Paket Investasi Pro" /></div>
            <div className="space-y-2"><Label>Harga Investasi (IDR) *</Label><Input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} placeholder="500000" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Penghasilan Harian *</Label><Input type="number" value={formData.daily_income} onChange={(e) => setFormData({ ...formData, daily_income: e.target.value })} placeholder="55000" /></div>
              <div className="space-y-2"><Label>Masa Berlaku (Hari) *</Label><Input type="number" value={formData.validity} onChange={(e) => setFormData({ ...formData, validity: e.target.value })} placeholder="20" /></div>
            </div>
            <div className="bg-muted/50 rounded-lg p-3 border border-border/50">
              <div className="flex items-center justify-between"><div className="flex items-center gap-2"><TrendingUp className="w-4 h-4 text-success" /><span className="text-sm text-muted-foreground">Total Penghasilan (otomatis)</span></div><span className="font-bold text-success">{formatCurrency(calculatedTotalIncome)}</span></div>
            </div>
            <div className="space-y-2"><Label>Level VIP</Label><Select value={formData.vip_level} onValueChange={(value) => setFormData({ ...formData, vip_level: value })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{[1, 2, 3, 4, 5].map((level) => <SelectItem key={level} value={level.toString()}>VIP {level}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-2"><Label>URL Gambar</Label><Input value={formData.image} onChange={(e) => setFormData({ ...formData, image: e.target.value })} placeholder="https://example.com/image.jpg" /></div>
            <div className="space-y-2"><Label>Deskripsi</Label><Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Deskripsi produk..." className="min-h-[80px]" /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setEditDialogOpen(false)}>Batal</Button><Button onClick={handleSave}>{isCreating ? "Tambah Produk" : "Simpan"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Hapus Produk?</DialogTitle><DialogDescription>Apakah Anda yakin ingin menghapus "{selectedProduct?.name}"? Tindakan ini tidak dapat dibatalkan.</DialogDescription></DialogHeader>
          <DialogFooter><Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Batal</Button><Button variant="destructive" onClick={handleDelete}>Hapus</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminProducts;
