import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  getAllProducts,
  formatCurrency,
  Product,
} from "@/lib/store";
import {
  Package,
  Plus,
  Edit,
  Trash2,
  ArrowLeft,
  TrendingUp,
  Calendar,
  DollarSign,
  Image as ImageIcon,
} from "lucide-react";
import { Link } from "react-router-dom";

// For demo purposes, we'll manage products in localStorage
const PRODUCTS_STORAGE_KEY = "custom_products";

const getStoredProducts = (): Product[] => {
  const stored = localStorage.getItem(PRODUCTS_STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  // Initialize with default products
  const defaultProducts = getAllProducts();
  localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(defaultProducts));
  return defaultProducts;
};

const saveProducts = (products: Product[]) => {
  localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
};

const AdminProducts = () => {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    series: "",
    model: "",
    price: "",
    dailyIncome: "",
    validity: "",
    vipLevel: "1",
    image: "",
    description: "",
    totalStock: "",
    availableStock: "",
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = () => {
    setProducts(getStoredProducts());
  };

  const calculateTotalIncome = (dailyIncome: number, validity: number) => {
    return dailyIncome * validity;
  };

  const resetForm = () => {
    setFormData({
      name: "",
      series: "",
      model: "",
      price: "",
      dailyIncome: "",
      validity: "",
      vipLevel: "1",
      image: "",
      description: "",
      totalStock: "",
      availableStock: "",
    });
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
      series: product.series,
      model: product.model,
      price: product.price.toString(),
      dailyIncome: product.dailyIncome.toString(),
      validity: product.validity.toString(),
      vipLevel: product.vipLevel.toString(),
      image: product.image,
      description: product.description,
      totalStock: product.totalStock.toString(),
      availableStock: product.availableStock.toString(),
    });
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (product: Product) => {
    setSelectedProduct(product);
    setDeleteDialogOpen(true);
  };

  const handleSave = () => {
    const price = parseInt(formData.price);
    const dailyIncome = parseInt(formData.dailyIncome);
    const validity = parseInt(formData.validity);
    const totalStock = parseInt(formData.totalStock);
    const availableStock = parseInt(formData.availableStock);

    if (!formData.name || isNaN(price) || isNaN(dailyIncome) || isNaN(validity)) {
      toast({
        title: "Error",
        description: "Mohon isi semua field dengan benar",
        variant: "destructive",
      });
      return;
    }

    const productData: Product = {
      id: isCreating ? Date.now() : selectedProduct!.id,
      name: formData.name,
      series: formData.series || "Standard Series",
      model: formData.model || `MDL-${Date.now().toString().slice(-6)}`,
      price,
      dailyIncome,
      validity,
      totalIncome: calculateTotalIncome(dailyIncome, validity),
      vipLevel: parseInt(formData.vipLevel),
      image: formData.image || "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=400&h=300&fit=crop",
      description: formData.description || "Investasi dengan return menarik",
      totalStock: totalStock || 1000,
      availableStock: availableStock || 800,
    };

    let updatedProducts: Product[];
    if (isCreating) {
      updatedProducts = [...products, productData];
      toast({
        title: "Produk Ditambahkan",
        description: `${productData.name} berhasil ditambahkan`,
      });
    } else {
      updatedProducts = products.map((p) =>
        p.id === selectedProduct!.id ? productData : p
      );
      toast({
        title: "Produk Diperbarui",
        description: `${productData.name} berhasil diperbarui`,
      });
    }

    saveProducts(updatedProducts);
    setProducts(updatedProducts);
    setEditDialogOpen(false);
    resetForm();
  };

  const handleDelete = () => {
    if (!selectedProduct) return;

    const updatedProducts = products.filter((p) => p.id !== selectedProduct.id);
    saveProducts(updatedProducts);
    setProducts(updatedProducts);
    setDeleteDialogOpen(false);
    toast({
      title: "Produk Dihapus",
      description: `${selectedProduct.name} berhasil dihapus`,
    });
  };

  // Auto-calculate total income when dailyIncome or validity changes
  const calculatedTotalIncome =
    parseInt(formData.dailyIncome) * parseInt(formData.validity) || 0;

  return (
    <div className="space-y-6 p-4 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/admin">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <Package className="w-6 h-6 text-primary" />
              <h1 className="text-2xl font-heading font-bold text-foreground">
                Kelola Produk
              </h1>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Tambah, edit, dan hapus produk investasi
            </p>
          </div>
        </div>
        <Button onClick={openCreateDialog} className="neon-pulse">
          <Plus className="w-4 h-4 mr-2" />
          Tambah
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Package className="w-4 h-4 text-primary" />
              <p className="text-xs text-muted-foreground">Total Produk</p>
            </div>
            <p className="text-2xl font-bold">{products.length}</p>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-success" />
              <p className="text-xs text-muted-foreground">VIP 1</p>
            </div>
            <p className="text-2xl font-bold">
              {products.filter((p) => p.vipLevel === 1).length}
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-accent" />
              <p className="text-xs text-muted-foreground">VIP 2-3</p>
            </div>
            <p className="text-2xl font-bold">
              {products.filter((p) => p.vipLevel >= 2 && p.vipLevel <= 3).length}
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-vip-gold" />
              <p className="text-xs text-muted-foreground">VIP 4-5</p>
            </div>
            <p className="text-2xl font-bold">
              {products.filter((p) => p.vipLevel >= 4).length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Products List */}
      <div className="space-y-3">
        {products.map((product) => (
          <Card key={product.id} className="shadow-card overflow-hidden">
            <CardContent className="p-0">
              <div className="flex gap-4">
                {/* Product Image */}
                <div className="w-24 h-24 flex-shrink-0">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Product Info */}
                <div className="flex-1 py-3 pr-3">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {product.name}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {product.series} • {product.model}
                      </p>
                    </div>
                    <Badge variant="vip" className="text-xs">
                      VIP {product.vipLevel}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs mb-2">
                    <div>
                      <p className="text-muted-foreground">Harga</p>
                      <p className="font-semibold text-primary">
                        {formatCurrency(product.price)}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Harian</p>
                      <p className="font-semibold text-success">
                        {formatCurrency(product.dailyIncome)}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total</p>
                      <p className="font-semibold text-accent">
                        {formatCurrency(product.totalIncome)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(product)}
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => openDeleteDialog(product)}
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Hapus
                    </Button>
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
          <DialogHeader>
            <DialogTitle>
              {isCreating ? "Tambah Produk Baru" : "Edit Produk"}
            </DialogTitle>
            <DialogDescription>
              {isCreating
                ? "Tambahkan produk investasi baru"
                : "Perbarui informasi produk"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nama Produk *</Label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Paket Investasi Pro"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Series</Label>
                <Input
                  value={formData.series}
                  onChange={(e) =>
                    setFormData({ ...formData, series: e.target.value })
                  }
                  placeholder="B Series Period"
                />
              </div>
              <div className="space-y-2">
                <Label>Model</Label>
                <Input
                  value={formData.model}
                  onChange={(e) =>
                    setFormData({ ...formData, model: e.target.value })
                  }
                  placeholder="CV-ESS-100S"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Harga Investasi (IDR) *</Label>
              <Input
                type="number"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                placeholder="500000"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Penghasilan Harian (IDR) *</Label>
                <Input
                  type="number"
                  value={formData.dailyIncome}
                  onChange={(e) =>
                    setFormData({ ...formData, dailyIncome: e.target.value })
                  }
                  placeholder="55000"
                />
              </div>
              <div className="space-y-2">
                <Label>Masa Berlaku (Hari) *</Label>
                <Input
                  type="number"
                  value={formData.validity}
                  onChange={(e) =>
                    setFormData({ ...formData, validity: e.target.value })
                  }
                  placeholder="20"
                />
              </div>
            </div>

            {/* Auto-calculated Total Income */}
            <div className="bg-muted/50 rounded-lg p-3 border border-border/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-success" />
                  <span className="text-sm text-muted-foreground">
                    Total Penghasilan (otomatis)
                  </span>
                </div>
                <span className="font-bold text-success">
                  {formatCurrency(calculatedTotalIncome)}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Level VIP</Label>
              <Select
                value={formData.vipLevel}
                onValueChange={(value) =>
                  setFormData({ ...formData, vipLevel: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((level) => (
                    <SelectItem key={level} value={level.toString()}>
                      VIP {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Total Stok</Label>
                <Input
                  type="number"
                  value={formData.totalStock}
                  onChange={(e) =>
                    setFormData({ ...formData, totalStock: e.target.value })
                  }
                  placeholder="1000"
                />
              </div>
              <div className="space-y-2">
                <Label>Stok Tersedia</Label>
                <Input
                  type="number"
                  value={formData.availableStock}
                  onChange={(e) =>
                    setFormData({ ...formData, availableStock: e.target.value })
                  }
                  placeholder="800"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>URL Gambar</Label>
              <Input
                value={formData.image}
                onChange={(e) =>
                  setFormData({ ...formData, image: e.target.value })
                }
                placeholder="https://..."
              />
            </div>

            <div className="space-y-2">
              <Label>Deskripsi</Label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Deskripsi singkat produk..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleSave}>
              {isCreating ? "Tambah Produk" : "Simpan Perubahan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Produk</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus{" "}
              <span className="font-semibold">{selectedProduct?.name}</span>?
              Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Batal
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Hapus Produk
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminProducts;
