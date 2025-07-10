'use client';

import { useState, useRef, useEffect } from 'react';
import { FiChevronDown } from 'react-icons/fi';

interface CustomDropdownProps {
  label: string;
  options: string[];
  selectedValue: string;
  onSelect: (value: string) => void;
}

export default function CustomDropdown({ label, options, selectedValue, onSelect }: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Hook untuk menutup dropdown saat klik di luar
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  return (
    <div className="flex items-center gap-2">
      <label className="text-sm font-medium text-gray-700">{label}:</label>
      <div className="relative" ref={dropdownRef}>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between w-48 bg-white border border-gray-300 rounded-md shadow-sm px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <span>{selectedValue}</span>
          <FiChevronDown className={`ml-2 h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        {isOpen && (
          <div className="absolute z-10 mt-1 w-48 bg-white rounded-md shadow-lg border">
            <div className="py-1">
              {options.map(option => (
                <button
                  key={option}
                  onClick={() => {
                    onSelect(option);
                    setIsOpen(false);
                  }}
                  className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}