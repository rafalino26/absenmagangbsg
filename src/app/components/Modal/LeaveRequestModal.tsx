'use client';

import { useState, useRef } from 'react';
import { FiPaperclip, FiTrash2, FiX } from 'react-icons/fi';
import imageCompression from 'browser-image-compression';

interface SubmitData {
  reason: string;
  attachment: File | null;
}

interface LeaveRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SubmitData) => void;
}

const compressionOptions = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1080,
  useWebWorker: true,
};

export default function LeaveRequestModal({ isOpen, onClose, onSubmit }: LeaveRequestModalProps) {
  const [reason, setReason] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const compressedFile = await imageCompression(file, compressionOptions);
        setAttachment(compressedFile);
      } catch (error) {
        console.error("Gagal memproses lampiran:", error);
        alert("Gagal memproses lampiran.");
      }
    }
  };

  const handleSubmit = () => {
    // 1. Perbarui validasi, pastikan alasan dan lampiran ada
    if (reason.trim() && attachment) {
      onSubmit({ reason, attachment });
      setReason('');
      setAttachment(null);
      onClose();
    } else {
      alert("Alasan dan bukti lampiran wajib diisi.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-bold text-gray-800">Formulir Pengajuan Izin</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><FiX size={24}/></button>
        </div>
        
        <div className="p-6 flex-grow space-y-4">
          <div>
            {/* 3. (Opsional) Tambah tanda bintang untuk menandakan wajib diisi */}
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">Alasan Izin <span className="text-red-500">*</span></label>
            <textarea
              id="reason"
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full p-2 text-black border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Tuliskan alasan Anda di sini..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Bukti Lampiran <span className="text-red-500">*</span></label>
            {!attachment ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-300 rounded-md text-gray-500 hover:border-blue-500 hover:text-blue-500 transition-colors"
              >
                <FiPaperclip />
                <span>Upload Surat Dokter / Bukti Lainnya</span>
              </button>
            ) : (
              <div className="flex items-center justify-between p-2 border border-gray-200 rounded-md bg-gray-50">
                <span className="text-sm text-gray-700 truncate">{attachment.name}</span>
                <button onClick={() => setAttachment(null)} className="text-red-500 hover:text-red-700 ml-2">
                  <FiTrash2 />
                </button>
              </div>
            )}
            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
          </div>
        </div>

        <div className="p-4 bg-gray-50 border-t flex justify-end gap-3">
           <button type="button" onClick={onClose} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">Batal</button>
           {/* 2. Perbarui kondisi 'disabled' pada tombol */}
           <button 
              type="button" 
              onClick={handleSubmit} 
              disabled={!reason.trim() || !attachment} 
              className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300"
            >
              Kirim Pengajuan
            </button>
        </div>
      </div>
    </div>
  );
}