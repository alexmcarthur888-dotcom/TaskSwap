/* src/pages/PostTask.js */
/* global React */

const { useState, useEffect, useRef } = React;

function Badge({ children }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-200 px-3 py-1 text-xs font-medium">
      {children}
    </span>
  );
}

function FollowTooltip({ show, text }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!show) return;
    const node = ref.current;
    if (!node) return;
    function onMove(e) {
      node.style.transform = `translate(${e.clientX + 14}px, ${e.clientY + 16}px)`;
    }
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [show]);
  return (
    <div
      ref={ref}
      className={["fixed z-50 pointer-events-none transition-opacity", show ? "opacity-100" : "opacity-0"].join(" ")}
      style={{ willChange: "transform" }}
    >
      <div className="px-3 py-1.5 rounded-lg bg-zinc-800 text-white text-xs shadow-lg border border-zinc-700">
        {text}
      </div>
    </div>
  );
}

function LockField({ locked, children }) {
  const [hovering, setHovering] = useState(false);
  return (
    <div
      className="relative group"
      onMouseEnter={() => locked && setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      {children}
      {locked && (
        <>
          <div className="absolute inset-0 rounded-xl bg-zinc-900/30 z-10" />
          <div className="absolute inset-0 z-20 grid place-items-center pointer-events-none">
            <div className="h-12 w-12 rounded-full bg-rose-600/90 text-white grid place-items-center shadow-lg">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" />
                <path d="M5 19 L19 5" stroke="currentColor" strokeWidth="3" />
              </svg>
            </div>
          </div>
          <FollowTooltip show={hovering} text="complete starter tasks to unlock" />
          <div className="absolute inset-0 z-30 cursor-not-allowed" />
        </>
      )}
    </div>
  );
}

function LockButton({ locked, onClick, className = "", children, title }) {
  const [hovering, setHovering] = useState(false);
  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => locked && setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <button
        disabled={locked}
        onClick={locked ? undefined : onClick}
        className={["relative overflow-hidden rounded-xl", locked ? "opacity-60 grayscale cursor-not-allowed" : "", className].join(" ")}
        title={locked ? "complete starter tasks to unlock" : title}
      >
        {children}
      </button>
      {locked && <FollowTooltip show={hovering} text="complete starter tasks to unlock" />}
    </div>
  );
}

const CATEGORY_STYLES = {
  Design: { ribbon: "from-violet-500 to-fuchsia-500", dot: "bg-fuchsia-400" },
  Writing: { ribbon: "from-pink-500 to-rose-500", dot: "bg-pink-400" },
  Coding: { ribbon: "from-cyan-500 to-sky-500", dot: "bg-cyan-400" },
  Tutoring: { ribbon: "from-emerald-500 to-teal-500", dot: "bg-emerald-400" },
  Music: { ribbon: "from-amber-500 to-orange-500", dot: "bg-amber-400" },
  Video: { ribbon: "from-indigo-500 to-blue-500", dot: "bg-indigo-400" },
  Other: { ribbon: "from-slate-500 to-zinc-500", dot: "bg-slate-400" },
};

const STATUS_STEPS = [
  { key: "posted", label: "Posted", color: "indigo", ring: "ring-indigo-400", fill: "bg-indigo-500" },
  { key: "picked_up", label: "Picked up", color: "emerald", ring: "ring-emerald-400", fill: "bg-emerald-500" },
  { key: "ready_for_review", label: "Ready for review", color: "amber", ring: "ring-amber-400", fill: "bg-amber-500" },
];

function StepDot({ active, done, ring, fill }) {
  return (
    <div
      className={[
        "h-7 w-7 rounded-full grid place-items-center",
        done ? fill : "bg-zinc-800",
        active ? `ring-2 ${ring} shadow-[0_0_18px_rgba(255,255,255,0.18)]` : "ring-1 ring-zinc-700",
      ].join(" ")}
    >
      {done ? (
        <svg width="16" height="16" viewBox="0 0 24 24" className="text-black">
          <path fill="currentColor" d="M9 16.2l-3.5-3.6L4 14l5 5 11-11-1.5-1.4z" />
        </svg>
      ) : (
        <span className="h-2 w-2 rounded-full bg-white/70" />
      )}
    </div>
  );
}

function StatusStepper({ status, setStatus, showActions, onConfirm, onDispute }) {
  const currentIdx =
    status === "posted" ? 0 : status === "picked_up" ? 1 : status === "ready_for_review" ? 2 : 2;
  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-900/50 p-5">
      <div className="text-sm font-semibold text-white">Status</div>
      <div className="mt-3 flex items-center gap-4">
        {STATUS_STEPS.map((s, i) => {
          const active = i === currentIdx;
          const done = i < currentIdx;
          return (
            <div key={s.key} className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <StepDot active={active} done={done} ring={s.ring} fill={s.fill} />
                <div className={["text-sm", active ? "text-white" : "text-zinc-400"].join(" ")}>{s.label}</div>
              </div>
              {i < STATUS_STEPS.length - 1 && <div className="h-px w-12 bg-zinc-700/60" />}
            </div>
          );
        })}
      </div>

      <div className="mt-4">
        {status === "posted" && (
          <div className="text-xs text-zinc-400">Awaiting a helper to pick up your task.</div>
        )}
        {status === "picked_up" && (
          <div className="text-xs text-zinc-400">In progress. You can message your helper from the task room.</div>
        )}
        {status === "ready_for_review" && (
          <div className="text-xs text-zinc-400">Review the submission below, then confirm or open a dispute.</div>
        )}
      </div>

      {showActions && status === "ready_for_review" && (
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-xl bg-emerald-500 text-black font-semibold hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/60"
          >
            Client confirm
          </button>
          <button
            onClick={onDispute}
            className="px-4 py-2 rounded-xl bg-zinc-900 text-rose-300 border border-rose-500/40 hover:bg-rose-500/10 font-semibold focus:outline-none focus:ring-2 focus:ring-rose-400/60"
          >
            Open dispute
          </button>
        </div>
      )}

      <div className="mt-4 text-[11px] text-zinc-500">
        Demo controls:{" "}
        <button
          onClick={() => setStatus("posted")}
          className="underline hover:text-white"
        >
          Posted
        </button>{" "}
        ·{" "}
        <button
          onClick={() => setStatus("picked_up")}
          className="underline hover:text-white"
        >
          Picked up
        </button>{" "}
        ·{" "}
        <button
          onClick={() => setStatus("ready_for_review")}
          className="underline hover:text-white"
        >
          Ready for review
        </button>
      </div>
    </div>
  );
}

function LivePreview({ form, status }) {
  const cat = CATEGORY_STYLES[form.category] || CATEGORY_STYLES.Other;
  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
      <div className={["h-2 bg-gradient-to-r", cat.ribbon].join(" ")} />
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm text-zinc-400">Preview</div>
            <h3 className="text-lg font-bold text-white">{form.title || "Untitled task"}</h3>
          </div>
          <div className="text-sm px-2 py-1 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-200">
            {form.tokens} 👑
          </div>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-200">
            <span className={["h-2 w-2 rounded-full", cat.dot].join(" ")} />
            {form.category}
          </span>
          {form.quick && <Badge>Quick (~1h)</Badge>}
          {form.deadline && <Badge>Deadline: {form.deadline}</Badge>}
        </div>

        <p className="mt-3 text-sm text-zinc-300 whitespace-pre-wrap">
          {form.details || "Add details, deliverables, and any links here. This preview updates as you type."}
        </p>

        <div className="mt-4">
          <span
            className={[
              "text-[11px] px-2 py-1 rounded-md border",
              status === "posted" ? "border-indigo-500/40 text-indigo-300" :
              status === "picked_up" ? "border-emerald-500/40 text-emerald-300" :
              "border-amber-500/40 text-amber-300",
            ].join(" ")}
          >
            {status === "posted" ? "Posted" : status === "picked_up" ? "Picked up" : "Ready for review"}
          </span>
        </div>
      </div>
    </div>
  );
}

function PostTask({ notify, locked, onFirstPost }) {
  const [form, setForm] = useState({
    title: "",
    category: "Design",
    tokens: 10,
    details: "",
    deadline: "",
    quick: false,
  });

  const [status, setStatus] = useState("posted");
  const [hasPosted, setHasPosted] = useState(false);
  const [disputeOpen, setDisputeOpen] = useState(false);

  const categories = ["Design", "Writing", "Coding", "Tutoring", "Music", "Video", "Other"];

  function update(key, val) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  function submit() {
    const title = form.title.trim() || "Untitled task";
    setHasPosted(true);
    setStatus("posted");
    notify?.({ icon: "🚀", title: "Task posted", body: title });
    onFirstPost?.();
  }

  function clearForm() {
    setForm({ title: "", category: "Design", tokens: 10, details: "", deadline: "", quick: false });
    setHasPosted(false);
    setStatus("posted");
    setDisputeOpen(false);
  }

  function confirmClient() {
    notify?.({ icon: "✅", title: "Client confirmation recorded", body: "Escrow released" });
    clearForm();
  }

  function openDispute() {
    setDisputeOpen(true);
    notify?.({ icon: "⚖️", title: "Dispute opened", body: "Moderator will review" });
  }

  return (
    <section className="grid xl:grid-cols-5 gap-6">
      <div className="xl:col-span-3 rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6 relative overflow-hidden">
        <div className="absolute -top-24 -left-16 w-80 h-80 bg-indigo-500/15 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute -bottom-24 -right-10 w-80 h-80 bg-fuchsia-500/15 blur-3xl rounded-full pointer-events-none" />
        <div className="relative">
          <h2 className="text-xl font-bold text-white">Post a new task</h2>
          <p className="text-sm text-zinc-300 mt-1">Offer tokens for help. Tokens are time credits, not money.</p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!locked) submit();
            }}
            className="mt-5 space-y-4"
          >
            <div>
              <label className="block text-sm font-medium mb-1 text-zinc-200">Title</label>
              <LockField locked={locked}>
                <input
                  disabled={locked}
                  value={form.title}
                  onChange={(e) => update("title", e.target.value)}
                  required
                  placeholder="e.g., Design a logo for my study group"
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-800 text-zinc-100 placeholder-zinc-400 px-3 py-2 outline-none focus:border-indigo-500"
                />
              </LockField>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-zinc-200">Category</label>
                <LockField locked={locked}>
                  <select
                    disabled={locked}
                    value={form.category}
                    onChange={(e) => update("category", e.target.value)}
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-800 text-zinc-100 px-3 py-2 focus:border-indigo-500"
                  >
                    {categories.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </LockField>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-zinc-200">Tokens offered</label>
                <LockField locked={locked}>
                  <input
                    disabled={locked}
                    type="number"
                    min={1}
                    value={form.tokens}
                    onChange={(e) => update("tokens", Number(e.target.value))}
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-800 text-zinc-100 px-3 py-2 focus:border-indigo-500"
                  />
                </LockField>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-zinc-200">Details</label>
              <LockField locked={locked}>
                <textarea
                  disabled={locked}
                  value={form.details}
                  onChange={(e) => update("details", e.target.value)}
                  rows={6}
                  placeholder="Describe the work, deliverables, style references, and any links."
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-800 text-zinc-100 placeholder-zinc-400 px-3 py-2 focus:border-indigo-500"
                />
              </LockField>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-zinc-200">Deadline</label>
                <LockField locked={locked}>
                  <input
                    disabled={locked}
                    value={form.deadline}
                    onChange={(e) => update("deadline", e.target.value)}
                    placeholder="e.g., 30 Sep, 6pm"
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-800 text-zinc-100 placeholder-zinc-400 px-3 py-2 focus:border-indigo-500"
                  />
                </LockField>
              </div>

              <div className="flex items-end">
                <LockField locked={locked}>
                  <label className="inline-flex items-center gap-2 text-sm text-zinc-200">
                    <input
                      disabled={locked}
                      type="checkbox"
                      checked={form.quick}
                      onChange={(e) => update("quick", e.target.checked)}
                      className="accent-indigo-600"
                    />
                    Mark as quick (≈1h)
                  </label>
                </LockField>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <LockButton
                locked={locked}
                onClick={() => submit()}
                className="px-5 py-3 bg-white text-black font-semibold hover:bg-zinc-200"
              >
                Post task
              </LockButton>
              <button
                type="button"
                onClick={clearForm}
                className="px-5 py-3 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold"
              >
                Clear
              </button>
            </div>
          </form>
        </div>
      </div>

      <aside className="xl:col-span-2 space-y-6">
        <StatusStepper
          status={status}
          setStatus={(s) => setStatus(s)}
          showActions={hasPosted}
          onConfirm={confirmClient}
          onDispute={openDispute}
        />

        <LivePreview form={form} status={status} />

        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6">
          <h3 className="font-semibold text-white">Tips for great posts</h3>
          <ul className="mt-3 text-sm list-disc pl-5 space-y-2 text-zinc-300">
            <li>Be specific about deliverables and style.</li>
            <li>Attach references or examples inside the project room.</li>
            <li>Offer fair tokens for time and complexity.</li>
            <li>Set realistic deadlines and availability windows.</li>
          </ul>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge>Clear brief</Badge>
            <Badge>Fair tokens</Badge>
            <Badge>Realistic scope</Badge>
          </div>
        </div>

        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6">
          <h3 className="font-semibold text-white">How escrow works</h3>
          <p className="mt-2 text-sm text-zinc-300">
            Tokens are locked when a job starts and released on approval, or auto-released after 24h unless a dispute is opened.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge>Secure</Badge>
            <Badge>Transparent</Badge>
            <Badge>Dispute-ready</Badge>
          </div>
          {disputeOpen && (
            <div className="mt-4 text-xs text-rose-300">
              Dispute active. A moderator will review your case and keep escrow frozen.
            </div>
          )}
        </div>
      </aside>
    </section>
  );
}
