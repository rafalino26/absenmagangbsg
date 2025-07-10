'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiGrid, FiClock, FiX } from 'react-icons/fi';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const navLinks = [
  { name: 'Rekapitulasi', href: '/admindashboard/rekapitulasi', icon: FiGrid },
  { name: 'Riwayat Absensi', href: '/admindashboard/riwayat', icon: FiClock },
];

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Backdrop overlay, hanya muncul di mobile saat sidebar terbuka */}
      <div 
        onClick={() => setIsOpen(false)}
        className={`fixed inset-0 md:hidden transition-opacity
          ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`
        }
      />

      {/* 1. Class di <aside> diubah menjadi dinamis */}
      <aside 
        className={`fixed top-0 left-0 h-full w-64 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col z-30 transition-transform duration-300 ease-in-out 
          md:relative md:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}`
        }
      >
        {/* Tombol close di dalam sidebar untuk mobile */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 md:hidden">
            <span className="text-lg text-black font-bold">Menu</span>
            <button onClick={() => setIsOpen(false)} className="p-2 text-black">
                <FiX />
            </button>
        </div>
      <nav className="px-4 py-6">
        <ul>
          {navLinks.map((link) => {
            const isActive = pathname.startsWith(link.href);
            return (
              <li key={link.name}>
                <Link
                  href={link.href}
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