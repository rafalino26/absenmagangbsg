'use client';

import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { FiX, FiPaperclip } from 'react-icons/fi';
import Image from 'next/image';

interface Activity {
  id: number;
  task: string;
}

interface ActivityLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => void;
  isSubmitting: boolean;
}

export default function ActivityLogModal({ isOpen, onClose, onSubmit, isSubmitting }: ActivityLogModalProps) {
  const [predefinedActivities, setPredefinedActivities] = useState<Activity[]>([]);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [otherActivity, setOtherActivity] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedActivities([]);
      setOtherActivity('');
      setPhotoFile(null);
      setPhotoPreview(null);

      const fetchActivities = async () => {
        try {
          const response = await fetch('/api/admin/activities');
          if (response.ok) {
            setPredefinedActivities(await response.json());
          }
        } catch (error) {
          console.error("Gagal memuat pilihan aktivitas", error);
        }
      };
      fetchActivities();
    }
  }, [isOpen]);

  const handleCheckboxChange = (task: string) => {
    setSelectedActivities(prev => 
      prev.includes(task) ? prev.filter(t => t !== task) : [...prev, task]
    );
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

 const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    // Tambahkan validasi di sini
    if (!photoFile) {
      alert("Foto bukti wajib diisi.");
      return;
    }

    const formData = new FormData();
    formData.append('activities', selectedActivities.join(', '));
    formData.append('otherActivity', otherActivity);
    formData.append('photo', photoFile); // Pastikan file ditambahkan
    
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-bold text-gray-800">Laporan Aktivitas Harian</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><FiX size={24}/></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <p className="text-sm text-gray-600">Pilih aktivitas yang sudah Anda lakukan hari ini:</p>
            <div className="space-y-2 max-h-40 overflow-y-auto pr-2 border rounded-md p-2">
              {predefinedActivities.map(activity => (
                <label key={activity.id} className="flex items-start gap-3 p-2 rounded-md hover:bg-gray-100 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedActivities.includes(activity.task)}
                    onChange={() => handleCheckboxChange(activity.task)}
                    className="h-5 w-5 mt-0.5 flex-shrink-0 rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                  <span className="text-gray-800 min-w-0 break-words">{activity.task}</span>
                </label>
              ))}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Lainnya (jika ada):</label>
              <textarea
                value={otherActivity}
                onChange={(e) => setOtherActivity(e.target.value)}
                rows={2}
                className="mt-1 block w-full border border-gray-300 text-black rounded-md shadow-sm p-2"
                placeholder="Jelaskan aktivitas lain..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Lampirkan Foto Bukti</label>
              {photoPreview && (
                <div className="mt-2 relative w-full h-48">
                  <Image src={photoPreview} alt="Preview" fill style={{ objectFit: 'contain' }} className="rounded-md" />
                </div>
              )}
              <div className="mt-2">
                <label htmlFor="photo-upload" className="cursor-pointer flex items-center gap-2 text-sm text-blue-600 font-semibold">
                  <FiPaperclip />
                  <span>{photoFile ? 'Ganti foto' : 'Pilih foto'}</span>
                </label>
                {/* 3. Hapus 'required' dari input */}
                <input id="photo-upload" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </div>
            </div>
          </div>
          <div className="mt-6">
            <button type="submit" disabled={isSubmitting} className="w-full bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 disabled:bg-gray-400">
              {isSubmitting ? 'Mengirim...' : 'Kirim Laporan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}