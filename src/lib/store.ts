// Demo data store using localStorage

export interface User {
  id: string;
  email: string;
  name: string;
  vipLevel: number;
  balance: number;
  referralCode: string;
  referredBy: string | null;
  totalIncome: number;
  totalRecharge: number;
  totalInvest: number;
  totalWithdraw: number;
  totalRabat: number;
  teamIncome: number;
  createdAt: string;
  isAdmin: boolean;
}

export interface Investment {
  id: string;
  userId: string;
  productId: number;
  productName: string;
  amount: number;
  dailyIncome: number;
  validity: number;
  daysRemaining: number;
  totalEarned: number;
  status: 'active' | 'completed';
  createdAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'recharge' | 'withdraw' | 'invest' | 'income' | 'commission';
  amount: number;
  status: 'pending' | 'success' | 'rejected';
  date: string;
  description?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  vipLevel: number;
  totalEarnings: number;
  status: 'active' | 'pending';
  joinedAt: string;
}

// Generate unique referral code
export const generateReferralCode = (): string => {
  return 'REF' + Math.random().toString(36).substring(2, 8).toUpperCase();
};

// Generate unique ID
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// Get current user
export const getCurrentUser = (): User | null => {
  const stored = localStorage.getItem('demoUser');
  return stored ? JSON.parse(stored) : null;
};

// Save user
export const saveUser = (user: User): void => {
  localStorage.setItem('demoUser', JSON.stringify(user));
};

// Get all users (for admin)
export const getAllUsers = (): User[] => {
  const stored = localStorage.getItem('allUsers');
  return stored ? JSON.parse(stored) : [];
};

// Save all users
export const saveAllUsers = (users: User[]): void => {
  localStorage.setItem('allUsers', JSON.stringify(users));
};

// Register new user
export const registerUser = (name: string, email: string, password: string, referredBy?: string): User => {
  const allUsers = getAllUsers();
  
  const newUser: User = {
    id: generateId(),
    email,
    name,
    vipLevel: 1,
    balance: 0,
    referralCode: generateReferralCode(),
    referredBy: referredBy || null,
    totalIncome: 0,
    totalRecharge: 0,
    totalInvest: 0,
    totalWithdraw: 0,
    totalRabat: 0,
    teamIncome: 0,
    createdAt: new Date().toISOString(),
    isAdmin: allUsers.length === 0, // First user is admin
  };

  allUsers.push(newUser);
  saveAllUsers(allUsers);
  saveUser(newUser);

  // Update referrer if exists
  if (referredBy) {
    const referrer = allUsers.find(u => u.referralCode === referredBy);
    if (referrer) {
      const teamMembers = getTeamMembers(referrer.id);
      teamMembers.push({
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        vipLevel: newUser.vipLevel,
        totalEarnings: 0,
        status: 'active',
        joinedAt: newUser.createdAt,
      });
      saveTeamMembers(referrer.id, teamMembers);
      
      // Update VIP level based on referrals
      updateVipLevel(referrer.id);
    }
  }

  return newUser;
};

// Login user
export const loginUser = (email: string, password: string): User | null => {
  const allUsers = getAllUsers();
  const user = allUsers.find(u => u.email === email);
  if (user) {
    saveUser(user);
    return user;
  }
  return null;
};

// Update user balance and stats
export const updateUser = (updates: Partial<User>): User | null => {
  const user = getCurrentUser();
  if (!user) return null;

  const updatedUser = { ...user, ...updates };
  saveUser(updatedUser);

  // Update in allUsers too
  const allUsers = getAllUsers();
  const idx = allUsers.findIndex(u => u.id === user.id);
  if (idx !== -1) {
    allUsers[idx] = updatedUser;
    saveAllUsers(allUsers);
  }

  return updatedUser;
};

// Get user investments
export const getInvestments = (userId: string): Investment[] => {
  const stored = localStorage.getItem(`investments_${userId}`);
  return stored ? JSON.parse(stored) : [];
};

// Save investments
export const saveInvestments = (userId: string, investments: Investment[]): void => {
  localStorage.setItem(`investments_${userId}`, JSON.stringify(investments));
};

// Add investment
export const addInvestment = (investment: Omit<Investment, 'id' | 'createdAt'>): Investment => {
  const user = getCurrentUser();
  if (!user) throw new Error('User not found');

  const newInvestment: Investment = {
    ...investment,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };

  const investments = getInvestments(user.id);
  investments.push(newInvestment);
  saveInvestments(user.id, investments);

  return newInvestment;
};

// Get transactions
export const getTransactions = (userId: string): Transaction[] => {
  const stored = localStorage.getItem(`transactions_${userId}`);
  return stored ? JSON.parse(stored) : [];
};

// Save transactions
export const saveTransactions = (userId: string, transactions: Transaction[]): void => {
  localStorage.setItem(`transactions_${userId}`, JSON.stringify(transactions));
};

// Add transaction
export const addTransaction = (transaction: Omit<Transaction, 'id' | 'date'>): Transaction => {
  const user = getCurrentUser();
  if (!user) throw new Error('User not found');

  const newTransaction: Transaction = {
    ...transaction,
    id: generateId(),
    date: new Date().toISOString(),
  };

  const transactions = getTransactions(user.id);
  transactions.unshift(newTransaction);
  saveTransactions(user.id, transactions);

  return newTransaction;
};

// Get team members
export const getTeamMembers = (userId: string): TeamMember[] => {
  const stored = localStorage.getItem(`team_${userId}`);
  return stored ? JSON.parse(stored) : [];
};

// Save team members
export const saveTeamMembers = (userId: string, members: TeamMember[]): void => {
  localStorage.setItem(`team_${userId}`, JSON.stringify(members));
};

// Update VIP level based on referrals
export const updateVipLevel = (userId: string): void => {
  const allUsers = getAllUsers();
  const userIdx = allUsers.findIndex(u => u.id === userId);
  if (userIdx === -1) return;

  const teamMembers = getTeamMembers(userId);
  const count = teamMembers.length;

  let newVipLevel = 1;
  if (count >= 50) newVipLevel = 5;
  else if (count >= 30) newVipLevel = 4;
  else if (count >= 15) newVipLevel = 3;
  else if (count >= 5) newVipLevel = 2;

  allUsers[userIdx].vipLevel = newVipLevel;
  saveAllUsers(allUsers);

  const currentUser = getCurrentUser();
  if (currentUser && currentUser.id === userId) {
    saveUser({ ...currentUser, vipLevel: newVipLevel });
  }
};

// Get pending transactions (for admin)
export const getAllPendingTransactions = (): (Transaction & { userName: string; userEmail: string })[] => {
  const allUsers = getAllUsers();
  const pending: (Transaction & { userName: string; userEmail: string })[] = [];

  allUsers.forEach(user => {
    const transactions = getTransactions(user.id);
    transactions.forEach(t => {
      if (t.status === 'pending') {
        pending.push({ ...t, userName: user.name, userEmail: user.email });
      }
    });
  });

  return pending.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

// Approve/reject transaction (admin)
export const updateTransactionStatus = (userId: string, transactionId: string, status: 'success' | 'rejected'): void => {
  const transactions = getTransactions(userId);
  const txIdx = transactions.findIndex(t => t.id === transactionId);
  if (txIdx === -1) return;

  const tx = transactions[txIdx];
  tx.status = status;
  saveTransactions(userId, transactions);

  if (status === 'success') {
    const allUsers = getAllUsers();
    const userIdx = allUsers.findIndex(u => u.id === userId);
    if (userIdx !== -1) {
      const user = allUsers[userIdx];
      if (tx.type === 'recharge') {
        user.balance += tx.amount;
        user.totalRecharge += tx.amount;
      } else if (tx.type === 'withdraw') {
        user.totalWithdraw += tx.amount;
      }
      allUsers[userIdx] = user;
      saveAllUsers(allUsers);

      const currentUser = getCurrentUser();
      if (currentUser && currentUser.id === userId) {
        saveUser(user);
      }
    }
  } else if (status === 'rejected' && tx.type === 'withdraw') {
    // Refund balance if withdraw is rejected
    const allUsers = getAllUsers();
    const userIdx = allUsers.findIndex(u => u.id === userId);
    if (userIdx !== -1) {
      allUsers[userIdx].balance += tx.amount;
      saveAllUsers(allUsers);

      const currentUser = getCurrentUser();
      if (currentUser && currentUser.id === userId) {
        saveUser(allUsers[userIdx]);
      }
    }
  }
};

// Get all products
export const getAllProducts = () => [
  { id: 1, name: "Paket Investasi Starter", price: 150000, dailyIncome: 15000, validity: 20, totalIncome: 300000, vipLevel: 1 },
  { id: 2, name: "Paket Investasi Basic", price: 300000, dailyIncome: 33000, validity: 20, totalIncome: 660000, vipLevel: 1 },
  { id: 3, name: "Paket Investasi Pro", price: 500000, dailyIncome: 55000, validity: 20, totalIncome: 1100000, vipLevel: 1 },
  { id: 4, name: "Paket Premium A", price: 1000000, dailyIncome: 115000, validity: 20, totalIncome: 2300000, vipLevel: 2 },
  { id: 5, name: "Paket Premium B", price: 2000000, dailyIncome: 240000, validity: 20, totalIncome: 4800000, vipLevel: 2 },
  { id: 6, name: "Paket Elite Gold", price: 5000000, dailyIncome: 625000, validity: 20, totalIncome: 12500000, vipLevel: 3 },
  { id: 7, name: "Paket Elite Platinum", price: 10000000, dailyIncome: 1300000, validity: 20, totalIncome: 26000000, vipLevel: 3 },
  { id: 8, name: "Paket Diamond", price: 25000000, dailyIncome: 3500000, validity: 20, totalIncome: 70000000, vipLevel: 4 },
  { id: 9, name: "Paket Diamond Plus", price: 50000000, dailyIncome: 7500000, validity: 20, totalIncome: 150000000, vipLevel: 4 },
  { id: 10, name: "Paket Ultimate", price: 100000000, dailyIncome: 16000000, validity: 20, totalIncome: 320000000, vipLevel: 5 },
];

// Format currency
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};
