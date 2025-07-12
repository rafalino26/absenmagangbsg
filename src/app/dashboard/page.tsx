'use client';

import { useState, useEffect, useCallback } from 'react';
import { FiClock, FiEdit3, FiLogOut, FiX, FiCamera, FiEdit, FiCreditCard } from 'react-icons/fi';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import AttendanceModal from '../components/Modal/AttendanceModal';
import LeaveRequestModal from '../components/Modal/LeaveRequestModal';
import ProfilePicModal from '../components/Modal/ProfilePicModal';
import HadirButton from '../components/Button/HadirButton';
import PulangButton from '../components/Button/PulangButton';
import LeaveRequestButton from '../components/Button/IzinButton';
import BankAccountModal from '../components/Modal/BankAccountModal';

interface HistoryItem {
  id: number;
  type: 'Hadir' | 'Pulang' | 'Izin';
  title: string;
  date: string;
  description: string;
  lat?: number; 
  lon?: number; 
  photoUrl?: string;
}

interface UserProfile {
  name: string;
  division: string;
  internshipPeriod: string;
  // Nanti kita akan tambahkan profilePicUrl dan bankAccount di sini
}

interface LocationState {
  latitude: number;
  longitude: number;
}

const LocationMap = dynamic(() => import('../components/Modal/LocationMap'), {
  ssr: false, 
});

const isLate = (timeString: string): boolean => {
  try {
    const timePart = timeString.split(' ')[0];
    const [hour, minute] = timePart.split(':').map(Number);

    if (hour > 8) {
      return true;
    }
    if (hour === 8 && minute > 0) {
      return true;
    }
    
    return false;
  } catch (error) {
    console.error("Gagal mem-parsing waktu:", timeString, error);
    return false; 
  }
};

export default function DashboardPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [hasClockedIn, setHasClockedIn] = useState(false);
  const [hasClockedOut, setHasClockedOut] = useState(false); 
  const [loading, setLoading] = useState(false); 
  const [error, setError] = useState<string | null>(null);
  const [isMapModalOpen, setMapModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<[number, number] | null>(null);
  const [isAttendanceModalOpen, setAttendanceModalOpen] = useState(false);
  const [attendanceType, setAttendanceType] = useState<'Hadir' | 'Pulang'>('Hadir');
  const [isLeaveModalOpen, setLeaveModalOpen] = useState(false);
  const [profilePic, setProfilePic] = useState('/ridel.jpg'); 
  const [isProfileModalOpen, setProfileModalOpen] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [bankAccount, setBankAccount] = useState<{ bank: string; number: string } | null>(null);
  const [isBankAccountModalOpen, setBankAccountModalOpen] = useState(false);

    useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoadingUser(true);
      try {
        // Ambil data user
        const userResponse = await fetch('/api/users/me');
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUser(userData);
        } else {
          console.error("Gagal mengambil data user");
          // Di sini bisa ditambahkan logika redirect ke login jika user tidak terautentikasi
        }

        // Ambil data riwayat
        const historyResponse = await fetch('/api/attendances/history');
        if (historyResponse.ok) {
          const historyData = await historyResponse.json();
          setHistory(historyData);
        }

      } catch (error) {
        console.error("Error mengambil data awal:", error);
      } finally {
        setIsLoadingUser(false);
      }
    };

    fetchInitialData();
  }, []);

  const fetchHistory = useCallback(async () => {
    // Kita tidak perlu setLoading di sini agar tidak mengganggu UI utama
    try {
      const response = await fetch('/api/attendances/history');
      if (response.ok) {
        const data = await response.json();
        setHistory(data);
      } else {
        console.error("Gagal mengambil riwayat absensi");
      }
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  }, []);

    useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  useEffect(() => {
    const checkTodaysAttendance = () => {
      const todayString = new Date().toLocaleDateString('id-ID', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
      });

      const clockedInToday = history.some(item => item.type === 'Hadir' && item.date === todayString);
      if (clockedInToday) {
        setHasClockedIn(true);
      }

      const clockedOutToday = history.some(item => item.type === 'Pulang' && item.date === todayString);
      if (clockedOutToday) {
        setHasClockedOut(true);
      }
    };

    checkTodaysAttendance();
  }, [history]);

    const openAttendanceModal = (type: 'Hadir' | 'Pulang') => {
    setAttendanceType(type);
    setAttendanceModalOpen(true);
  };

 const handleConfirmAttendance = async (photoFile: File) => {
  setAttendanceModalOpen(false);
  setLoading(true);
  setError(null);

  try {
    // 1. Minta lokasi dengan akurasi tinggi
    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
      const options = {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      };
      navigator.geolocation.getCurrentPosition(resolve, reject, options);
    });

    const { latitude, longitude, accuracy } = position.coords;

    // 2. Validasi akurasi
    if (accuracy > 50) {
      setError(`Akurasi lokasi terlalu rendah (${accuracy.toFixed(0)}m).`);
      setLoading(false);
      return;
    }

    // 3. Siapkan data untuk dikirim
    const now = new Date();
    const clockInTime = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const isLate = now.getHours() > 8 || (now.getHours() === 8 && now.getMinutes() > 0);

    const formData = new FormData();
    formData.append('photo', photoFile);
    formData.append('type', attendanceType);
    formData.append('latitude', String(latitude));
    formData.append('longitude', String(longitude));
    formData.append('description', `${clockInTime} WITA`);
    formData.append('isLate', String(isLate));
    
    // 4. Kirim data ke API backend
    const response = await fetch('/api/attendances', {
      method: 'POST',
      body: formData, // Kirim sebagai FormData, bukan JSON
    });

    if (response.ok) {
      alert(`Berhasil Absen ${attendanceType}!`);
      fetchHistory()
    } else {
      const errorData = await response.json();
      setError(errorData.error || `Gagal melakukan absen ${attendanceType}.`);
    }

  } catch (err: any) {
    let message = "Gagal mendapatkan lokasi.";
    if (err.code === 1) message = "Anda menolak izin lokasi.";
    if (err.code === 3) message = "Waktu permintaan lokasi habis.";
    setError(message);
  } finally {
    setLoading(false);
  }
};

  const handleLeaveRequest = () => {
    setLeaveModalOpen(true);
  };

const handleConfirmLeave = ({ reason, attachment }: { reason: string, attachment: File | null }) => {
  const now = new Date();
  
  let photoUrl: string | undefined = undefined;
  if (attachment) {
    console.log("Uploading attachment:", attachment.name);
    photoUrl = URL.createObjectURL(attachment);
  }

  const newHistoryItem: HistoryItem = {
    id: now.getTime(),
    type: 'Izin',
    title: 'Pengajuan Izin',
    date: now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
    description: reason,
    photoUrl: photoUrl,
  };

  setHistory(prevHistory => [newHistoryItem, ...prevHistory]);
  alert("Pengajuan izin berhasil dicatat.");
};

  const handleViewMap = (lat: number, lon: number) => {
    setSelectedLocation([lat, lon]);
    setMapModalOpen(true);
  };

  const handleProfilePicSubmit = (newPhotoFile: File) => {
    const newPhotoUrl = URL.createObjectURL(newPhotoFile);
    setProfilePic(newPhotoUrl);
    
    console.log("Foto profil akan diupdate dengan file:", newPhotoFile.name);
    alert("Foto profil berhasil diperbarui!");
    setProfileModalOpen(false);
  };

  const handleBankAccountSubmit = (data: { bank: string; number: string }) => {
    setBankAccount(data);
    alert('Informasi rekening berhasil disimpan!');
    // Nanti di sini kita akan kirim data ke backend untuk disimpan permanen
  };

    if (isLoadingUser) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-lg text-gray-500">Memuat data dashboard...</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-gray-50 min-h-screen">
        <header className="bg-red-600 shadow-sm">
          <div className="max-w-7xl px-4 sm:px-6 lg:px-8 py-2">
            <div className="flex items-center gap-2">
              <div className="flex-shrink-0">
                <div className="w-[50px] aspect-square rounded-full overflow-hidden shadow-lg">
                  <Image src="/logobsg.jpg" width={800} height={500} alt="Logo" className="w-full h-full object-cover"/>
                </div>
              </div>
              <div><h1 className="text-xl font-bold text-white">Absen Magang</h1></div>
            </div>
          </div>
        </header>
        <main className="p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-4 md:gap-6 mb-8">
              <div className="flex-shrink-0">
                <button 
                  onClick={() => setProfileModalOpen(true)}
                  className="relative group"
                  aria-label="Ganti foto profil"
                >
                  <Image
                    src={profilePic}
                    alt="Foto profil"
                    width={80}
                    height={80}
                    className="w-24 h-24 md:w-24 md:h-24 rounded-full object-cover shadow-md"
                  />
                  <div className="absolute inset-0 rounded-full transition-all flex items-center justify-center">
                    <FiCamera className="text-white opacity-0 group-hover:opacity-100 transition-opacity" size={24} />
                  </div>
                </button>
              </div>
              <div className="flex-grow pt-2">
              <h1 className="text-lg md:text-3xl font-bold text-gray-900">Halo, {user?.name}!</h1>
              <p className="mt-1 text-sm md:text-base text-gray-600">{user?.division} | Periode: {user?.internshipPeriod}</p>              
              <div className="mt-2 flex items-center gap-2">
                <p className="text-xs md:text-sm text-gray-600">
                  No. Rekening: 
                  {bankAccount ? (
                    <span className="font-semibold text-gray-800 ml-1">{bankAccount.bank} - {bankAccount.number}</span>
                  ) : (
                    <span className="text-red-500 ml-1">Silakan masukkan rekening Anda</span>
                  )}
                </p>
                <button
                  onClick={() => setBankAccountModalOpen(true)}
                  className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full"
                  aria-label="Edit Informasi Rekening"
                >
                  <FiEdit size={16} />
                </button>
              </div>
              <div className="mt-2 text-sm min-h-[20px]">
                {loading && <p className="text-blue-600">Memproses...</p>}
                {error && <p className="text-red-600 font-semibold">Error: {error}</p>}
              </div>
            </div>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <HadirButton
                onClick={() => openAttendanceModal('Hadir')}
                hasClockedIn={hasClockedIn}
                loading={loading}
              />
               <PulangButton
                onClick={() => openAttendanceModal('Pulang')}
                hasClockedIn={hasClockedIn}
                hasClockedOut={hasClockedOut}
                loading={loading}
              />
              <LeaveRequestButton
                onClick={handleLeaveRequest}
                loading={loading}
              />
            </div>
            <div className="mt-10">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Riwayat Absensi Terkini</h2>
              <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
                <ul className="divide-y divide-gray-200">
                  {history.length === 0 ? (
                    <li className="p-4 text-center text-gray-500">Belum ada riwayat absensi.</li>
                  ) : (
                    history.map((item) => (
                      <li key={item.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                        <div className="flex items-center gap-4">
                            <span className={`flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full text-white 
                              ${item.type === 'Hadir' ? 'bg-green-500' : item.type === 'Pulang' ? 'bg-orange-500' : 'bg-blue-500'}`}>
                                {item.type === 'Hadir' && <FiClock size={20}/>}
                                {item.type === 'Pulang' && <FiLogOut size={20}/>}
                                {item.type === 'Izin' && <FiEdit3 size={20}/>}
                            </span>
                            <div>
                                <p className="font-semibold text-gray-800">{item.title}</p>
                                <p className="text-sm text-gray-600">{item.date}</p>
                                 {item.type === 'Hadir' && isLate(item.description) ? (
                                  <p className="text-sm text-red-600 font-bold">{item.description} (Terlambat)</p>
                                ) : (
                                  <p className="text-sm text-gray-500">{item.description}</p>
                                )}
                            </div>
                        </div>
                        {/* Ganti bagian ini di dalam .map() riwayat absensi */}
                      {item.lat && item.lon && (
                        <div className="flex flex-col items-center gap-1">
                          <button 
                            onClick={() => handleViewMap(item.lat!, item.lon!)} 
                            className="text-sm bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
                          >
                            Lihat Peta
                          </button>
                          <p className="text-xs text-gray-400">
                            {/* Tampilkan koordinat dengan 4 angka di belakang koma */}
                            {item.lat.toFixed(4)}, {item.lon.toFixed(4)}
                          </p>
                        </div>
                      )}
                   </li>
                    ))
                  )}
                </ul>
              </div>
            </div>
          </div>
        </main>
      </div>
      <AttendanceModal
        isOpen={isAttendanceModalOpen}
        onClose={() => setAttendanceModalOpen(false)}
        onSubmit={handleConfirmAttendance}
        attendanceType={attendanceType}
      />
      <LeaveRequestModal 
       isOpen={isLeaveModalOpen} 
       onClose={() => setLeaveModalOpen(false)} 
       onSubmit={handleConfirmLeave} 
      />
       <ProfilePicModal
        isOpen={isProfileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        onSubmit={handleProfilePicSubmit}
        currentImageUrl={profilePic}
      />
      <BankAccountModal
        isOpen={isBankAccountModalOpen}
        onClose={() => setBankAccountModalOpen(false)}
        onSubmit={handleBankAccountSubmit}
        currentAccount={bankAccount}
      />
      {isMapModalOpen && selectedLocation && (
        <div className="fixed inset-0 backdrop-blur flex justify-center items-center p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl h-full max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg text-black font-bold">Peta Lokasi Absen</h3>
              <button onClick={() => setMapModalOpen(false)} className="text-gray-500 hover:text-gray-800"><FiX size={24}/></button>
            </div>
            <div className="flex-grow p-1"><LocationMap position={selectedLocation}/></div>
          </div>
        </div>
      )}
    </>
  );
}