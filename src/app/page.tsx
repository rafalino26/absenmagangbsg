'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

export default function LoginPage() {
  const [internCode, setInternCode] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const router = useRouter();

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    console.log('Login dengan data:', { internCode, password });

    router.push('/dashboard');
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
              className="w-full justify-center rounded-md bg-red-500 py-3 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}