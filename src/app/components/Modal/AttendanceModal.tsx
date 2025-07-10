'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import imageCompression from 'browser-image-compression';
import { FiCamera, FiUpload, FiX, FiRefreshCw } from 'react-icons/fi';

interface AttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (file: File) => void;
  attendanceType: 'Hadir' | 'Pulang';
}

const compressionOptions = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1080,
  useWebWorker: true,
};

export default function AttendanceModal({ isOpen, onClose, onSubmit, attendanceType }: AttendanceModalProps) {
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [isWebcamActive, setWebcamActive] = useState(false);
  
  const webcamRef = useRef<Webcam>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);


  const resetPhoto = useCallback(() => {
    setPhoto(null);
    setPhotoFile(null);
    setWebcamActive(false);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        resetPhoto();
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [isOpen, resetPhoto]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const compressedFile = await imageCompression(file, compressionOptions);
        setPhoto(URL.createObjectURL(compressedFile));
        setPhotoFile(compressedFile);
      } catch (error) {
        console.error("Error compressing file:", error);
        alert("Gagal memproses gambar.");
      }
    }
  };

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
        setWebcamActive(false);
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
    <div className="fixed inset-0 backdrop-blur flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-bold text-gray-800">Bukti Foto Absen {attendanceType}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><FiX size={24}/></button>
        </div>
        
        <div className="p-6 flex-grow">
          {photo ? (
            <div className="flex flex-col items-center gap-4">
              <img src={photo} alt="Preview" className="rounded-lg max-h-64 w-auto" />
              <button onClick={resetPhoto} className="flex items-center gap-2 text-blue-600 font-semibold"><FiRefreshCw/> Ulangi</button>
            </div>
          ) : isWebcamActive ? (
            <div className="flex flex-col items-center gap-4">
               <Webcam
                  audio={false}
                  ref={webcamRef}
                  mirrored={true}
                  screenshotFormat="image/jpeg"
                  className="rounded-lg w-full"
                  videoConstraints={{ facingMode: "user" }}
                />
              <button onClick={capturePhoto} className="w-full bg-green-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-600">Ambil Gambar</button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <button onClick={() => setWebcamActive(true)} className="w-full bg-blue-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-600 flex items-center justify-center gap-2"><FiCamera/> Ambil Foto (Webcam)</button>
              <button onClick={() => fileInputRef.current?.click()} className="w-full bg-gray-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-gray-700 flex items-center justify-center gap-2"><FiUpload/> Upload dari Galeri</button>
              <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
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