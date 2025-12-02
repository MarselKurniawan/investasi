import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Users, TrendingUp, Share2, Crown, Award } from "lucide-react";

const Team = () => {
  const currentVipLevel = 1;
  const totalReferrals = 5;
  const requiredReferrals = 10;
  const progressPercentage = (totalReferrals / requiredReferrals) * 100;

  const teamTiers = [
    {
      tier: "C",
      name: "Bronze Team",
      commission: 1,
      requiredMembers: 5,
      currentMembers: 5,
      color: "text-amber-700",
      bgColor: "bg-amber-50",
      achieved: true,
    },
    {
      tier: "B",
      name: "Silver Team",
      commission: 4,
      requiredMembers: 15,
      currentMembers: 5,
      color: "text-gray-600",
      bgColor: "bg-gray-50",
      achieved: false,
    },
    {
      tier: "A",
      name: "Gold Team",
      commission: 10,
      requiredMembers: 30,
      currentMembers: 5,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      achieved: false,
    },
  ];

  const referralStats = {
    totalEarnings: 450000,
    activeMembers: 5,
    pendingMembers: 2,
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6 p-4 pt-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground mb-1">Tim & Referral</h1>
        <p className="text-sm text-muted-foreground">Kembangkan tim dan tingkatkan level VIP</p>
      </div>

      {/* VIP Progress Card */}
      <Card className="shadow-elegant border-2 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Crown className="w-6 h-6 text-vip-gold" />
              <div>
                <h3 className="font-bold text-lg text-foreground">Level VIP Anda</h3>
                <p className="text-sm text-muted-foreground">Progress ke VIP {currentVipLevel + 1}</p>
              </div>
            </div>
            <Badge variant="vip" className="text-base px-4 py-2">
              VIP {currentVipLevel}
            </Badge>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Referral Progress</span>
              <span className="font-bold text-foreground">
                {totalReferrals} / {requiredReferrals}
              </span>
            </div>
            <Progress value={progressPercentage} className="h-3" />
            <p className="text-xs text-muted-foreground text-center">
              Ajak {requiredReferrals - totalReferrals} teman lagi untuk naik ke VIP {currentVipLevel + 1}
            </p>
          </div>

          <Button variant="vip" className="w-full mt-4" size="lg">
            <Share2 className="w-4 h-4 mr-2" />
            Bagikan Kode Referral
          </Button>
        </CardContent>
      </Card>

      {/* Referral Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="shadow-card">
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground mb-2">Total Komisi</p>
            <p className="text-base font-bold text-success">{formatCurrency(referralStats.totalEarnings)}</p>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground mb-2">Anggota Aktif</p>
            <p className="text-base font-bold text-primary">{referralStats.activeMembers}</p>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground mb-2">Pending</p>
            <p className="text-base font-bold text-accent">{referralStats.pendingMembers}</p>
          </CardContent>
        </Card>
      </div>

      {/* Team Tiers */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Award className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-heading font-bold text-foreground">Tingkatan Tim</h2>
        </div>

        <div className="space-y-3">
          {teamTiers.map((tier) => (
            <Card
              key={tier.tier}
              className={`shadow-card ${tier.achieved ? "border-2 border-success" : "opacity-75"}`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base font-bold mb-1">
                      Tim {tier.tier} - {tier.name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Komisi {tier.commission}% dari setiap transaksi
                    </p>
                  </div>
                  {tier.achieved && (
                    <Badge variant="success" className="text-xs">
                      Achieved
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Progress Anggota</span>
                      <span className="font-bold text-foreground">
                        {tier.currentMembers} / {tier.requiredMembers}
                      </span>
                    </div>
                    <Progress
                      value={(tier.currentMembers / tier.requiredMembers) * 100}
                      className="h-2"
                    />
                  </div>

                  <div className={`${tier.bgColor} rounded-lg p-3 flex items-center justify-between`}>
                    <div className="flex items-center gap-2">
                      <TrendingUp className={`w-4 h-4 ${tier.color}`} />
                      <span className={`text-sm font-semibold ${tier.color}`}>
                        Komisi {tier.commission}%
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {tier.requiredMembers - tier.currentMembers > 0
                        ? `${tier.requiredMembers - tier.currentMembers} anggota lagi`
                        : "Tercapai!"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Team Members */}
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            <CardTitle className="text-base">Anggota Tim Anda</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { name: "User123", level: 1, earnings: 150000, status: "Aktif" },
              { name: "User456", level: 1, earnings: 120000, status: "Aktif" },
              { name: "User789", level: 1, earnings: 95000, status: "Aktif" },
              { name: "User012", level: 0, earnings: 50000, status: "Pending" },
              { name: "User345", level: 1, earnings: 35000, status: "Aktif" },
            ].map((member, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-muted rounded-lg"
              >
                <div>
                  <p className="font-semibold text-sm text-foreground">{member.name}</p>
                  <p className="text-xs text-muted-foreground">
                    VIP {member.level} • {member.status}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-success">{formatCurrency(member.earnings)}</p>
                  <p className="text-xs text-muted-foreground">Total Komisi</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* CTA Card */}
      <Card className="bg-gradient-primary text-primary-foreground border-0 shadow-glow">
        <CardContent className="p-6 text-center">
          <Crown className="w-12 h-12 mx-auto mb-3 opacity-90" />
          <h3 className="font-bold text-lg mb-2">Raih Komisi Lebih Tinggi!</h3>
          <p className="text-sm opacity-90 mb-4">
            Ajak lebih banyak teman dan dapatkan komisi hingga 10%
          </p>
          <Button variant="secondary" className="font-semibold">
            Pelajari Lebih Lanjut
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Team;
