export interface Group {
  id: number;
  name: string;
  created_at: string;
  memberCount?: number;
  totalCollected?: number;
}

export interface Member {
  id: number;
  group_id: number;
  name: string;
  monthly_amount: number;
  avatar?: string;
  address?: string;
  whatsapp?: string;
  start_date: string; // YYYY-MM
  code: string;
  groupName?: string;
}

export interface Payment {
  id: number;
  member_id: number;
  month: number;
  year: number;
  amount: number;
  method: string;
  date: string;
  notes?: string;
}

export interface DashboardStats {
  totalCollected: number;
  totalMembers: number;
  activeGroups: number;
  totalOverdue: number;
  totalAccrued: number;
  monthlyTrend: { year: number; month: number; amount: number }[];
}
