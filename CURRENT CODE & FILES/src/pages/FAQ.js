/* src/pages/FAQ.js */
/* global React */

/**
 * FAQ (full-fat)
 * - Expand/collapse questions
 * - Keyboard accessible
 * - Nice dark styling
 */

const { useState } = React;

function FAQ() {
  const faqs = [
    {
      q: "What are tokens?",
      a:
        "Tokens are time credits you earn by helping others and spend when you need help. " +
        "They are not money and cannot be cashed out.",
    },
    {
      q: "How do disputes work?",
      a:
        "If delivery isn’t as agreed, open a dispute. A moderator reviews the deliverables and " +
        "messages and decides. Escrow remains locked during review.",
    },
    {
      q: "Is this safe for kids?",
      a:
        "Yes. Verification, content moderation, and optional guardian oversight create a safe " +
        "environment. Guardians can review activity and set limits for under-16s.",
    },
    {
      q: "How do I build reputation?",
      a:
        "Do good work on time, communicate clearly, and collect positive ratings. Streaks and " +
        "badges help highlight consistency.",
    },
    {
      q: "Can I use real money?",
      a:
        "No person-to-person cash. Monetization is via optional boosters and cosmetics, not user " +
        "payments to each other.",
    },
    {
      q: "What is escrow?",
      a:
        "When a job starts, the client’s tokens are locked in escrow. After delivery, tokens " +
        "auto-release in 24h unless a dispute is opened.",
    },
    {
      q: "Can I be both client and helper?",
      a:
        "Yes! Post tasks when you need help and apply to tasks to earn tokens. Many users do both.",
    },
  ];

  const [openIdx, setOpenIdx] = useState(0);

  return (
    <section className="max-w-3xl">
      {faqs.map((item, i) => {
        const open = openIdx === i;
        return (
          <div
            key={i}
            className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 mb-3 focus-within:ring-2 focus-within:ring-indigo-500/40"
          >
            <button
              type="button"
              aria-expanded={open ? "true" : "false"}
              onClick={() => setOpenIdx(open ? -1 : i)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setOpenIdx(open ? -1 : i);
                }
              }}
              className="w-full text-left flex items-center justify-between"
            >
              <div className="font-semibold text-white">{item.q}</div>
              <div className="text-xl text-white select-none" aria-hidden>
                {open ? "–" : "+"}
              </div>
            </button>

            {open && (
              <p className="mt-3 text-sm text-zinc-300 leading-relaxed">{item.a}</p>
            )}
          </div>
        );
      })}
    </section>
  );
}
