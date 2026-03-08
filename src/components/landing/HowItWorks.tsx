const steps = [
  {
    number: 1,
    emoji: "\uD83D\uDCF1",
    title: "Scan the QR code",
    description:
      "Open Alan on your laptop and scan the QR code with your phone. Your phone becomes the camera.",
  },
  {
    number: 2,
    emoji: "\u270D\uFE0F",
    title: "Solve on paper",
    description:
      "Work through equations on paper like you normally would. Your phone camera films your work.",
  },
  {
    number: 3,
    emoji: "\uD83D\uDCA1",
    title: "See corrections live",
    description:
      "Alan speaks corrections through your phone and shows the math on your laptop — step by step, with hints.",
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="border-t border-b border-gray-200 bg-gray-50 px-6 py-24"
    >
      <div className="mx-auto mb-16 max-w-[600px] text-center">
        <h2 className="mb-3 text-4xl font-bold tracking-tight text-gray-900">
          How it works
        </h2>
        <p className="text-base text-gray-500">
          Three simple steps. No signup required. Just start solving.
        </p>
      </div>
      <div className="mx-auto flex max-w-[960px] gap-8">
        {steps.map((step) => (
          <div key={step.number} className="flex-1 text-center">
            <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-[#dbeafe] text-xl font-bold text-[#2563eb]">
              {step.number}
            </div>
            <div className="mb-5 flex h-40 items-center justify-center rounded-xl border border-gray-200 bg-white text-5xl">
              {step.emoji}
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              {step.title}
            </h3>
            <p className="text-sm leading-relaxed text-gray-500">
              {step.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
