import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, TrendingUp, Shield, Users, Sparkles, Zap } from "lucide-react";
import { registerUser, loginUser, getCurrentUser, getAllUsers } from "@/lib/store";

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check if already logged in
  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      navigate("/");
    }
  }, [navigate]);

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register form state
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState("");
  const [referralCode, setReferralCode] = useState(searchParams.get("ref") || "");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    const user = loginUser(loginEmail, loginPassword);

    if (user) {
      toast({
        title: "Login Berhasil!",
        description: "Selamat datang kembali di InvestPro",
      });
      navigate("/");
    } else {
      // Try to check if user exists
      const allUsers = getAllUsers();
      const exists = allUsers.find(u => u.email === loginEmail);
      
      if (!exists) {
        toast({
          title: "Akun Tidak Ditemukan",
          description: "Silakan daftar terlebih dahulu",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Login Gagal",
          description: "Email atau password salah",
          variant: "destructive",
        });
      }
    }

    setIsLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (registerPassword !== registerConfirmPassword) {
      toast({
        title: "Registrasi Gagal",
        description: "Password tidak cocok",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    if (registerPassword.length < 6) {
      toast({
        title: "Registrasi Gagal",
        description: "Password minimal 6 karakter",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    // Check if email already exists
    const allUsers = getAllUsers();
    if (allUsers.find(u => u.email === registerEmail)) {
      toast({
        title: "Registrasi Gagal",
        description: "Email sudah terdaftar",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    if (registerName && registerEmail && registerPassword) {
      const user = registerUser(registerName, registerEmail, registerPassword, referralCode || undefined);

      toast({
        title: "Registrasi Berhasil!",
        description: user.isAdmin 
          ? "Akun Admin telah dibuat. Selamat berinvestasi!" 
          : "Akun Anda telah dibuat. Selamat berinvestasi!",
      });

      navigate("/");
    } else {
      toast({
        title: "Registrasi Gagal",
        description: "Mohon lengkapi semua data",
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex relative overflow-hidden">
      {/* Background decorations */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-accent/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-0 w-64 h-64 bg-vip-gold/10 rounded-full blur-3xl" />
      </div>

      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/20 via-card to-accent/20 p-12 flex-col justify-between relative">
        {/* Background decorations */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-vip-gold/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-8 h-8 text-primary" />
            <h1 className="font-heading text-4xl font-bold text-foreground">
              InvestPro
            </h1>
          </div>
          <p className="text-muted-foreground">Platform Investasi Terpercaya</p>
        </div>

        <div className="relative z-10 space-y-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center neon-pulse">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-foreground font-semibold text-lg">
                Return Tinggi
              </h3>
              <p className="text-muted-foreground text-sm">
                Dapatkan keuntungan hingga 10% per hari
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-success/20 border border-success/30 flex items-center justify-center">
              <Shield className="w-6 h-6 text-success" />
            </div>
            <div>
              <h3 className="text-foreground font-semibold text-lg">
                Aman & Terpercaya
              </h3>
              <p className="text-muted-foreground text-sm">
                Dilindungi sistem keamanan berlapis
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-vip-gold/20 border border-vip-gold/30 flex items-center justify-center gold-pulse">
              <Users className="w-6 h-6 text-vip-gold" />
            </div>
            <div>
              <h3 className="text-foreground font-semibold text-lg">
                Bonus Referral
              </h3>
              <p className="text-muted-foreground text-sm">
                Ajak teman dan dapatkan komisi hingga 10%
              </p>
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-muted-foreground text-sm">
            © 2024 InvestPro. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right side - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative z-10">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Sparkles className="w-7 h-7 text-primary" />
              <h1 className="font-heading text-3xl font-bold text-foreground">
                InvestPro
              </h1>
            </div>
            <p className="text-muted-foreground text-sm">
              Platform Investasi Terpercaya
            </p>
          </div>

          <Card className="border-primary/20 shadow-glow">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-2xl font-heading flex items-center gap-2">
                <Zap className="w-6 h-6 text-primary" />
                Selamat Datang
              </CardTitle>
              <CardDescription>
                Masuk atau daftar untuk mulai berinvestasi
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6 bg-muted">
                  <TabsTrigger value="login">Masuk</TabsTrigger>
                  <TabsTrigger value="register">Daftar</TabsTrigger>
                </TabsList>

                {/* Login Tab */}
                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email</Label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="nama@email.com"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        required
                        className="bg-muted/50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="login-password">Password</Label>
                      <div className="relative">
                        <Input
                          id="login-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Masukkan password"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          required
                          className="bg-muted/50"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full neon-pulse"
                      size="lg"
                      disabled={isLoading}
                    >
                      {isLoading ? "Memproses..." : "Masuk"}
                    </Button>
                  </form>
                </TabsContent>

                {/* Register Tab */}
                <TabsContent value="register">
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-name">Nama Lengkap</Label>
                      <Input
                        id="register-name"
                        type="text"
                        placeholder="Masukkan nama lengkap"
                        value={registerName}
                        onChange={(e) => setRegisterName(e.target.value)}
                        required
                        className="bg-muted/50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-email">Email</Label>
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="nama@email.com"
                        value={registerEmail}
                        onChange={(e) => setRegisterEmail(e.target.value)}
                        required
                        className="bg-muted/50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-password">Password</Label>
                      <div className="relative">
                        <Input
                          id="register-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Minimal 6 karakter"
                          value={registerPassword}
                          onChange={(e) => setRegisterPassword(e.target.value)}
                          required
                          minLength={6}
                          className="bg-muted/50"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-confirm-password">
                        Konfirmasi Password
                      </Label>
                      <Input
                        id="register-confirm-password"
                        type="password"
                        placeholder="Ulangi password"
                        value={registerConfirmPassword}
                        onChange={(e) =>
                          setRegisterConfirmPassword(e.target.value)
                        }
                        required
                        className="bg-muted/50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="referral-code">
                        Kode Referral{" "}
                        <span className="text-muted-foreground">(Opsional)</span>
                      </Label>
                      <Input
                        id="referral-code"
                        type="text"
                        placeholder="Masukkan kode referral"
                        value={referralCode}
                        onChange={(e) => setReferralCode(e.target.value)}
                        className="bg-muted/50"
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full neon-pulse"
                      size="lg"
                      disabled={isLoading}
                    >
                      {isLoading ? "Memproses..." : "Daftar Sekarang"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>

              {/* Demo notice */}
              <div className="mt-6 p-3 rounded-lg bg-muted/50 border border-primary/20">
                <p className="text-xs text-muted-foreground text-center">
                  🎮 <strong className="text-primary">Mode Demo</strong> - Data disimpan di browser. User pertama otomatis jadi Admin.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Auth;
