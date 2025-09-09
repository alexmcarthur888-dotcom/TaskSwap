/* src/pages/Overview.js */
/* global React */
/**
 * Overview (full-fat)
 * Props:
 *  - setTab(tabName: string)
 *  - lockedPost: boolean
 *  - lockedMarket: boolean
 */

const { useMemo } = React;

// Small local LockButton used only on this page
function OverviewLockButton({ locked, onClick, className = "", children, title }) {
  return (
    <div className="relative group inline-block">
      <button
        disabled={locked}
        onClick={locked ? undefined : onClick}
        className={[
          "relative overflow-hidden transition",
          locked ? "opacity-60 grayscale cursor-not-allowed" : "",
          className,
        ].join(" ")}
        title={locked ? "complete starter tasks to unlock" : title}
      >
        {locked && <span className="pointer-events-none absolute inset-0 bg-zinc-900/30" />}
        <span className="relative z-10">{children}</span>
      </button>

      {locked && (
        <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-max max-w-[220px] px-3 py-1.5 rounded-lg bg-zinc-800 text-white text-xs shadow-lg opacity-0 group-hover:opacity-100 transition pointer-events-none">
          complete starter tasks to unlock
        </div>
      )}
    </div>
  );
}

function OverviewCard({ title, count }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 hover:bg-zinc-900/60 transition">
      <div className="text-zinc-200 font-semibold">{title}</div>
      <div className="mt-2 text-xs text-zinc-400 flex items-center gap-1">
        <span>{count}</span>
        <span>👑</span>
      </div>
    </div>
  );
}

function Badge({ children }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-200 px-3 py-1 text-xs font-medium">
      {children}
    </span>
  );
}

function Overview({ setTab, lockedPost, lockedMarket }) {
  const categories = useMemo(
    () => [
      { title: "Design help", count: 22 },
      { title: "Essay review", count: 12 },
      { title: "Coding bugfix", count: 18 },
      { title: "Maths tutoring", count: 15 },
    ],
    []
  );

  return (
    <section>
      <div className="rounded-3xl overflow-hidden relative">
        {/* soft glow blobs */}
        <div className="absolute inset-0 -z-10 opacity-70" aria-hidden>
          <div className="absolute -top-20 -left-16 w-80 h-80 bg-indigo-400/40 blur-3xl rounded-full" />
          <div className="absolute -bottom-16 -right-8 w-80 h-80 bg-fuchsia-400/40 blur-3xl rounded-full" />
        </div>

        <div className="bg-black/20 border border-zinc-800 rounded-3xl p-8 md:p-12">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            {/* Hero copy */}
            <div className="flex-1">
              <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white">
                Trade time, learn faster —{" "}
                <span className="bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 bg-clip-text text-transparent">
                  no money needed
                </span>
              </h1>

              <p className="mt-4 text-lg text-zinc-300 leading-relaxed">
                TaskSwap is a token-based marketplace for kids, teens, and uni students. Earn tokens by
                helping with your skills, spend tokens when you need help. Escrow, disputes, and reputation
                keep it fair and safe.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Badge>Profiles &amp; portfolios</Badge>
                <Badge>Marketplace with escrow</Badge>
                <Badge>Gamified progress</Badge>
                <Badge>Guardian options</Badge>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                {/* Post a task (locked until profile starter task complete) */}
                <OverviewLockButton
                  locked={lockedPost}
                  onClick={() => setTab("Post Task")}
                  className="px-5 py-3 rounded-2xl bg-white text-zinc-900 font-semibold shadow-lg transition hover:bg-gradient-to-r hover:from-indigo-500 hover:via-violet-500 hover:to-fuchsia-500 hover:text-white"
                >
                  Post a task
                </OverviewLockButton>

                {/* Explore marketplace (locked while starter pack is active) */}
                <OverviewLockButton
                  locked={lockedMarket}
                  onClick={() => setTab("Marketplace")}
                  className="px-5 py-3 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold"
                >
                  Explore marketplace
                </OverviewLockButton>
              </div>
            </div>

            {/* Right column: quick categories */}
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
              {categories.map((c) => (
                <OverviewCard key={c.title} title={c.title} count={c.count} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Feature rows */}
      <div className="mt-8 grid md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
          <div className="text-lg font-semibold text-white">Skill Exchange</div>
          <p className="mt-2 text-sm text-zinc-300">
            Post tasks, accept gigs, and trade time-tokens using secure escrow.
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
          <div className="text-lg font-semibold text-white">Reputation</div>
          <p className="mt-2 text-sm text-zinc-300">
            Ratings, badges, and streaks make good work visible and trustworthy.
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
          <div className="text-lg font-semibold text-white">Safe for Students</div>
          <p className="mt-2 text-sm text-zinc-300">
            No money between users. Optional guardian oversight for under-16s.
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
          <div className="text-lg font-semibold text-white">Disputes</div>
          <p className="mt-2 text-sm text-zinc-300">
            If delivery isn’t as agreed, open a dispute. Escrow stays frozen while a moderator reviews.
          </p>
        </div>
      </div>
    </section>
  );
}
