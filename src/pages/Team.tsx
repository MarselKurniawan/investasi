import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, TrendingUp, Share2, Crown, Award } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { formatCurrency, Profile } from "@/lib/database";
import { getMultiLevelTeam, MultiLevelTeam, COMMISSION_RATES, RABAT_RATES } from "@/lib/teamUtils";
import ReferralDialog from "@/components/ReferralDialog";

const Team = () => {
  const { profile, refreshProfile } = useAuth();
  const [team, setTeam] = useState<MultiLevelTeam>({
    levelA: [],
    levelB: [],
    levelC: [],
    total: 0,
  });
  const [referralOpen, setReferralOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  const loadData = async () => {
    if (profile?.referral_code) {
      const teamData = await getMultiLevelTeam(profile.referral_code);
      setTeam(teamData);
    }
    await refreshProfile();
  };

  useEffect(() => {
    loadData();
  }, [profile?.referral_code]);

  const currentVipLevel = profile?.vip_level || 1;
  const totalReferrals = team.total;

  // VIP requirements based on total team members (all levels)
  const vipRequirements = [0, 0, 5, 15, 30, 50];
  const nextVipLevel = Math.min(currentVipLevel + 1, 5);
  const requiredReferrals = vipRequirements[nextVipLevel];
  const progressPercentage = requiredReferrals > 0 ? Math.min((totalReferrals / requiredReferrals) * 100, 100) : 100;

  const teamLevels = [
    {
      level: "A",
      name: "Level A",
      description: "Bawahan Langsung",
      commission: COMMISSION_RATES.A,
      rabat: RABAT_RATES.A,
      members: team.levelA,
      color: "text-vip-gold",
      bgColor: "bg-vip-gold/10",
      badgeColor: "bg-vip-gold text-white",
    },
    {
      level: "B",
      name: "Level B",
      description: "Generasi Kedua",
      commission: COMMISSION_RATES.B,
      rabat: RABAT_RATES.B,
      members: team.levelB,
      color: "text-gray-400",
      bgColor: "bg-gray-800/30",
      badgeColor: "bg-gray-500 text-white",
    },
    {
      level: "C",
      name: "Level C",
      description: "Generasi Ketiga",
      commission: COMMISSION_RATES.C,
      rabat: RABAT_RATES.C,
      members: team.levelC,
      color: "text-amber-700",
      bgColor: "bg-amber-900/20",
      badgeColor: "bg-amber-700 text-white",
    },
  ];

  const renderMemberCard = (member: Profile, level: string, badgeColor: string) => (
    <div
      key={member.id}
      className="flex items-center justify-between p-3 bg-muted rounded-lg"
    >
      <div>
        <div className="flex items-center gap-2">
          <p className="font-semibold text-sm text-foreground">{member.name}</p>
          <Badge className={`text-xs ${badgeColor}`}>Level {level}</Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          VIP {member.vip_level} • Bergabung {new Date(member.created_at).toLocaleDateString('id-ID')}
        </p>
      </div>
      <Badge variant="success" className="text-xs">Aktif</Badge>
    </div>
  );

  return (
    <div className="space-y-6 p-4 pt-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground mb-1">Tim & Referral</h1>
        <p className="text-sm text-muted-foreground">Kembangkan tim 3 level dan tingkatkan VIP</p>
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
                <span className="text-muted-foreground">Total Anggota Tim (A+B+C)</span>
                <span className="font-bold text-foreground">
                  {totalReferrals} / {requiredReferrals}
                </span>
              </div>
              <Progress value={progressPercentage} className="h-3" />
              <p className="text-xs text-muted-foreground text-center">
                Ajak {Math.max(0, requiredReferrals - totalReferrals)} orang lagi untuk naik ke VIP {nextVipLevel}
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

      {/* Team Stats by Level */}
      <div className="grid grid-cols-3 gap-3">
        {teamLevels.map((level) => (
          <Card key={level.level} className="shadow-card">
            <CardContent className="p-3 text-center">
              <p className={`text-xs font-semibold mb-1 ${level.color}`}>{level.name}</p>
              <p className="text-lg font-bold text-foreground">{level.members.length}</p>
              <p className="text-xs text-muted-foreground">orang</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Income Stats */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="shadow-card">
          <CardContent className="p-3 text-center">
            <p className="text-xs text-muted-foreground mb-1">Total Komisi</p>
            <p className="text-sm font-bold text-primary">{formatCurrency(profile?.team_income || 0)}</p>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-3 text-center">
            <p className="text-xs text-muted-foreground mb-1">Total Rabat</p>
            <p className="text-sm font-bold text-vip-gold">{formatCurrency(profile?.rabat_income || 0)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Commission/Rabat Rates Info */}
      <Card className="shadow-card">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            <CardTitle className="text-base">Struktur Komisi & Rabat</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {teamLevels.map((level) => (
            <div key={level.level} className={`${level.bgColor} rounded-lg p-3`}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Badge className={level.badgeColor}>{level.level}</Badge>
                  <span className={`text-sm font-semibold ${level.color}`}>
                    {level.name}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">{level.description}</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-2">
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-primary" />
                  <span className="text-muted-foreground">Komisi:</span>
                  <span className="font-bold text-primary">{level.commission}%</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-muted-foreground">Rabat:</span>
                  <span className="font-bold text-vip-gold">{level.rabat}%</span>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Team Members */}
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            <CardTitle className="text-base">Anggota Tim ({team.total})</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-4">
              <TabsTrigger value="all">Semua</TabsTrigger>
              <TabsTrigger value="A">Level A</TabsTrigger>
              <TabsTrigger value="B">Level B</TabsTrigger>
              <TabsTrigger value="C">Level C</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-0">
              {team.total === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground">Belum ada anggota tim</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Bagikan kode referral untuk mengajak teman
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {team.levelA.map((member) => renderMemberCard(member, "A", teamLevels[0].badgeColor))}
                  {team.levelB.map((member) => renderMemberCard(member, "B", teamLevels[1].badgeColor))}
                  {team.levelC.map((member) => renderMemberCard(member, "C", teamLevels[2].badgeColor))}
                </div>
              )}
            </TabsContent>
            
            {teamLevels.map((level, idx) => (
              <TabsContent key={level.level} value={level.level} className="mt-0">
                {level.members.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground">Belum ada anggota {level.name}</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {level.members.map((member) => renderMemberCard(member, level.level, level.badgeColor))}
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* CTA Card */}
      <Card className="bg-gradient-primary text-primary-foreground border-0 shadow-glow">
        <CardContent className="p-6 text-center">
          <Crown className="w-12 h-12 mx-auto mb-3 opacity-90" />
          <h3 className="font-bold text-lg mb-2">Raih Komisi 3 Level!</h3>
          <p className="text-sm opacity-90 mb-4">
            Ajak teman dan dapatkan komisi dari 3 generasi bawahan
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
        referralCode={profile?.referral_code || ''}
      />
    </div>
  );
};

export default Team;
