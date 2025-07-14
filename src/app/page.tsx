'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

export default function LoginPage() {
  const [internCode, setInternCode] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ internCode, password }),
      });

      if (response.ok) {
        // Jika berhasil, arahkan ke dashboard user
        router.push('/dashboard');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Login gagal.');
      }
    } catch (e) {
      setError('Tidak dapat terhubung ke server.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-sm space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Selamat Datang
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Silakan login untuk melanjutkan
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-6 rounded-lg bg-white p-8 shadow-sm border border-gray-200">
          {error && (
            <div className="p-3 text-center bg-red-100 border border-red-400 text-red-700 rounded-md">
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}
          <div className="space-y-4">
            {/* Input Kode Magang */}
            <div>
              <label
                htmlFor="internCode"
                className="text-sm font-medium text-gray-700"
              >
                Kode Magang
              </label>
              <input
                id="internCode"
                name="internCode"
                type="text"
                autoComplete="username" // <-- Ditambahkan di sini
                required
                className="mt-1 block w-full text-black border-0 border-b-2 border-gray-200 bg-transparent p-2 focus:border-red-500 focus:ring-0"
                value={internCode}
                onChange={(e) => setInternCode(e.target.value)}
              />
            </div>
            
            {/* Input Password */}
            <div>
              <label
                htmlFor="password"
                className="text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <div className="relative mt-1">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password" // <-- Ditambahkan di sini
                  required
                  className="block w-full text-black border-0 border-b-2 border-gray-200 bg-transparent p-2 pr-10 focus:border-red-500 focus:ring-0"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
          </div>

          {/* Tombol Submit */}
          <div>
    <button
      type="submit"
      // Tambahkan class untuk styling saat tombol nonaktif (disabled)
      className="w-full flex justify-center rounded-md bg-red-500 py-3 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:bg-red-400 disabled:cursor-not-allowed"
      disabled={isLoading} // Tombol dinonaktifkan saat loading
    >
      {isLoading ? (
        // Tampilan saat loading
        <>
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading
        </>
      ) : (
        // Tampilan normal
        'Login'
      )}
    </button>
          </div>
        </form>
      </div>
    </div>
  );
}