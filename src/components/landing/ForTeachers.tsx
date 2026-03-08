import Link from "next/link";

const features = [
  {
    emoji: "\uD83D\uDCCA",
    title: "Class insights",
    description:
      "See the most common mistakes across your class. Know what to review in your next lecture.",
  },
  {
    emoji: "\uD83D\uDC64",
    title: "Student progress",
    description:
      "Track each student's practice sessions, accuracy trends, and topics covered.",
  },
  {
    emoji: "\uD83D\uDD11",
    title: "Simple class code",
    description:
      "Students enter your class code before studying. No accounts, no friction.",
  },
];

export default function ForTeachers() {
  return (
    <section
      id="for-teachers"
      className="border-t border-gray-200 bg-gray-50 px-6 py-24 text-center"
    >
      <h2 className="mb-3 text-4xl font-bold text-gray-900">
        Built for classrooms
      </h2>
      <p className="mx-auto mb-12 max-w-[560px] text-base leading-relaxed text-gray-500">
        Teachers get a dashboard to see how their students are doing — common
        mistakes, practice frequency, and progress over time.
      </p>
      <div className="mx-auto mb-10 flex max-w-[800px] gap-6">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="flex-1 rounded-xl border border-gray-200 bg-white p-6 text-left"
          >
            <div className="mb-3 text-[28px]">{feature.emoji}</div>
            <h4 className="mb-1.5 text-[15px] font-semibold text-gray-900">
              {feature.title}
            </h4>
            <p className="text-[13px] leading-snug text-gray-500">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
      <Link
        href="/teacher"
        className="inline-block rounded-full border border-gray-300 bg-white px-7 py-3 text-sm font-semibold text-[#2563eb] transition-all hover:border-[#2563eb] hover:bg-[#dbeafe]"
      >
        View Teacher Dashboard
      </Link>
    </section>
  );
}
