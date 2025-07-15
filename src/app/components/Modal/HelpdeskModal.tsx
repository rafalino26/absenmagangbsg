'use client';

import { useState, useRef } from 'react';
import { FiPaperclip, FiTrash2, FiX } from 'react-icons/fi';
import imageCompression from 'browser-image-compression';

interface SubmitData {
  description: string;
  attachment: File | null;
}

interface HelpdeskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SubmitData) => void;
}

const compressionOptions = { maxSizeMB: 1, maxWidthOrHeight: 1080, useWebWorker: true };

export default function HelpdeskModal({ isOpen, onClose, onSubmit }: HelpdeskModalProps) {
  const [description, setDescription] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const compressedFile = await imageCompression(file, compressionOptions);
        setAttachment(compressedFile);
      } catch (error) { console.error("Gagal memproses lampiran:", error); }
    }
  };

  const handleSubmit = () => {
    if (description.trim()) {
      onSubmit({ description, attachment });
      setDescription('');
      setAttachment(null);
      onClose();
    } else {
      alert("Deskripsi laporan tidak boleh kosong.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-bold text-gray-800">Buat Laporan / Keluhan</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><FiX size={24}/></button>
        </div>
        <div className="p-6 flex-grow space-y-4">
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">Jelaskan masalah Anda <span className="text-red-500">*</span></label>
            <textarea
              id="description"
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 text-black border border-gray-300 rounded-md"
              placeholder="Tuliskan keluhan atau laporan Anda di sini..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Bukti Foto (Opsional)</label>
            {!attachment ? (
              <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-300 rounded-md text-gray-500 hover:border-blue-500">
                <FiPaperclip /><span>Upload Bukti</span>
              </button>
            ) : (
              <div className="flex items-center justify-between p-2 border rounded-md bg-gray-50">
                <span className="text-sm text-gray-700 truncate">{attachment.name}</span>
                <button onClick={() => setAttachment(null)} className="text-red-500 hover:text-red-700 ml-2"><FiTrash2 /></button>
              </div>
            )}
            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
          </div>
        </div>
        <div className="p-4 bg-gray-50 border-t flex justify-end">
          <button type="button" onClick={handleSubmit} disabled={!description.trim()} className="bg-red-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-700 disabled:bg-gray-400">Kirim Laporan</button>
        </div>
      </div>
    </div>
  );
}