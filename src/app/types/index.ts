export interface UserProfile {
  name: string;
  division: string;
  periodStartDate?: string | null;
  periodEndDate?: string | null;
  profilePicUrl?: string;
  bankName?: string;
  accountNumber?: string;
  phoneNumber?: string | null;
}

export interface AttendanceRecord {
  id: number;
  type: 'Hadir' | 'Pulang' | 'Izin';
  title: string;
  date: string;
  description: string;
  status?: string;   
  name?: string;     
  isLate?: boolean;
  lat?: number;
  lon?: number;
  photoUrl?: string | null;
}

export interface InternSummary {
  id: number;
  internCode: string | null;
  name: string;
  division: string;
  periodStartDate: string | null; 
  periodEndDate: string | null;
  hadir: number;
  izin: number;
  absen: number;
  terlambat: number;
  totalUangMakan: number;
  bankAccount: { bank: string; number: string; } | null;
  joinDate: string; 
  phoneNumber?: string | null;
  absenDates: string;
}

export type NotificationType = 'success' | 'error' | 'confirm';
export interface NotificationState {
  isOpen: boolean;
  title: string;
  message: string;
  type: NotificationType;
  onConfirm?: () => void;
}