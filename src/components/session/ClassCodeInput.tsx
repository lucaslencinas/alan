"use client";

interface ClassCodeInputProps {
  value: string;
  onChange: (code: string) => void;
}

export default function ClassCodeInput({ value, onChange }: ClassCodeInputProps) {
  return (
    <div className="mb-8 text-left">
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-3">
        Class code
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g. MATH-301"
        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#2563eb] transition-colors"
      />
      <p className="text-xs text-gray-400 mt-1.5">
        Optional — enter your teacher&apos;s code to track progress
      </p>
    </div>
  );
}
