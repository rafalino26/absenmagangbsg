// src/app/components/Modal/ActivityLogModal.tsx
'use client';

import { useState, useEffect, FormEvent } from 'react';
import { FiX } from 'react-icons/fi';

interface Activity {
  id: number;
  task: string;
}

interface ActivityLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { activities: string[], otherActivity: string }) => void;
  isSubmitting: boolean;
}

export default function ActivityLogModal({ isOpen, onClose, onSubmit, isSubmitting }: ActivityLogModalProps) {
  const [predefinedActivities, setPredefinedActivities] = useState<Activity[]>([]);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [otherActivity, setOtherActivity] = useState('');

  // Ambil daftar pilihan aktivitas dari API
  useEffect(() => {
    if (isOpen) {
      const fetchActivities = async () => {
        const response = await fetch('/api/admin/activities');
        if (response.ok) {
          setPredefinedActivities(await response.json());
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

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit({ activities: selectedActivities, otherActivity });
    // Reset state setelah submit
    setSelectedActivities([]);
    setOtherActivity('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-bold text-gray-800">Laporan Aktivitas Harian</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><FiX size={24}/></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 text-black">
          <div className="space-y-4">
            <p className="text-sm text-gray-600">Pilih aktivitas yang sudah Anda lakukan hari ini:</p>
            <div className="space-y-2 max-h-48 overflow-y-auto overflow-x-hidden pr-2">
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
                rows={3}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                placeholder="Jelaskan aktivitas lain yang Anda kerjakan..."
              />
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