/* src/main.js */
/* global React, ReactDOM, UI, bus */
const { useState, useEffect } = React;
const { classNames, currency, Pill, Tag, useAppState, usePremiumVisual } = UI;

/* ---------------- Toast ---------------- */
function Toast({ toast, onClose }) {
  return (
    <div className="fixed left-1/2 -translate-x-1/2 bottom-6 z-50 w-[92%] sm:w-auto">
      <div className="shadow-2xl rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 sm:p-5 flex items-start gap-3">
        <div className="text-xl">{toast.icon || "✨"}</div>
        <div className="text-sm leading-5 text-zinc-700 dark:text-zinc-200">
          <div className="font-semibold mb-0.5">{toast.title}</div>
          {toast.body && <div className="opacity-90">{toast.body}</div>}
        </div>
        <button onClick={onClose} className="ml-3 text-zinc-500 hover:text-zinc-900 dark:hover:text-white">✖</button>
      </div>
    </div>
  );
}

/* ---------------- Premium Nudge (global) ----------------
   - Shown on all pages EXCEPT: Marketplace, Premium
   - Appears only when UI.usePremiumVisual(state).bubble === true (>=3 confirms and not dismissed)
   - Clean notification style, no “tail”, slides in to the top-right
---------------------------------------------------------- */
function PremiumNudge({ onClick }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // trigger slide-in on mount
    const t = setTimeout(() => setMounted(true), 10);
    return () => clearTimeout(t);
  }, []);
  return (
    <button
      onClick={onClick}
      className={classNames(
        // position
        "absolute top-4 right-4 md:top-6 md:right-6 z-20",
        // slide-in animation
        "transform transition-all duration-500 ease-out",
        mounted ? "opacity-100 translate-x-0" : "opacity-0 translate-x-3"
      )}
      // visual
      style={{ fontFamily: '"Manrope","Inter",ui-sans-serif,system-ui' }}
      title="Go to Premium"
    >
      <div
        className={classNames(
          "w-80 max-w-[85vw] rounded-2xl border-2 border-yellow-400/90",
          "bg-gradient-to-br from-yellow-400/15 via-amber-300/10 to-transparent",
          "shadow-[0_0_0_1px_rgba(250,204,21,0.8),0_0_20px_rgba(250,204,21,0.35)]",
          "px-5 py-4 text-left backdrop-blur-sm"
        )}
      >
        <div className="text-[13px] tracking-[.14em] text-yellow-300 font-extrabold">
          LIMITED BOOST
        </div>
        <div className="mt-1 text-[22px] leading-snug font-extrabold text-yellow-100">
          DOUBLE YOUR PROFITS<br/>FOR A WHOLE DAY.
        </div>
        <div className="mt-3 inline-flex items-center gap-2 text-[12px] text-zinc-300/90">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-yellow-300 animate-pulse"></span>
          Tap to learn more
        </div>
      </div>
    </button>
  );
}

/* ------------- Starter gates ------------- */
function useStarterGates(state) {
  const s1 = !!state.starterTasks?.find(t => t.id === "s1")?.done;
  const s2 = !!state.starterTasks?.find(t => t.id === "s2")?.done;
  const s3 = !!state.starterTasks?.find(t => t.id === "s3")?.done;
  const starterActive = !(s1 && s2 && s3);
  return { s1, s2, s3, starterActive };
}

function NavButton({ active, locked, children, onClick, extraClass }) {
  return (
    <button
      onClick={locked ? undefined : onClick}
      disabled={locked}
      className={classNames(
        "px-3 py-2 rounded-xl text-sm font-medium relative overflow-hidden transition",
        active ? "bg-zinc-100 text-black" : "text-zinc-300 hover:text-white hover:bg-zinc-800",
        locked && "after:absolute after:inset-0 after:bg-zinc-900/25 after:pointer-events-none opacity-90 cursor-not-allowed",
        extraClass
      )}
      title={locked ? "complete starter tasks to unlock" : undefined}
    >
      {children}
    </button>
  );
}

/* ---------------- App Shell ---------------- */
function AppShell() {
  // Force dark
  useEffect(() => {
    document.documentElement.classList.add("dark");
    return () => document.documentElement.classList.remove("dark");
  }, []);

  const [app, setApp] = useAppState(); // persistent state (ui.js)
  const { s1, s2, s3, starterActive } = useStarterGates(app);
  const [tab, setTab] = useState(starterActive ? "Starter Tasks" : "Overview");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Premium visual state from completedJobs (managed by Marketplace)
  const { outline, glow, bubble } = usePremiumVisual(app);

  // Toast + bus
  const [toast, setToast] = useState(null);
  const notify = (t) => { setToast(t); setTimeout(() => setToast(null), 4000); };
  useEffect(() => {
    const offToast = bus.on('toast', (t) => notify(t || { icon:'✨', title:'Done' }));
    const offNav   = bus.on('nav', (dest) => setTab(dest || 'Overview'));
    return () => { offToast(); offNav(); };
  }, []);

  // Starter Tasks: +1 exactly once when all three complete
  useEffect(() => {
    const allDone = s1 && s2 && s3;
    if (allDone && !app.starterRewarded) {
      setApp(prev => ({ ...prev, tokens: (prev.tokens || 0) + 1, starterRewarded: true }));
      notify({ icon: "🎉", title: "Starter pack complete!", body: "You earned 1 token. Welcome aboard!" });
      setTab("Overview");
    }
  }, [s1, s2, s3]); // eslint-disable-line

  // Locks
  const lockOverview    = starterActive;
  const lockMarketplace = starterActive;
  const lockPostTask    = starterActive && !s1;
  const lockCommunity   = starterActive && !s2;

  // Premium tab visuals
  const premiumOutlineClass = "ring-2 ring-yellow-400 border-yellow-400";
  const premiumGlowClass    = "ring-2 ring-yellow-400 shadow-[0_0_22px_rgba(255,215,0,0.65)] animate-pulse";
  function premiumTabClass() {
    if (glow) return premiumGlowClass;     // 2+ confirms
    if (outline) return premiumOutlineClass; // 1 confirm
    return "";                              // 0 confirms
  }

  const bg = "bg-[radial-gradient(60rem_60rem_at_120%_-10%,#3b82f6_0%,#111827_55%,#09090b_100%)]";
  const whiteGlow = "ring-2 ring-white/80 shadow-[0_0_18px_rgba(255,255,255,0.35)]";

  // StarterTasks & PostTask helpers
  function setStarterTasks(updater) {
    setApp(prev => {
      const current = prev.starterTasks || [];
      const next = typeof updater === 'function' ? updater(current) : updater;
      return { ...prev, starterTasks: next };
    });
  }
  function handleFirstPost() {
    if (!s2) {
      setApp(prev => ({
        ...prev,
        starterTasks: (prev.starterTasks || []).map(t => t.id === 's2' ? { ...t, done: true } : t)
      }));
      notify({ icon: "✅", title: "Starter task complete", body: "Community unlocked" });
    }
  }

  const starterTasksView = (app.starterTasks || []).map(t => ({
    ...t,
    desc:
      t.id === "s1" ? "Fill out your skills and bio on the Profile page." :
      t.id === "s2" ? "Use the Post Task page to create a small request." :
      t.id === "s3" ? "Comment or like a post in the Community feed." : ""
  }));

  const tabs = ["Overview","Marketplace","Post Task","Profile","Community","Safety","FAQ","Premium"];

  function navButtonClass(name, isMobile = false) {
    const base =
      (tab === name)
        ? "bg-zinc-100 text-black"
        : (isMobile ? "bg-zinc-800 text-zinc-200" : "text-zinc-300 hover:text-white hover:bg-zinc-800");

    const glowHints =
      (name === "Profile"   && !s1) ? whiteGlow :
      (name === "Post Task" && s1 && !s2) ? whiteGlow :
      (name === "Community" && s2 && !s3) ? whiteGlow : "";

    const premiumExtras = (name === "Premium") ? premiumTabClass() : "";

    const locked =
      (name === "Overview"    && lockOverview) ||
      (name === "Marketplace" && lockMarketplace) ||
      (name === "Post Task"   && lockPostTask) ||
      (name === "Community"   && lockCommunity);

    return classNames(
      "px-3 py-2 rounded-xl text-sm font-medium relative overflow-hidden transition",
      base,
      glowHints,
      premiumExtras,
      locked && "after:absolute after:inset-0 after:bg-zinc-900/25 after:pointer-events-none"
    );
  }

  // Click → dismiss nudge for good and navigate to Premium
  function goPremiumFromNudge() {
    setApp(prev => ({ ...prev, premiumHintDismissed: true }));
    setTab("Premium");
  }

  // Whether to show the global PremiumNudge on this tab
  const showPremiumNudge = bubble && tab !== "Marketplace" && tab !== "Premium";

  return (
    <div className={classNames("min-h-screen", bg, "transition-colors duration-500 relative")}>
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand */}
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 shadow-lg grid place-items-center text-white font-black">T</div>
              <div>
                <div className="font-extrabold tracking-tight text-lg text-white">TaskSwap</div>
                <div className="text-[11px] uppercase tracking-wider text-zinc-400">Trade time, not money</div>
              </div>
            </div>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1">
              {starterActive && (
                <button
                  onClick={() => setTab("Starter Tasks")}
                  className={classNames(
                    "px-3 py-2 rounded-xl text-sm font-semibold ring-2 ring-inset ring-violet-400/70",
                    tab === "Starter Tasks" ? "text-white bg-zinc-900" : "text-violet-200 hover:bg-zinc-800"
                  )}
                  title="Complete these quick tasks to unlock everything"
                >
                  Starter Tasks <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-violet-600 text-white">NEW</span>
                </button>
              )}

              {tabs.map((name) => (
                <button
                  key={name}
                  onClick={() => setTab(name)}
                  className={navButtonClass(name, false)}
                  disabled={
                    (name === "Overview"    && lockOverview) ||
                    (name === "Marketplace" && lockMarketplace) ||
                    (name === "Post Task"   && lockPostTask) ||
                    (name === "Community"   && lockCommunity)
                  }
                  title={
                    (name === "Overview"    && lockOverview)    ? "complete starter tasks to unlock" :
                    (name === "Marketplace" && lockMarketplace) ? "complete starter tasks to unlock" :
                    (name === "Post Task"   && lockPostTask)    ? "complete starter tasks to unlock" :
                    (name === "Community"   && lockCommunity)   ? "complete starter tasks to unlock" : undefined
                  }
                >
                  {name}
                </button>
              ))}
            </nav>

            {/* Account + mobile burger */}
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 bg-black/20 border border-zinc-800 rounded-2xl px-2 py-1">
                <Pill>{currency(app.tokens || 0)}</Pill>
                <Pill>⭐ {(Number(app.reputation) || 0).toFixed(1)}</Pill>
                <Pill>🔥 {(app.streak || 0)}-day</Pill>
              </div>
              <button
                onClick={() => setMobileNavOpen(!mobileNavOpen)}
                className="md:hidden h-9 w-9 grid place-items-center rounded-xl border border-zinc-700 bg-black/20"
                aria-label="Open navigation"
              >☰</button>
            </div>
          </div>

          {/* Mobile nav */}
          {mobileNavOpen && (
            <div className="md:hidden pb-3 flex flex-wrap gap-2">
              {starterActive && (
                <button
                  onClick={() => { setTab("Starter Tasks"); setMobileNavOpen(false); }}
                  className={classNames(
                    "px-3 py-1.5 rounded-xl text-sm",
                    tab === "Starter Tasks" ? "bg-zinc-100 text-black" : "bg-zinc-800 text-violet-200"
                  )}
                >
                  Starter Tasks
                </button>
              )}
              {tabs.map((t) => {
                const locked =
                  (t === "Overview"   && lockOverview) ||
                  (t === "Marketplace"&& lockMarketplace) ||
                  (t === "Post Task"  && lockPostTask) ||
                  (t === "Community"  && lockCommunity);
                return (
                  <button key={t}
                    onClick={() => { if (!locked) { setTab(t); setMobileNavOpen(false); } }}
                    disabled={locked}
                    className={navButtonClass(t, true)}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
        {/* Global Premium nudge (everywhere except Marketplace & Premium) */}
        {showPremiumNudge && <PremiumNudge onClick={goPremiumFromNudge} />}

        {tab === "Overview" && (
          <Overview
            setTab={setTab}
            lockedPost={lockPostTask}
            lockedMarket={lockMarketplace}
          />
        )}

        {tab === "Starter Tasks" && starterActive && (
          <StarterTasks
            tasks={starterTasksView}
            setTasks={setStarterTasks}
            notify={notify}
          />
        )}

        {tab === "Marketplace" && (
          // Marketplace updates completedJobs + tokens in ui.js and emits toasts/nav via bus.
          <Marketplace />
        )}

        {tab === "Post Task" && (
          <PostTask
            notify={notify}
            locked={lockPostTask}
            onFirstPost={handleFirstPost}
          />
        )}

        {tab === "Profile" && (
          <Profile myTokens={app.tokens || 0} myReputation={app.reputation || 0} />
        )}

        {tab === "Community" && (
          <Community locked={lockCommunity} />
        )}

        {tab === "Safety" && <Safety />}
        {tab === "FAQ" && <FAQ />}
        {tab === "Premium" && <Premium />}
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        <div className="mt-10 rounded-3xl border border-zinc-800 bg-black/20 p-6 text-sm text-zinc-300 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>© {new Date().getFullYear()} TaskSwap — A safe way to trade skills with time tokens.</div>
          <div className="flex items-center gap-2">
            <Tag>Non-monetary</Tag>
            <Tag>Student-friendly</Tag>
            <Tag>Escrow</Tag>
            <Tag>Disputes</Tag>
          </div>
        </div>
      </footer>

      {/* Toast */}
      {toast && <Toast toast={toast} onClose={() => setToast(null)} />}
    </div>
  );
}

/* ---------------- Mount ---------------- */
(function mount() {
  let node = document.getElementById("root");
  if (!node) {
    node = document.createElement("div");
    node.id = "root";
    document.body.appendChild(node);
  }
  ReactDOM.render(<AppShell />, node);
})();
