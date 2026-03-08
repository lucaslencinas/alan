"use client";

import { useEffect } from "react";

const STORAGE_KEY = "alan-student-name";

interface NameInputProps {
  value: string;
  onChange: (name: string) => void;
}

export default function NameInput({ value, onChange }: NameInputProps) {
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && !value) {
      onChange(saved);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    onChange(name);
    localStorage.setItem(STORAGE_KEY, name);
  };

  return (
    <div className="mb-6 text-left">
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-3">
        What&apos;s your name?
      </label>
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder="Your name"
        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#2563eb] transition-colors"
      />
    </div>
  );
}
