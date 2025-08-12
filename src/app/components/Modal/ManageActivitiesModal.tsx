// app/components/Modal/ManageActivitiesModal.tsx
'use client';

import { useState, useEffect, useCallback, FormEvent } from 'react';
import { FiPlus, FiTrash2, FiX } from 'react-icons/fi';
import { NotificationState } from '@/app/types';

interface Activity {
  id: number;
  task: string;
}

interface ManageActivitiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  setNotification: (notification: NotificationState | null) => void;
}

export default function ManageActivitiesModal({ isOpen, onClose, setNotification }: ManageActivitiesModalProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newTask, setNewTask] = useState('');

  const fetchActivities = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/activities');
      if (!response.ok) throw new Error('Gagal memuat aktivitas.');
      setActivities(await response.json());
    } catch (error: any) {
      setNotification({ isOpen: true, title: 'Error', message: error.message, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, [setNotification]);

  useEffect(() => {
    if (isOpen) {
      fetchActivities();
    }
  }, [isOpen, fetchActivities]);

  const handleAddTask = async (e: FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    try {
      const response = await fetch('/api/admin/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task: newTask }),
      });
      if (!response.ok) throw new Error('Gagal menambah aktivitas.');
      setNewTask('');
      fetchActivities();
    } catch (error: any) {
      setNotification({ isOpen: true, title: 'Gagal', message: error.message, type: 'error' });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Anda yakin ingin menghapus aktivitas ini?')) return;
    try {
      const response = await fetch(`/api/admin/activities/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Gagal menghapus aktivitas.');
      fetchActivities();
    } catch (error: any) {
      setNotification({ isOpen: true, title: 'Gagal', message: error.message, type: 'error' });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-bold text-gray-800">Atur Pilihan Aktivitas</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><FiX size={24}/></button>
        </div>
        <div className="p-6">
          <form onSubmit={handleAddTask} className="flex items-center gap-2 mb-4 text-black">
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="Ketik aktivitas baru..."
              className="flex-grow p-2 border border-gray-300 rounded-md"
            />
            <button type="submit" className="bg-red-600 text-white p-2 rounded-md hover:bg-red-700"><FiPlus size={20} /></button>
          </form>
          <div className="max-h-80 overflow-y-auto border rounded-md">
            <ul className="divide-y">
              {isLoading ? <li className="p-4 text-center">Memuat...</li> :
                activities.map(activity => (
                  <li key={activity.id} className="p-3 flex justify-between items-center hover:bg-gray-50">
                    <span className="text-gray-800">{activity.task}</span>
                    <button onClick={() => handleDelete(activity.id)} className="text-red-500 hover:text-red-700">
                      <FiTrash2 />
                    </button>
                  </li>
                ))
              }
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}