'use client';

import { useState, useEffect, useCallback, FormEvent } from 'react';
import { FiPlus, FiTrash2, FiX } from 'react-icons/fi';
import { NotificationState } from '@/app/types';
import SpinnerOverlay from '../loading/SpinnerOverlay';

// Definisikan interface untuk University
interface University {
  id: number;
  name: string;
}

interface ManageUniversitiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  setNotification: (notification: NotificationState | null) => void;
  onUpdate: () => void; // Fungsi untuk refresh daftar di modal induk
}

export default function ManageUniversitiesModal({ isOpen, onClose, setNotification, onUpdate }: ManageUniversitiesModalProps) {
  const [universities, setUniversities] = useState<University[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newName, setNewName] = useState('');

  const fetchUniversities = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/universities');
      if (!response.ok) throw new Error('Gagal memuat daftar universitas.');
      setUniversities(await response.json());
    } catch (error: any) {
      setNotification({ isOpen: true, title: 'Error', message: error.message, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, [setNotification]);

  useEffect(() => {
    if (isOpen) {
      fetchUniversities();
    }
  }, [isOpen, fetchUniversities]);
  
  const handleAdd = async (e: FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/admin/universities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName }),
      });
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Gagal menambah universitas.');
      }
      setNewName('');
      await fetchUniversities(); // Refresh list di modal ini
      onUpdate(); // Beri tahu modal induk untuk refresh juga
    } catch (error: any) {
      setNotification({ isOpen: true, title: 'Gagal', message: error.message, type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Anda yakin ingin menghapus universitas ini? Pengguna yang terhubung akan kehilangan data universitasnya.')) return;
    
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/admin/universities/${id}`, { method: 'DELETE' });
       if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Gagal menghapus universitas.');
      }
      await fetchUniversities(); // Refresh list di modal ini
      onUpdate(); // Beri tahu modal induk untuk refresh juga
    } catch (error: any) {
      setNotification({ isOpen: true, title: 'Gagal', message: error.message, type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center p-4 z-50">
      {isSubmitting && <SpinnerOverlay />}
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-bold text-gray-800">Atur Universitas</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><FiX size={24}/></button>
        </div>
        <div className="p-6">
          <form onSubmit={handleAdd} className="flex gap-2 mb-4">
            <input 
              type="text" 
              value={newName} 
              onChange={(e) => setNewName(e.target.value)} 
              placeholder="Nama universitas baru..." 
              className="flex-grow p-2 border border-gray-300 rounded-md text-black" 
            />
            <button 
              type="submit" 
              className="bg-red-600 text-white p-2 rounded-md hover:bg-red-700 disabled:bg-gray-400"
              disabled={!newName.trim()}
            >
              <FiPlus size={20} />
            </button>
          </form>
          <div className="max-h-64 overflow-y-auto border rounded-md">
            {isLoading ? (
              <p className="p-4 text-center text-gray-500">Memuat...</p>
            ) : (
              <ul className="divide-y divide-gray-200">
                {universities.length > 0 ? universities.map(uni => (
                  <li key={uni.id} className="p-3 flex justify-between items-center hover:bg-gray-50">
                    <span className="text-gray-800">{uni.name}</span>
                    <button onClick={() => handleDelete(uni.id)} className="text-red-500 hover:text-red-700" title="Hapus">
                      <FiTrash2 />
                    </button>
                  </li>
                )) : (
                  <li className="p-4 text-center text-gray-500">Belum ada data.</li>
                )}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}