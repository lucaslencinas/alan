"use client";

import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between border-b border-gray-200 bg-white/95 px-12 py-4 backdrop-blur-sm">
      <Link href="/" className="text-[22px] font-bold text-[#2563eb]">
        Alan
      </Link>
      <nav className="flex items-center gap-8">
        <a
          href="#how-it-works"
          className="text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
        >
          How It Works
        </a>
        <a
          href="#for-teachers"
          className="text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
        >
          For Teachers
        </a>
        <a
          href="https://github.com/lucaslencinas/alan"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
        >
          GitHub
        </a>
        <Link
          href="/session/new"
          className="rounded-full bg-[#2563eb] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1d4ed8]"
        >
          Start Studying
        </Link>
      </nav>
    </header>
  );
}
