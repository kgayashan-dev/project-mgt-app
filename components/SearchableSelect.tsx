"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDownIcon, SearchIcon } from "lucide-react";

interface SearchableSelectProps {
  options: Array<{ value: string; label: string }>;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
  disabled?: boolean;
  icon?: React.ElementType;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = "Search...",
  label,
  icon,
  className = "",
  disabled = false,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  

  const selectedOption = options.find((option) => option.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  return (
    <div
      className={`relative ${className} flex flex-col items-start gap-2 text-xs font-semibold text-gray-700 capitalize`}
      ref={dropdownRef}
    >
      {label && (
        <label className="flex items-center gap-2">
          {icon &&
            React.createElement(icon, { className: "w-4 h-4 text-indigo-500" })}
          {label}
        </label>
      )}

      <div
        className={`w-full  px-2 py-2 rounded-xl border border-gray-300 flex items-center justify-between ${
          disabled
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "cursor-pointer bg-white"
        }`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
      >
        <span className="truncate">{selectedOption?.label || placeholder}</span>
        <ChevronDownIcon
          className={`h-4 w-4 text-gray-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </div>

      {isOpen && !disabled && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          <div className="absolute z-20 w-full mt-18 bg-white border border-gray-300 rounded-lg shadow-lg overflow-hidden transition-all duration-200 origin-top">
            <div className="p-2 border-b border-gray-200 flex items-center bg-white sticky top-0">
              <SearchIcon className="h-4 w-4 text-gray-400 mr-2" />
              <input
                ref={inputRef}
                type="text"
                placeholder={placeholder}
                className="w-full outline-none bg-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
              />
            </div>
            <div className="max-h-60 overflow-y-auto capitalize">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <div
                    key={option.value}
                    className={`p-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                      value === option.value ? "bg-blue-50 text-blue-600" : ""
                    }`}
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                      setSearchTerm("");
                    }}
                  >
                    {option.label}
                  </div>
                ))
              ) : (
                <div className="p-3 text-gray-500">No options found</div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SearchableSelect;
