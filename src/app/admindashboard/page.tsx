'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        // Jika berhasil, arahkan ke halaman rekapitulasi
        router.push('/admindashboard/rekapitulasi');
      } else {
        const data = await response.json();
        setError(data.error || 'Username atau password salah');
      }
    } catch (e) {
      setError('Gagal terhubung ke server');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Kita gunakan layout yang sama seperti login user, tapi tanpa header/sidebar
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-sm">
        <h1 className="text-center text-3xl font-bold text-gray-800 mb-6">Admin Login</h1>
        <form onSubmit={handleSubmit} className="space-y-6 rounded-lg bg-white p-8 shadow-lg">
          {error && <p className="text-center text-sm text-red-500">{error}</p>}
          <div>
            <label className="text-sm font-medium text-gray-700">Username</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 block w-full text-black border-gray-300 rounded-md shadow-sm p-2 focus:border-red-500 focus:ring-red-500"
            />
          </div>
           <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <div className="relative mt-1">
              <input
                type={showPassword ? 'text' : 'password'} // Tipe dinamis
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full text-black border-gray-300 rounded-md shadow-sm p-2 pr-10 focus:border-red-500 focus:ring-red-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <FaEye size={16} /> : <FaEyeSlash size={16} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading} 
            className="w-full flex justify-center rounded-md bg-red-600 py-3 text-sm font-semibold text-white shadow-sm hover:bg-red-700 transition-colors disabled:bg-red-400 disabled:cursor-not-allowed"
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
        </form>
      </div>
    </div>
  );
}