// app/components/ThreeDotMenu.tsx
'use client';
import { useState, useRef, useEffect } from 'react';
import { FiMoreVertical } from 'react-icons/fi';

interface MenuAction {
  label: string;
  onClick: () => void;
  className?: string;
}

interface ThreeDotMenuProps {
  actions: MenuAction[];
}

export default function ThreeDotMenu({ actions }: ThreeDotMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700">
        <FiMoreVertical />
      </button>
      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
          <div className="py-1">
            {actions.map((action, index) => (
              <button
                key={index}
                onClick={() => {
                  action.onClick();
                  setIsOpen(false);
                }}
                className={`w-full text-left block px-4 py-2 text-sm ${action.className || 'text-gray-700 hover:bg-gray-100'}`}
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}