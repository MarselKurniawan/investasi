import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Users, TrendingUp, Share2, Crown, Award } from "lucide-react";
import { getCurrentUser, getTeamMembers, formatCurrency, User, TeamMember } from "@/lib/store";
import ReferralDialog from "@/components/ReferralDialog";

const Team = () => {
  const [user, setUser] = useState<User | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [referralOpen, setReferralOpen] = useState(false);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      setTeamMembers(getTeamMembers(currentUser.id));
    }
  }, []);

  const currentVipLevel = user?.vipLevel || 1;
  const totalReferrals = teamMembers.length;

  // VIP requirements
  const vipRequirements = [0, 0, 5, 15, 30, 50]; // referrals needed for each VIP level
  const nextVipLevel = Math.min(currentVipLevel + 1, 5);
  const requiredReferrals = vipRequirements[nextVipLevel];
  const progressPercentage = requiredReferrals > 0 ? Math.min((totalReferrals / requiredReferrals) * 100, 100) : 100;

  const teamTiers = [
    {
      tier: "C",
      name: "Bronze Team",
      commission: 1,
      requiredMembers: 5,
      currentMembers: totalReferrals,
      color: "text-amber-700",
      bgColor: "bg-amber-50",
      achieved: totalReferrals >= 5,
    },
    {
      tier: "B",
      name: "Silver Team",
      commission: 4,
      requiredMembers: 15,
      currentMembers: totalReferrals,
      color: "text-gray-600",
      bgColor: "bg-gray-50",
      achieved: totalReferrals >= 15,
    },
    {
      tier: "A",
      name: "Gold Team",
      commission: 10,
      requiredMembers: 30,
      currentMembers: totalReferrals,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      achieved: totalReferrals >= 30,
    },
  ];

  const referralStats = {
    totalEarnings: user?.teamIncome || 0,
    activeMembers: teamMembers.filter(m => m.status === 'active').length,
    pendingMembers: teamMembers.filter(m => m.status === 'pending').length,
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
                {currentVipLevel < 5 && (
                  <p className="text-sm text-muted-foreground">Progress ke VIP {nextVipLevel}</p>
                )}
              </div>
            </div>
            <Badge variant="vip" className="text-base px-4 py-2">
              VIP {currentVipLevel}
            </Badge>
          </div>

          {currentVipLevel < 5 ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Referral Progress</span>
                <span className="font-bold text-foreground">
                  {totalReferrals} / {requiredReferrals}
                </span>
              </div>
              <Progress value={progressPercentage} className="h-3" />
              <p className="text-xs text-muted-foreground text-center">
                Ajak {Math.max(0, requiredReferrals - totalReferrals)} teman lagi untuk naik ke VIP {nextVipLevel}
              </p>
            </div>
          ) : (
            <div className="bg-success/10 rounded-lg p-4 text-center">
              <p className="text-success font-semibold">🎉 Anda sudah mencapai VIP Tertinggi!</p>
            </div>
          )}

          <Button
            variant="vip"
            className="w-full mt-4"
            size="lg"
            onClick={() => setReferralOpen(true)}
          >
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
                        {Math.min(tier.currentMembers, tier.requiredMembers)} / {tier.requiredMembers}
                      </span>
                    </div>
                    <Progress
                      value={Math.min((tier.currentMembers / tier.requiredMembers) * 100, 100)}
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
          {teamMembers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">Belum ada anggota tim</p>
              <p className="text-sm text-muted-foreground mt-1">
                Bagikan kode referral untuk mengajak teman
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {teamMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <div>
                    <p className="font-semibold text-sm text-foreground">{member.name}</p>
                    <p className="text-xs text-muted-foreground">
                      VIP {member.vipLevel} • {member.status === 'active' ? 'Aktif' : 'Pending'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-success">{formatCurrency(member.totalEarnings)}</p>
                    <p className="text-xs text-muted-foreground">Total Komisi</p>
                  </div>
                </div>
              ))}
            </div>
          )}
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
          <Button variant="secondary" className="font-semibold" onClick={() => setReferralOpen(true)}>
            Bagikan Sekarang
          </Button>
        </CardContent>
      </Card>

      {/* Referral Dialog */}
      <ReferralDialog
        open={referralOpen}
        onOpenChange={setReferralOpen}
        referralCode={user?.referralCode || ''}
      />
    </div>
  );
};

export default Team;
