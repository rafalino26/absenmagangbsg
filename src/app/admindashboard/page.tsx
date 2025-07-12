'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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
            <label className="text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full text-black border-gray-300 rounded-md shadow-sm p-2 focus:border-red-500 focus:ring-red-500"
            />
          </div>
          <button type="submit" disabled={isLoading} className="w-full justify-center rounded-md bg-red-600 py-3 text-sm font-semibold text-white shadow-sm hover:bg-red-700 disabled:bg-gray-400">
            {isLoading ? 'Memproses...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}