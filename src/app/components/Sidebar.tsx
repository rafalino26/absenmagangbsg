'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiGrid, FiClock, FiX, FiMessageSquare, FiUsers, FiUserPlus } from 'react-icons/fi';
import { Role } from '@prisma/client';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  role?: Role;
}

const navLinks = [
  { name: 'Rekapitulasi', href: '/admindashboard/rekapitulasi', icon: FiGrid },
  { name: 'Riwayat Absensi', href: '/admindashboard/riwayat', icon: FiClock },
  { name: 'Arsip Magang', href: '/admindashboard/arsip', icon: FiClock, requiredRole: Role.SUPER_ADMIN },
  { name: 'Helpdesk', href: '/admindashboard/helpdesk', icon: FiMessageSquare }, 
  { name: 'Kelola Mentor', href: '/admindashboard/mentors', icon: FiUsers, requiredRole: Role.SUPER_ADMIN },
   { name: 'Kelola Peserta', href: '/admindashboard/peserta', icon: FiUserPlus, requiredRole: Role.SUPER_ADMIN }
];

export default function Sidebar({ isOpen, setIsOpen, role }: SidebarProps) {
  const pathname = usePathname();

   const visibleLinks = navLinks.filter(link => {
    // Jika link tidak butuh role khusus, tampilkan.
    // Jika butuh, hanya tampilkan jika role user cocok.
    return !link.requiredRole || link.requiredRole === role;
  });

  return (
    <>
      {/* Backdrop overlay */}
      <div 
        onClick={() => setIsOpen(false)}
        className={`fixed inset-0 bg-black/30 z-20 md:hidden transition-opacity
          ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`
        }
      />

      {/* Sidebar */}
      <aside 
        className={`fixed top-0 left-0 h-full w-64 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col z-30 transition-transform duration-300 ease-in-out 
          md:relative md:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}`
        }
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 md:hidden">
            <span className="text-lg text-black font-bold">Menu</span>
            <button onClick={() => setIsOpen(false)} className="p-2 text-black">
                <FiX />
            </button>
        </div>
        <nav className="p-4">
          <ul className="space-y-2">
            {visibleLinks.map((link) => {
              const isActive = pathname === link.href; // Gunakan '===' untuk pencocokan persis
              return (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    onClick={() => setIsOpen(false)} // Tutup sidebar saat link di-klik di mobile
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-colors
                      ${isActive
                        ? 'bg-red-600 text-white shadow-md'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`
                    }
                  >
                    <link.icon size={20} />
                    <span>{link.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
}