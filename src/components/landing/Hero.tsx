import Link from "next/link";

export default function Hero() {
  return (
    <section>
      <div className="mx-auto max-w-[800px] px-6 pt-24 pb-16 text-center">
        <span className="mb-6 inline-block rounded-full bg-[#dbeafe] px-4 py-1.5 text-[13px] font-semibold text-[#2563eb]">
          Powered by Google Gemini
        </span>
        <h1 className="mb-5 text-[56px] font-extrabold leading-[1.1] tracking-tight text-gray-900">
          Your AI tutor that{" "}
          <span className="text-[#2563eb]">sees</span> your work
        </h1>
        <p className="mx-auto mb-10 max-w-[600px] text-xl leading-relaxed text-gray-500">
          Point your phone camera at your paper. Alan watches you solve
          equations in real time, catches mistakes, and shows corrections on
          your laptop screen.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href="/session/new"
            className="rounded-full bg-[#2563eb] px-8 py-3.5 text-base font-semibold text-white transition-colors hover:bg-[#1d4ed8]"
          >
            Start Studying
          </Link>
          <a
            href="#how-it-works"
            className="rounded-full border border-gray-300 bg-white px-8 py-3.5 text-base font-semibold text-[#2563eb] transition-all hover:border-[#2563eb] hover:bg-gray-50"
          >
            See How It Works
          </a>
        </div>
      </div>

      {/* Browser frame preview */}
      <div className="mx-auto max-w-[960px] px-6 pb-16">
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 shadow-lg">
          {/* Title bar */}
          <div className="flex items-center gap-3 border-b border-gray-200 bg-white px-5 py-3">
            <div className="flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-gray-200" />
              <span className="h-2.5 w-2.5 rounded-full bg-gray-200" />
              <span className="h-2.5 w-2.5 rounded-full bg-gray-200" />
            </div>
            <span className="text-xs text-gray-500">
              Alan — Integrals session
            </span>
          </div>
          {/* Step cards */}
          <div className="flex gap-4 p-6">
            <div className="flex-1 rounded-xl border border-gray-200 border-l-[3px] border-l-[#16a34a] bg-white p-4">
              <div className="mb-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#dcfce7] text-xs text-[#16a34a]">
                &#10003;
              </div>
              <div className="font-serif text-base text-gray-900">
                &#8747; x&#178; dx = x&#179;/3
              </div>
              <div className="mt-1.5 text-[11px] text-gray-500">
                Power rule — correct
              </div>
            </div>
            <div className="flex-1 rounded-xl border border-gray-200 border-l-[3px] border-l-[#dc2626] bg-white p-4">
              <div className="mb-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#fef2f2] text-xs text-[#dc2626]">
                &#10005;
              </div>
              <div className="font-serif text-base text-gray-900">
                &#8747; 3x dx = 3x
              </div>
              <div className="mt-1.5 text-[11px] text-gray-500">
                Missing exponent — should be 3x&#178;/2
              </div>
            </div>
            <div className="flex-1 rounded-xl border border-gray-200 border-l-[3px] border-l-[#d97706] bg-white p-4">
              <div className="mb-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#fefce8] text-xs text-[#d97706]">
                !
              </div>
              <div className="font-serif text-base text-gray-900">
                = x&#179;/3 + 3x &#8722; 5x + C
              </div>
              <div className="mt-1.5 text-[11px] text-gray-500">
                Fix step 2 and this resolves
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
