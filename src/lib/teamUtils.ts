import { supabase } from '@/integrations/supabase/client';
import { Profile } from './database';

export interface TeamMember extends Profile {
  level: 'A' | 'B' | 'C';
}

export interface MultiLevelTeam {
  levelA: Profile[]; // Direct referrals
  levelB: Profile[]; // 2nd generation
  levelC: Profile[]; // 3rd generation
  total: number;
}

// Commission rates by level (on purchase)
export const COMMISSION_RATES = {
  A: 10, // 10%
  B: 3,  // 3%
  C: 2,  // 2%
};

// Rabat rates by level (on daily profit)
export const RABAT_RATES = {
  A: 5, // 5%
  B: 3, // 3%
  C: 2, // 2%
};

// VIP level thresholds based on total team members (A+B+C)
export const VIP_THRESHOLDS = [
  { level: 5, members: 300 },
  { level: 4, members: 200 },
  { level: 3, members: 100 },
  { level: 2, members: 50 },
  { level: 1, members: 10 },
];

// Calculate VIP level from total team count
export const calculateVipLevel = (totalMembers: number): number => {
  for (const tier of VIP_THRESHOLDS) {
    if (totalMembers >= tier.members) return tier.level;
  }
  return 1;
};

// Get all referral codes from a list of profiles
const getReferralCodes = (profiles: Profile[]): string[] => {
  return profiles
    .map(p => p.referral_code)
    .filter((code): code is string => code !== null && code !== '');
};

// Get multi-level team members (3 levels deep)
export const getMultiLevelTeam = async (referralCode: string): Promise<MultiLevelTeam> => {
  const result: MultiLevelTeam = {
    levelA: [],
    levelB: [],
    levelC: [],
    total: 0,
  };

  if (!referralCode) return result;

  // Level A - Direct referrals
  const { data: levelAData, error: levelAError } = await supabase
    .from('profiles')
    .select('*')
    .eq('referred_by', referralCode)
    .order('created_at', { ascending: false });

  if (levelAError) {
    console.error('Error fetching Level A members:', levelAError);
    return result;
  }

  result.levelA = levelAData || [];

  if (result.levelA.length === 0) {
    return result;
  }

  // Get referral codes from Level A to find Level B
  const levelAReferralCodes = getReferralCodes(result.levelA);

  if (levelAReferralCodes.length > 0) {
    // Level B - Referrals of Level A members
    const { data: levelBData, error: levelBError } = await supabase
      .from('profiles')
      .select('*')
      .in('referred_by', levelAReferralCodes)
      .order('created_at', { ascending: false });

    if (levelBError) {
      console.error('Error fetching Level B members:', levelBError);
    } else {
      result.levelB = levelBData || [];
    }
  }

  if (result.levelB.length > 0) {
    // Get referral codes from Level B to find Level C
    const levelBReferralCodes = getReferralCodes(result.levelB);

    if (levelBReferralCodes.length > 0) {
      // Level C - Referrals of Level B members
      const { data: levelCData, error: levelCError } = await supabase
        .from('profiles')
        .select('*')
        .in('referred_by', levelBReferralCodes)
        .order('created_at', { ascending: false });

      if (levelCError) {
        console.error('Error fetching Level C members:', levelCError);
      } else {
        result.levelC = levelCData || [];
      }
    }
  }

  result.total = result.levelA.length + result.levelB.length + result.levelC.length;

  return result;
};

// Get flat list of all team members with their levels
export const getAllTeamMembersWithLevel = (team: MultiLevelTeam): TeamMember[] => {
  const members: TeamMember[] = [];

  team.levelA.forEach(member => {
    members.push({ ...member, level: 'A' });
  });

  team.levelB.forEach(member => {
    members.push({ ...member, level: 'B' });
  });

  team.levelC.forEach(member => {
    members.push({ ...member, level: 'C' });
  });

  return members;
};
