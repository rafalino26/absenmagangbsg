// Tipe untuk riwayat live feed (bisa kita hapus jika tidak dipakai lagi)
export interface LiveHistoryItem {
  id: number;
  name: string;
  type: 'Hadir' | 'Pulang' | 'Izin';
  title: string;
  description: string;
  isLate?: boolean;
  photoUrl?: string | null;
  location?: { lat: number; lon: number; } | null;
}

// Tipe untuk rekapitulasi data intern
export interface InternSummary {
  id: number;
  name: string;
  division: string;
  hadir: number;
  izin: number;
  absen: number;
  terlambat: number;
  totalUangMakan: number;
  bankAccount: { bank: string; number: string; } | null;
  joinDate: string; 
}

// TAMBAHKAN TIPE INI
export interface DailyLogItem { 
  date: string; 
  status: 'Hadir' | 'Hadir (Terlambat)' | 'Izin' | 'Tidak Hadir'; 
  description: string; 
  photoUrl?: string | null; 
}