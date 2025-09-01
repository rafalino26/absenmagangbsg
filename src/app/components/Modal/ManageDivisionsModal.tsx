'use client';

import { useState, useEffect, useCallback, FormEvent } from 'react';
import { FiPlus, FiTrash2, FiX } from 'react-icons/fi';
import { NotificationState } from '@/app/types';
import SpinnerOverlay from '../loading/SpinnerOverlay';

interface Division {
  id: number;
  name: string;
}

interface ManageDivisionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  setNotification: (notification: NotificationState | null) => void;
  onUpdate: () => void; // Fungsi untuk refresh daftar divisi di modal induk
}

export default function ManageDivisionsModal({ isOpen, onClose, setNotification, onUpdate }: ManageDivisionsModalProps) {
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newName, setNewName] = useState('');

  const fetchDivisions = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/divisions');
      if (!response.ok) throw new Error('Gagal memuat daftar divisi.');
      setDivisions(await response.json());
    } catch (error: any) {
      setNotification({ isOpen: true, title: 'Error', message: error.message, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, [setNotification]);

  useEffect(() => {
    if (isOpen) {
      fetchDivisions();
    }
  }, [isOpen, fetchDivisions]);
  
  const handleAdd = async (e: FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/admin/divisions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName }),
      });
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Gagal menambah divisi.');
      }
      setNewName('');
      await fetchDivisions(); // Refresh
      onUpdate(); // Beri tahu modal induk untuk refresh juga
    } catch (error: any) {
      setNotification({ isOpen: true, title: 'Gagal', message: error.message, type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    // Ganti confirm bawaan dengan modal konfirmasi jika Anda punya
    if (!confirm('Anda yakin ingin menghapus divisi ini? Pengguna yang terhubung akan kehilangan divisinya.')) return;
    
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/admin/divisions/${id}`, { method: 'DELETE' });
       if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Gagal menghapus divisi.');
      }
      await fetchDivisions(); // Refresh
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
          <h3 className="text-lg font-bold text-gray-800">Atur Divisi / Instansi</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><FiX size={24}/></button>
        </div>
        <div className="p-6">
          <form onSubmit={handleAdd} className="flex gap-2 mb-4">
            <input 
              type="text" 
              value={newName} 
              onChange={(e) => setNewName(e.target.value)} 
              placeholder="Nama divisi atau instansi baru..." 
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
                {divisions.length > 0 ? divisions.map(div => (
                  <li key={div.id} className="p-3 flex justify-between items-center hover:bg-gray-50">
                    <span className="text-gray-800">{div.name}</span>
                    <button onClick={() => handleDelete(div.id)} className="text-red-500 hover:text-red-700" title="Hapus">
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