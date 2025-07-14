'use client';

import { useState, useRef, useEffect } from 'react';
import { FiEdit, FiX } from 'react-icons/fi';
import Image from 'next/image';
import imageCompression from 'browser-image-compression';

interface ProfilePicModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (file: File) => void;
  currentImageUrl: string | null;
}

const compressionOptions = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1080,
  useWebWorker: true,
};

export default function ProfilePicModal({ isOpen, onClose, onSubmit, currentImageUrl }: ProfilePicModalProps) {
  // State untuk preview foto BARU yang dipilih user
  const [newImagePreview, setNewImagePreview] = useState<string | null>(null);
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset preview saat modal ditutup atau dibuka
  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        setNewImagePreview(null);
        setNewImageFile(null);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const compressedFile = await imageCompression(file, compressionOptions);
        setNewImagePreview(URL.createObjectURL(compressedFile));
        setNewImageFile(compressedFile);
      } catch (error) {
        console.error("Gagal memproses gambar:", error);
        alert("Gagal memproses gambar.");
      }
    }
  };

  const handleSubmit = () => {
    if (newImageFile) {
      onSubmit(newImageFile);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-sm flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-bold text-gray-800">Foto Profil</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><FiX size={24}/></button>
        </div>
        
        <div className="p-6 flex flex-col items-center gap-4">
          {/* Area Preview Foto */}
          <div className="w-48 h-48 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center border-4 border-gray-300">
            {/* Tampilkan foto BARU jika ada, jika tidak, tampilkan foto LAMA */}
            <Image
              // Gunakan preview baru jika ada, jika tidak, gunakan URL lama atau gambar default
              src={newImagePreview || currentImageUrl || '/avatar-default.png'}
              alt="Preview foto profil"
              width={192}
              height={192}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Tombol Aksi */}
          {!newImagePreview ? (
            // Tampilan Awal: Tombol Edit
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 text-blue-600 font-semibold py-2 px-4 rounded-lg hover:bg-blue-50"
            >
              <FiEdit />
              <span>Edit Foto</span>
            </button>
          ) : (
            // Tampilan Setelah Foto Baru Dipilih: Tombol Simpan
            <button
              onClick={handleSubmit}
              className="w-full bg-red-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-red-700"
            >
              Simpan Perubahan
            </button>
          )}
          <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
        </div>
      </div>
    </div>
  );
}