// Tipe untuk data profil user
export interface UserProfile {
  name: string;
  division: string;
  internshipPeriod: string;
  profilePicUrl?: string;
  bankName?: string;
  accountNumber?: string;
}

// SATU-SATUNYA TIPE DATA UNTUK SEMUA JENIS RIWAYAT ABSENSI
export interface AttendanceRecord {
  id: number;
  type: 'Hadir' | 'Pulang' | 'Izin';
  title: string;
  date: string;
  description: string; // Bisa berisi jam atau alasan izin
  status?: string;    // Untuk 'Hadir (Terlambat)'
  
  // Properti di bawah ini bersifat opsional
  name?: string;      // Untuk tampilan di admin
  isLate?: boolean;
  lat?: number;
  lon?: number;
  photoUrl?: string | null;
}

// Tipe untuk rekapitulasi data intern
export interface InternSummary {
  id: number;
  name: string;
  division: string;
  internshipPeriod: string;
  hadir: number;
  izin: number;
  absen: number;
  terlambat: number;
  totalUangMakan: number;
  bankAccount: { bank: string; number: string; } | null;
  joinDate: string; 
}

export type NotificationType = 'success' | 'error' | 'confirm';
export interface NotificationState {
  isOpen: boolean;
  title: string;
  message: string;
  type: NotificationType;
  onConfirm?: () => void;
}