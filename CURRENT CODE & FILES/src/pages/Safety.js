/* src/pages/Safety.js */
/* global React */

/**
 * Safety (full-fat)
 * Lists trust & safety features with styled cards and badges.
 */

function Badge({ children }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-200 px-3 py-1 text-xs font-medium">
      {children}
    </span>
  );
}

function Safety() {
  const items = [
    {
      title: "Escrow by default",
      desc: "Tokens lock when a job starts and release on approval or auto-release after 24h.",
      badges: ["Secure", "Automatic"],
    },
    {
      title: "Dispute resolution",
      desc: "Open a dispute and a moderator reviews deliverables. Escrow stays frozen until resolved.",
      badges: ["Fair", "Neutral"],
    },
    {
      title: "Verification",
      desc: "Email/phone and optional school/uni domain checks reduce fake accounts.",
      badges: ["Verified", "Trusted"],
    },
    {
      title: "Guardian options",
      desc: "For under-16s, guardians can view activity, set limits, or require approvals.",
      badges: ["Safe for kids"],
    },
    {
      title: "No real-money transfers",
      desc: "Tokens are time credits — safer and student-friendly, not tied to cash.",
      badges: ["Student-friendly"],
    },
  ];

  return (
    <section className="grid md:grid-cols-2 gap-6">
      {items.map((it, i) => (
        <div
          key={i}
          className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6 hover:border-indigo-500/50 transition"
        >
          <div className="text-lg font-semibold text-white">{it.title}</div>
          <p className="mt-2 text-sm text-zinc-300 leading-relaxed">{it.desc}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {it.badges.map((b, j) => (
              <Badge key={j}>{b}</Badge>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
