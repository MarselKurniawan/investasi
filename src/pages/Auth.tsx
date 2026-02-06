import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Eye, EyeOff, TrendingUp, Shield, Users, Sparkles, Zap, Phone, Mail } from "lucide-react";
import { z } from "zod";

const phoneSchema = z.string().min(10, "Nomor WhatsApp minimal 10 digit").regex(/^[0-9+]+$/, "Format nomor tidak valid");
const passwordSchema = z.string().min(6, "Password minimal 6 karakter");
const emailSchema = z.string().email("Format email tidak valid").optional().or(z.literal(""));

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { user, loading, signIn, signUp } = useAuth();
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user && !loading) {
      navigate("/");
    }
  }, [user, loading, navigate]);

  // Login form state
  const [loginPhone, setLoginPhone] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register form state
  const [registerName, setRegisterName] = useState("");
  const [registerPhone, setRegisterPhone] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState("");
  const [referralCode, setReferralCode] = useState(searchParams.get("ref") || "");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      phoneSchema.parse(loginPhone);
      passwordSchema.parse(loginPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Error",
          description: error.errors[0].message,
          variant: "destructive",
        });
        return;
      }
    }

    setIsLoading(true);
    const { error } = await signIn(loginPhone, loginPassword);
    setIsLoading(false);

    if (error) {
      toast({
        title: "Login Gagal",
        description: error.message === "Invalid login credentials" 
          ? "Nomor WhatsApp atau password salah" 
          : error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Login Berhasil!",
      description: "Selamat datang kembali di InvestPro",
    });
    navigate("/");
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      phoneSchema.parse(registerPhone);
      passwordSchema.parse(registerPassword);
      if (registerEmail) emailSchema.parse(registerEmail);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Error",
          description: error.errors[0].message,
          variant: "destructive",
        });
        return;
      }
    }

    if (registerPassword !== registerConfirmPassword) {
      toast({
        title: "Registrasi Gagal",
        description: "Password tidak cocok",
        variant: "destructive",
      });
      return;
    }

    if (!registerName.trim()) {
      toast({
        title: "Registrasi Gagal",
        description: "Nama harus diisi",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    const { error } = await signUp(registerPhone, registerPassword, registerName, referralCode || undefined, registerEmail || undefined);
    setIsLoading(false);

    if (error) {
      let errorMessage = error.message;
      if (error.message.includes("already registered")) {
        errorMessage = "Nomor sudah terdaftar. Silakan login.";
      }
      toast({
        title: "Registrasi Gagal",
        description: errorMessage,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Registrasi Berhasil!",
      description: "Akun Anda telah dibuat. Selamat berinvestasi!",
    });
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-primary">Memuat...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex relative overflow-hidden">
      {/* Background decorations */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
      </div>

      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/10 via-card to-accent/10 p-12 flex-col justify-between relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

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
            <div className="w-12 h-12 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-foreground font-semibold text-lg">Return Tinggi</h3>
              <p className="text-muted-foreground text-sm">Dapatkan keuntungan hingga 10% per hari</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-success/20 border border-success/30 flex items-center justify-center">
              <Shield className="w-6 h-6 text-success" />
            </div>
            <div>
              <h3 className="text-foreground font-semibold text-lg">Aman & Terpercaya</h3>
              <p className="text-muted-foreground text-sm">Dilindungi sistem keamanan berlapis</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-secondary/20 border border-secondary/30 flex items-center justify-center">
              <Users className="w-6 h-6 text-secondary" />
            </div>
            <div>
              <h3 className="text-foreground font-semibold text-lg">Bonus Referral</h3>
              <p className="text-muted-foreground text-sm">Ajak teman dan dapatkan komisi hingga 10%</p>
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-muted-foreground text-sm">© 2024 InvestPro. All rights reserved.</p>
        </div>
      </div>

      {/* Right side - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative z-10">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Sparkles className="w-7 h-7 text-primary" />
              <h1 className="font-heading text-3xl font-bold text-foreground">InvestPro</h1>
            </div>
            <p className="text-muted-foreground text-sm">Platform Investasi Terpercaya</p>
          </div>

          <Card className="border-border/50 shadow-card">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-2xl font-heading flex items-center gap-2">
                <Zap className="w-6 h-6 text-primary" />
                Selamat Datang
              </CardTitle>
              <CardDescription>Masuk atau daftar untuk mulai berinvestasi</CardDescription>
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
                      <Label htmlFor="login-phone" className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5" />
                        Nomor WhatsApp
                      </Label>
                      <Input
                        id="login-phone"
                        type="tel"
                        placeholder="08123456789"
                        value={loginPhone}
                        onChange={(e) => setLoginPhone(e.target.value)}
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
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
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
                      <Label htmlFor="register-phone" className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5" />
                        Nomor WhatsApp
                      </Label>
                      <Input
                        id="register-phone"
                        type="tel"
                        placeholder="08123456789"
                        value={registerPhone}
                        onChange={(e) => setRegisterPhone(e.target.value)}
                        required
                        className="bg-muted/50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-email" className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5" />
                        Email <span className="text-muted-foreground text-xs">(Opsional)</span>
                      </Label>
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="nama@email.com"
                        value={registerEmail}
                        onChange={(e) => setRegisterEmail(e.target.value)}
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
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-confirm-password">Konfirmasi Password</Label>
                      <Input
                        id="register-confirm-password"
                        type="password"
                        placeholder="Ulangi password"
                        value={registerConfirmPassword}
                        onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                        required
                        className="bg-muted/50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="referral-code">
                        Kode Referral <span className="text-muted-foreground">(Opsional)</span>
                      </Label>
                      <Input
                        id="referral-code"
                        type="text"
                        placeholder="Masukkan kode referral"
                        value={referralCode}
                        onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                        className="bg-muted/50"
                      />
                    </div>

                    <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                      {isLoading ? "Memproses..." : "Daftar Sekarang"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Auth;
