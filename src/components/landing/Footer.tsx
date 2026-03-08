import Link from "next/link";

export default function Footer() {
  return (
    <footer className="flex items-center justify-between border-t border-gray-200 px-12 py-10">
      <div className="flex items-center gap-4">
        <Link href="/" className="text-lg font-bold text-[#2563eb]">
          Alan
        </Link>
        <span className="text-[13px] text-gray-400">Your Live AI Tutor</span>
      </div>
      <div className="flex gap-6">
        <a
          href="https://github.com/lucaslencinas/alan"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[13px] text-gray-500 transition-colors hover:text-gray-900"
        >
          GitHub
        </a>
        <a
          href="https://geminiliveagentchallenge.devpost.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[13px] text-gray-500 transition-colors hover:text-gray-900"
        >
          Hackathon
        </a>
      </div>
    </footer>
  );
}
