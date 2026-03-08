export default function TwoDevices() {
  return (
    <section className="px-6 py-24">
      <div className="mx-auto flex max-w-[960px] items-center gap-16">
        {/* Text */}
        <div className="flex-1">
          <h2 className="mb-4 text-4xl font-bold tracking-tight text-gray-900">
            Two devices, one session
          </h2>
          <p className="mb-6 text-base leading-relaxed text-gray-500">
            Unlike chatting with AI on your phone, Alan splits the experience
            across your devices so each one does what it&apos;s best at.
          </p>
          <ul className="flex flex-col gap-4">
            <li className="flex items-start gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-[#dbeafe] text-lg">
                {"\uD83D\uDCF1"}
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-900">
                  Phone — your camera
                </div>
                <div className="text-[13px] text-gray-500">
                  Films your paper, captures your voice, plays Alan&apos;s
                  spoken feedback. Keep it pointed at your desk.
                </div>
              </div>
            </li>
            <li className="flex items-start gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-[#dbeafe] text-lg">
                {"\uD83D\uDCBB"}
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-900">
                  Laptop — your whiteboard
                </div>
                <div className="text-[13px] text-gray-500">
                  Shows your steps with red/green/yellow indicators, rendered
                  equations, and expandable hints when you&apos;re stuck.
                </div>
              </div>
            </li>
          </ul>
        </div>

        {/* Device mockups */}
        <div className="flex flex-1 items-center gap-5">
          <div className="w-[140px] overflow-hidden rounded-2xl border border-gray-200 bg-gray-50">
            <div className="border-b border-gray-200 bg-white px-3 py-2 text-[10px] font-medium text-gray-500">
              {"\uD83D\uDCF1"} Phone
            </div>
            <div className="flex min-h-[120px] items-center justify-center p-4 text-center text-[11px] leading-snug text-gray-500">
              Camera feed
              <br />+ mic + speaker
            </div>
          </div>
          <div className="text-2xl text-gray-300">{"\u27F7"}</div>
          <div className="w-[260px] overflow-hidden rounded-2xl border border-gray-200 bg-gray-50">
            <div className="border-b border-gray-200 bg-white px-3 py-2 text-[10px] font-medium text-gray-500">
              {"\uD83D\uDCBB"} Laptop
            </div>
            <div className="flex min-h-[120px] items-center justify-center p-4 text-center text-[11px] leading-snug text-gray-500">
              {"\u2713"} x&#179;/3
              <br />
              {"\u2715"} 3x {"\u2192"} 3x&#178;/2
              <br />
              {"\uD83D\uDCA1"} Hints
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
