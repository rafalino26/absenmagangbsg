'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import imageCompression from 'browser-image-compression';
import { FiCamera, FiX, FiRefreshCw } from 'react-icons/fi';

interface AttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (file: File) => void;
  attendanceType: 'Hadir' | 'Pulang';
}

const compressionOptions = {
  maxSizeMB: 2.5,
  maxWidthOrHeight: 1080,
  useWebWorker: true,
  initialQuality: 0.8
};

export default function AttendanceModal({ isOpen, onClose, onSubmit, attendanceType }: AttendanceModalProps) {
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const webcamRef = useRef<Webcam>(null);

  // Fungsi untuk reset state
  const resetState = useCallback(() => {
    setPhoto(null);
    setPhotoFile(null);
  }, []);

  // Reset state setiap kali modal ditutup
  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        resetState();
      }, 300); // Beri jeda untuk animasi penutupan

      return () => clearTimeout(timer);
    }
  }, [isOpen, resetState]);

  const capturePhoto = useCallback(async () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      try {
        const response = await fetch(imageSrc);
        const blob = await response.blob();
        const file = new File([blob], 'capture.jpg', { type: 'image/jpeg' });
        const compressedFile = await imageCompression(file, compressionOptions);
        setPhoto(URL.createObjectURL(compressedFile));
        setPhotoFile(compressedFile);
      } catch (error) {
        console.error("Error processing webcam image:", error);
        alert("Gagal mengambil gambar dari webcam.");
      }
    }
  }, [webcamRef]);

  const handleSubmit = () => {
    if (photoFile) {
      onSubmit(photoFile);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-bold text-gray-800">Bukti Foto Absen {attendanceType}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><FiX size={24}/></button>
        </div>
        
        <div className="p-6 flex-grow">
          {photo ? (
            // Tampilan setelah foto diambil
            <div className="flex flex-col items-center gap-4">
              <img src={photo} alt="Preview" className="rounded-lg max-h-64 w-auto" />
              <button onClick={resetState} className="flex items-center gap-2 text-blue-600 font-semibold">
                <FiRefreshCw/> Ulangi
              </button>
            </div>
          ) : (
            // Tampilan webcam aktif
            <div className="flex flex-col items-center gap-4">
              <Webcam
                audio={false}
                ref={webcamRef}
                mirrored={true}
                screenshotFormat="image/jpeg"
                className="rounded-lg w-full"
                videoConstraints={{ 
                  width: 1920, 
                  height: 1080,
                  facingMode: "user" 
                }}
              />
              <button 
                onClick={capturePhoto} 
                className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center border-2 border-black hover:bg-gray-300 transition-colors"
                aria-label="Ambil Gambar"
              >
                <FiCamera size={24} className="text-black" />
              </button>
            </div>
          )}
        </div>

        <div className="p-4 border-t">
          <button 
            onClick={handleSubmit}
            disabled={!photoFile}
            className="w-full bg-red-600 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-red-700"
          >
            Konfirmasi & Lanjutkan Absen
          </button>
        </div>
      </div>
    </div>
  );
}