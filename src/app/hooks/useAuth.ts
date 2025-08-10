// src/hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';
import { Role } from '@prisma/client';

interface AuthPayload {
  userId: number;
  name: string;
  role: Role;
}

export function useAuth() {
  const [auth, setAuth] = useState<AuthPayload | null>(null);

 useEffect(() => {
    const token = Cookies.get('adminAuthToken');

    if (token) {
      try {
        const decoded = jwtDecode<AuthPayload>(token);
        setAuth(decoded);
      } catch (error) {
        console.error("Invalid token:", error);
        setAuth(null);
      }
    }
  }, []);

  return auth;
}