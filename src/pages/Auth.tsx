import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, TrendingUp, Shield, Users } from "lucide-react";
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
    <div className="min-h-screen bg-background flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary/90 to-gold-500 p-12 flex-col justify-between relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gold-400/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10">
          <h1 className="font-display text-4xl font-bold text-white mb-2">
            InvestPro
          </h1>
          <p className="text-white/80">Platform Investasi Terpercaya</p>
        </div>

        <div className="relative z-10 space-y-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-lg">
                Return Tinggi
              </h3>
              <p className="text-white/70 text-sm">
                Dapatkan keuntungan hingga 10% per hari
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-lg">
                Aman & Terpercaya
              </h3>
              <p className="text-white/70 text-sm">
                Dilindungi sistem keamanan berlapis
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-lg">
                Bonus Referral
              </h3>
              <p className="text-white/70 text-sm">
                Ajak teman dan dapatkan komisi hingga 10%
              </p>
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-white/60 text-sm">
            © 2024 InvestPro. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right side - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <h1 className="font-display text-3xl font-bold text-primary mb-1">
              InvestPro
            </h1>
            <p className="text-muted-foreground text-sm">
              Platform Investasi Terpercaya
            </p>
          </div>

          <Card className="border-border/50 shadow-card">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-2xl font-display">
                Selamat Datang
              </CardTitle>
              <CardDescription>
                Masuk atau daftar untuk mulai berinvestasi
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
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
                      className="w-full"
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
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      size="lg"
                      disabled={isLoading}
                    >
                      {isLoading ? "Memproses..." : "Daftar Sekarang"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>

              {/* Demo notice */}
              <div className="mt-6 p-3 rounded-lg bg-muted/50 border border-border/50">
                <p className="text-xs text-muted-foreground text-center">
                  🎮 <strong>Mode Demo</strong> - Data disimpan di browser. User pertama otomatis jadi Admin.
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
