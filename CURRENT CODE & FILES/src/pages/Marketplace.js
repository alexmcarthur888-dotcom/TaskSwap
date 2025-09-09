/* src/pages/Marketplace.js */
/* global React, UI, getState, setState, bus */
const { useState, useMemo, useEffect, useRef } = React;
const { classNames, Tag, StatBadge, useAppState } = UI;


/* =============================================================================
   Marketplace — Accept, Deliver, Files
   -----------------------------------------------------------------------------
   What’s changed to “fix ts” (a.k.a. fix this exact behavior):
   • Premium activation (and cadence) now happens on **Deliver**, not Confirm.
   • We moved the completedJobs increment from Confirm → Deliver, so any UI that
     keys off completedJobs (like your Premium nudge) will now fire on delivery.
   • Confirm still gives +1 token but does NOT touch Premium.
   • Only one Deliver button (top-right on the card).
   • Removed redundant “Done” text from finished cards (kept Disputed label).
   ========================================================================== */


/* ----------------------------- Small UI bits ----------------------------- */
function SectionTitle({ children }) {
  return <div className="text-lg font-semibold">{children}</div>;
}
function Divider() { return <div className="h-px bg-zinc-800/80 my-4" />; }
function SmallBadge({ children }) {
  return (
    <span className="inline-flex items-center rounded-full border border-zinc-700 px-2 py-0.5 text-[11px] uppercase tracking-wide text-zinc-300">
      {children}
    </span>
  );
}
function Kpi({ label, value }) {
  return (
    <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800 p-4">
      <div className="text-sm text-zinc-400">{label}</div>
      <div className="mt-1 text-2xl font-extrabold">{value}</div>
    </div>
  );
}


/* ------------------------------ Filter Bar ------------------------------ */
function FilterBar({ filters, setFilters, onReset }) {
  return (
    <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800 p-3">
      {/* Row 1: category + range + sort + reset */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Category */}
        <select
          className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2"
          value={filters.category}
          onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
        >
          <option value="all">All</option>
          <option value="design">Design</option>
          <option value="coding">Coding</option>
          <option value="music">Music</option>
          <option value="video">Video</option>
          <option value="study">Study</option>
          <option value="writing">Writing</option>
        </select>

        {/* Range */}
        <div className="flex items-center gap-1">
          <input
            className="w-16 bg-zinc-900 border border-zinc-800 rounded-xl px-2 py-2"
            value={filters.min}
            onChange={(e) => setFilters(prev => ({ ...prev, min: e.target.value.replace(/\D/g, "") }))}
          />
          <span className="text-zinc-500 text-sm">to</span>
          <input
            className="w-16 bg-zinc-900 border border-zinc-800 rounded-xl px-2 py-2"
            value={filters.max}
            onChange={(e) => setFilters(prev => ({ ...prev, max: e.target.value.replace(/\D/g, "") }))}
          />
          <span className="text-zinc-500 text-sm ml-1">👑</span>
        </div>

        {/* Sort */}
        <select
          className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2"
          value={filters.sort}
          onChange={(e) => setFilters(prev => ({ ...prev, sort: e.target.value }))}
        >
          <option value="newest">Newest</option>
          <option value="tokens">Tokens</option>
          <option value="reputation">Reputation</option>
          <option value="title">Title A–Z</option>
        </select>

        {/* Reset */}
        <button
          className="ml-auto px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-sm"
          onClick={onReset}
          title="Reset filters"
        >
          Reset
        </button>
      </div>

      {/* Row 2: tabs */}
      <div className="mt-3 flex flex-wrap gap-2">
        {["Open","In progress","Delivered","Done","Disputed"].map(tab => (
          <button
            key={tab}
            className={classNames(
              "px-3 py-2 rounded-xl border text-sm",
              filters.tab === tab
                ? "bg-zinc-100 text-zinc-900 border-zinc-100"
                : "bg-zinc-900 text-zinc-200 border-zinc-800 hover:bg-zinc-800"
            )}
            onClick={() => setFilters(prev => ({ ...prev, tab }))}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  );
}


/* ------------------------------ Files UI -------------------------------- */
function FileList({ files, onRemove }) {
  if (!files || files.length === 0) {
    return <div className="text-sm text-zinc-400">No files yet.</div>;
  }
  return (
    <div className="space-y-2">
      {files.map(f => (
        <div key={f.id} className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/60 px-3 py-2">
          <div className="text-sm text-zinc-200 truncate max-w-[60%]">
            <a href={f.url} target="_blank" rel="noreferrer" className="hover:underline">{f.name}</a>
            <span className="text-zinc-500 ml-2">({Math.ceil(f.size/1024)} KB)</span>
          </div>
          <button
            className="text-xs px-2 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
            onClick={() => onRemove(f.id)}
            title="Remove file"
          >
            Remove
          </button>
        </div>
      ))}
    </div>
  );
}

function FilePicker({ onPicked, buttonLabel="Add files" }) {
  const inputRef = useRef(null);
  const onClick = () => inputRef.current?.click();
  const onChange = (e) => {
    const chosen = Array.from(e.target.files || []);
    if (chosen.length === 0) return;
    onPicked(chosen);
    e.target.value = ""; // allow same-file reselect
  };
  return (
    <>
      <button
        className="px-3 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-black font-semibold"
        onClick={onClick}
      >
        {buttonLabel}
      </button>
      <input ref={inputRef} type="file" className="hidden" multiple onChange={onChange} />
    </>
  );
}


/* ------------------------------ Task Card ------------------------------- */
function TaskCard({
  task,
  onConfirm,
  onOpen,
  onAccept,
  onDeliver,
  filesForTask,
  onAddFiles,
  onRemoveFile
}) {
  const isInProgress = task.tab === "In progress";

  return (
    <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800 p-4 flex flex-col gap-4 hover:border-zinc-700 transition">
      {/* top row */}
      <div className="flex gap-4">
        <div className="flex-1">
          <div className="text-lg font-semibold">{task.title}</div>
          <div className="text-sm text-zinc-400 mt-1">{task.desc}</div>
          <div className="flex gap-2 mt-3 flex-wrap">
            {task.tags.map(t => <Tag key={t}>#{t}</Tag>)}
          </div>
          <div className="mt-3 flex items-center gap-3">
            <SmallBadge>📁 {task.category}</SmallBadge>
            <SmallBadge>⭐ {task.reputation.toFixed(1)}</SmallBadge>
            <SmallBadge>⏱ {task.eta}h</SmallBadge>
          </div>
        </div>

        {/* right column */}
        <div className="w-40 shrink-0 flex flex-col items-end justify-between">
          <div className="text-xl font-extrabold">{task.tokens} 👑</div>
          <div className="flex gap-2">
            <button
              className="mt-4 px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-sm"
              onClick={() => onOpen(task)}
            >
              View
            </button>

            {task.tab === "Open" && (
              <button
                className="mt-4 px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold"
                onClick={() => onAccept(task.id)}
                title="Accept this task"
              >
                Accept
              </button>
            )}

            {/* SINGLE Deliver button (top-right) */}
            {task.tab === "In progress" && (
              <button
                className="mt-4 px-3 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-semibold"
                onClick={() => onDeliver(task.id)}
                title="Deliver work to client"
              >
                Deliver
              </button>
            )}

            {task.tab === "Delivered" && (
              <button
                className="mt-4 px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold"
                onClick={() => onConfirm(task.id)}
              >
                Client confirm
              </button>
            )}

            {/* Only show text for Disputed; no redundant 'Done' label */}
            {task.tab === "Disputed" && (
              <div className="mt-4 text-sm text-zinc-400">{task.tab}</div>
            )}
          </div>
        </div>
      </div>

      {/* files area for In progress tasks (no Deliver button here) */}
      {isInProgress && (
        <div className="rounded-xl border border-zinc-800 bg-black/20 p-3">
          <div className="flex items-center justify-between gap-3">
            <div className="font-medium text-zinc-200">Files for this task</div>
            <FilePicker onPicked={(files) => onAddFiles(task.id, files)} />
          </div>
          <Divider />
          <FileList files={filesForTask || []} onRemove={(fid) => onRemoveFile(task.id, fid)} />
        </div>
      )}
    </div>
  );
}


function Modal({ open, onClose, title, children, footer }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(720px,92vw)]">
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5 shadow-2xl">
          <div className="flex items-start justify-between gap-4">
            <div className="text-xl font-semibold">{title}</div>
            <button
              onClick={onClose}
              className="h-9 w-9 rounded-xl border border-zinc-700 bg-black/20 grid place-items-center"
            >✖</button>
          </div>
          <Divider />
          <div className="max-h-[60vh] overflow-auto pr-1">{children}</div>
          {footer && (<><Divider /><div className="flex items-center justify-end gap-2">{footer}</div></>)}
        </div>
      </div>
    </div>
  );
}


/* ------------------------ Permanent Premium box ------------------------- */
function PremiumSpeechBox({ onClick }) {
  return (
    <button
      onClick={onClick}
      className={classNames(
        "group relative w-full rounded-2xl border-2 border-yellow-400/90",
        "bg-gradient-to-br from-yellow-400/20 via-amber-300/10 to-transparent",
        "shadow-[0_0_0_1px_rgba(250,204,21,0.8),0_0_20px_rgba(250,204,21,0.35)]",
        "px-5 py-4 text-left"
      )}
      style={{ fontFamily: '"Manrope","Inter",ui-sans-serif,system-ui' }}
      title="Go to Premium"
    >
      <div className="absolute -inset-1 rounded-2xl bg-yellow-400/10 blur-xl group-hover:bg-yellow-400/20 pointer-events-none"></div>
      <div className="relative">
        <div className="text-[13px] tracking-[.14em] text-yellow-300 font-extrabold">LIMITED BOOST</div>
        <div className="mt-1 text-[26px] leading-tight font-extrabold text-yellow-100">
          DOUBLE YOUR<br/>PROFITS FOR A<br/>WHOLE DAY.
        </div>
        <div className="mt-3 inline-flex items-center gap-2 text-[12px] text-zinc-300/90">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-yellow-300 animate-pulse"></span>
          Tap to learn more
        </div>
      </div>
    </button>
  );
}


function LiveTicker() {
  const [dots, setDots] = useState(".");
  useEffect(() => {
    const t = setInterval(() => setDots(d => d.length >= 3 ? "." : d + "."), 800);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800 px-4 py-3 text-sm text-zinc-300">
      Matching new gigs{dots}
    </div>
  );
}


/* ------------------------------ Data ------------------------------------ */
const SAMPLE_TASKS = [
  // confirmable / in progress seeds
  { id:1, tab:"Delivered", title:"Edit study vlog (8 min)", desc:"Color, subtitles, short intro.", tokens:16, tags:["video","edit","caption"], category:"video", reputation:4.6, eta:2 },
  { id:2, tab:"Delivered", title:"Short guitar riff", desc:"Funky 10-sec loop in A minor", tokens:12, tags:["music","guitar"], category:"music", reputation:4.2, eta:1 },
  { id:3, tab:"Delivered", title:"Poster layout for science fair", desc:"A3, bold headline, 3 columns", tokens:14, tags:["design","poster"], category:"design", reputation:4.7, eta:2 },
  // open etc
  { id:4, tab:"Open", title:"Logo for robotics club", desc:"Simple robot + initials", tokens:22, tags:["design","logo"], category:"design", reputation:4.8, eta:3 },
  { id:5, tab:"In progress", title:"Maths tutoring (A-level)", desc:"2 hour calculus revision", tokens:15, tags:["maths","tutor"], category:"study", reputation:4.9, eta:2 },
  { id:6, tab:"Open", title:"Fix React bug in todo app", desc:"Strange rerender loop", tokens:20, tags:["coding","react"], category:"coding", reputation:4.5, eta:3 },
  { id:7, tab:"Open", title:"Essay hook lines", desc:"3 alternatives", tokens:7, tags:["writing","hooks"], category:"writing", reputation:4.0, eta:1 },
  { id:8, tab:"In progress", title:"Color-grade drone footage", desc:"Cinematic teal/orange mood", tokens:18, tags:["video","grade"], category:"video", reputation:4.6, eta:2 },
  { id:9, tab:"Open", title:"CSS polish for landing page", desc:"Spacing, buttons, cards", tokens:12, tags:["coding","css"], category:"coding", reputation:4.4, eta:2 },
  { id:10, tab:"Done", title:"Sketch mascot for site", desc:"Black & white mascot", tokens:10, tags:["design","illustration"], category:"design", reputation:4.1, eta:1 },
  // more open for pagination
  { id:11, tab:"Open", title:"Thumbnail for vlog", desc:"Bold text, faces, subtle glow", tokens:9, tags:["design","thumbnail"], category:"design", reputation:4.2, eta:1 },
  { id:12, tab:"Open", title:"Python homework help", desc:"Loops and dicts", tokens:13, tags:["coding","python"], category:"coding", reputation:4.7, eta:2 },
  { id:13, tab:"Open", title:"Compose study lofi", desc:"60s loop, 80 BPM", tokens:8, tags:["music","lofi"], category:"music", reputation:4.0, eta:2 },
  { id:14, tab:"Open", title:"TikTok edit", desc:"Cut to beat, captions", tokens:12, tags:["video","shorts"], category:"video", reputation:4.3, eta:2 },
  { id:15, tab:"Open", title:"Biology flashcards", desc:"10 cards on enzymes", tokens:7, tags:["study","cards"], category:"study", reputation:3.9, eta:1 },
  { id:16, tab:"Open", title:"JS debugging", desc:"Find memory leak", tokens:18, tags:["coding","js"], category:"coding", reputation:4.6, eta:3 },
  { id:17, tab:"Open", title:"Poster icons", desc:"Flat 12 icons", tokens:14, tags:["design","icons"], category:"design", reputation:4.2, eta:2 },
  { id:18, tab:"Open", title:"Song mixdown", desc:"Balance vocals/bass", tokens:13, tags:["music","mix"], category:"music", reputation:4.1, eta:2 },
  { id:19, tab:"Open", title:"History essay plan", desc:"Intro + 3 paras", tokens:8, tags:["writing","plan"], category:"writing", reputation:4.4, eta:1 },
  { id:20, tab:"Open", title:"Geometry revision", desc:"Trigonometry basics", tokens:9, tags:["study","maths"], category:"study", reputation:4.5, eta:2 },
];


/* ------------------------------ Helpers --------------------------------- */
function applyFilters(tasks, f) {
  let out = tasks.slice();

  // status tab
  out = out.filter(t => {
    if (f.tab === "Open") return t.tab === "Open";
    if (f.tab === "In progress") return t.tab === "In progress";
    if (f.tab === "Delivered") return t.tab === "Delivered";
    if (f.tab === "Done") return t.tab === "Done";
    if (f.tab === "Disputed") return t.tab === "Disputed";
    return true;
  });

  // category
  if (f.category !== "all") out = out.filter(t => t.category === f.category);

  // token range
  const min = parseInt(f.min || "0", 10);
  const max = parseInt(f.max || "60", 10);
  out = out.filter(t => t.tokens >= min && t.tokens <= max);

  // sort
  if (f.sort === "tokens") out.sort((a,b)=>b.tokens-a.tokens);
  if (f.sort === "newest") out.sort((a,b)=>b.id-a.id);
  if (f.sort === "reputation") out.sort((a,b)=>b.reputation-a.reputation);
  if (f.sort === "title") out.sort((a,b)=>a.title.localeCompare(b.title));

  return out;
}
function paginate(items, page, perPage) {
  const total = items.length;
  const pages = Math.max(1, Math.ceil(total/perPage));
  const start = (page-1)*perPage;
  const end = start+perPage;
  return { page, pages, total, slice: items.slice(start,end) };
}


/* ------------------------------ Page ------------------------------------ */
function Marketplace() {
  const [app] = useAppState();

  // default tab = Open
  const [filters, setFilters] = useState({
    category: "all",
    min: "0",
    max: "60",
    sort: "newest",
    tab: "Open",
  });
  const [page, setPage] = useState(1);
  const PER_PAGE = 6;

  const onReset = () => {
    setFilters({ category:"all", min:"0", max:"60", sort:"newest", tab:"Open" });
    setPage(1);
  };

  const filtered = useMemo(() => applyFilters(SAMPLE_TASKS, filters), [filters]);
  const { slice, pages, total } = useMemo(() => paginate(filtered, page, PER_PAGE), [filtered, page]);

  // counters (recompute so list reflects status moves)
  const counters = useMemo(() => {
    const all = SAMPLE_TASKS;
    return {
      open: all.filter(t=>t.tab==="Open").length,
      inprog: all.filter(t=>t.tab==="In progress").length,
      delivered: all.filter(t=>t.tab==="Delivered").length,
      done: all.filter(t=>t.tab==="Done").length,
    };
  }, [filtered, page]);

  // details modal
  const [selected, setSelected] = useState(null);

  // global helpers for files / my accepted
  const state = getState();
  const myAccepted = new Set(state.myAccepted || []);
  const taskFiles = state.taskFiles || {};

  function addFilesToTask(taskId, files) {
    setState(prev => {
      const now = Date.now();
      const newEntries = files.map((f, i) => ({
        id: `${taskId}-${now}-${i}`,
        name: f.name,
        size: f.size,
        url: URL.createObjectURL(f),
        addedAt: now
      }));
      const current = (prev.taskFiles && prev.taskFiles[taskId]) || [];
      return {
        ...prev,
        taskFiles: {
          ...(prev.taskFiles || {}),
          [taskId]: [...current, ...newEntries]
        }
      };
    });
    bus.emit("toast", { icon:"📎", title:"Files attached", body:`Added ${files.length} file${files.length>1?"s":""}.` });
  }

  function removeFileFromTask(taskId, fileId) {
    setState(prev => {
      const current = (prev.taskFiles && prev.taskFiles[taskId]) || [];
      const item = current.find(x => x.id === fileId);
      if (item?.url) URL.revokeObjectURL(item.url);
      return {
        ...prev,
        taskFiles: {
          ...(prev.taskFiles || {}),
          [taskId]: current.filter(x => x.id !== fileId)
        }
      };
    });
  }

  // Accept: Open → In progress + add to myAccepted
  function onAccept(taskId) {
    const idx = SAMPLE_TASKS.findIndex(t => t.id === taskId);
    if (idx < 0) return;
    if (SAMPLE_TASKS[idx].tab !== "Open") {
      bus.emit("toast", { icon:"ℹ️", title:"Already accepted", body:"This task is not currently open." });
      return;
    }
    SAMPLE_TASKS[idx].tab = "In progress";
    setState(prev => ({
      ...prev,
      myAccepted: Array.from(new Set([...(prev.myAccepted || []), taskId]))
    }));
    bus.emit("toast", { icon:"✅", title:"Task accepted", body:"You’re now working on this task." });
  }

  // cadence: show global premium nudge at 3, then every +5
  function maybeTriggerPremiumReminder(nextCompletedJobs) {
    if (nextCompletedJobs === 3) {
      setState(prev => ({ ...prev, premiumHintDismissed: false }));
      return;
    }
    if (nextCompletedJobs > 3 && (nextCompletedJobs - 3) % 5 === 0) {
      setState(prev => ({ ...prev, premiumHintDismissed: false }));
    }
  }

  // Deliver: In progress → Delivered + (NOW) bump completedJobs + trigger premium
  function onDeliver(taskId) {
    const idx = SAMPLE_TASKS.findIndex(t => t.id === taskId);
    if (idx < 0) return;
    if (SAMPLE_TASKS[idx].tab !== "In progress") {
      bus.emit("toast", { icon:"ℹ️", title:"Cannot deliver", body:"Only in-progress tasks can be delivered." });
      return;
    }
    SAMPLE_TASKS[idx].tab = "Delivered";

    let nextCompleted = 0;
    setState(prev => {
      const updated = {
        ...prev,
        // 🔑 Move the 'completed' cadence driver to DELIVER:
        completedJobs: (prev.completedJobs || 0) + 1
      };
      nextCompleted = updated.completedJobs;
      return updated;
    });

    // Premium cadence / hint only checks completedJobs — trigger it now.
    maybeTriggerPremiumReminder(nextCompleted);

    // Optional “activated” flag for any UI that watches it
    setState(prev => ({ ...prev, premiumActivated: true, premiumLastTrigger: "deliver" }));

    bus.emit("toast", { icon:"📦", title:"Delivered", body:"Work sent to client. Awaiting confirmation." });
  }

  // Confirm: Delivered → Done (NO premium, NO completedJobs bump anymore)
  const onConfirm = (taskId) => {
    const idx = SAMPLE_TASKS.findIndex(t => t.id === taskId);
    if (idx >= 0) SAMPLE_TASKS[idx].tab = "Done";

    // Keep tokens on confirm, as before
    setState(prev => ({
      ...prev,
      tokens: (prev.tokens || 0) + 1,
    }));

    bus.emit("toast", { icon:"✅", title:"Job confirmed", body:"Great work! Progress saved." });
  };

  const goPremium = () => { setState(s=>s); bus.emit("nav","Premium"); };

  const empty = slice.length === 0;

  return (
    <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* Left */}
      <div className="xl:col-span-2 space-y-6">
        <FilterBar filters={filters} setFilters={setFilters} onReset={onReset} />

        {/* Counters */}
        <div className="grid grid-cols-4 gap-3">
          <Kpi label="Open" value={counters.open} />
          <Kpi label="In progress" value={counters.inprog} />
          <Kpi label="Delivered" value={counters.delivered} />
          <Kpi label="Done" value={counters.done} />
        </div>

        {/* Results */}
        <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800 p-4">
          {!empty ? (
            <div className="space-y-4">
              {slice.map(t => (
                <TaskCard
                  key={t.id}
                  task={t}
                  onConfirm={onConfirm}
                  onOpen={setSelected}
                  onAccept={onAccept}
                  onDeliver={onDeliver}
                  filesForTask={taskFiles[t.id]}
                  onAddFiles={addFilesToTask}
                  onRemoveFile={removeFileFromTask}
                />
              ))}

              {/* pagination */}
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-zinc-400">
                  Showing <span className="text-zinc-200">{slice.length}</span> of{" "}
                  <span className="text-zinc-200">{total}</span> tasks
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="px-3 py-2 rounded-xl bg-zinc-800 text-zinc-200 disabled:opacity-40"
                    onClick={() => setPage(p => Math.max(1, p-1))}
                    disabled={page<=1}
                  >Prev</button>
                  <div className="text-sm text-zinc-300">{page} / {Math.max(1, Math.ceil(total/PER_PAGE))}</div>
                  <button
                    className="px-3 py-2 rounded-xl bg-zinc-800 text-zinc-200 disabled:opacity-40"
                    onClick={() => setPage(p => Math.min(Math.max(1, Math.ceil(total/PER_PAGE)), p+1))}
                    disabled={page>=Math.max(1, Math.ceil(total/PER_PAGE))}
                  >Next</button>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-16 text-center text-zinc-400">
              <div className="text-4xl mb-2">😯</div>
              No results<br/>
              <span className="text-sm">Try changing category, tokens, or status.</span>
            </div>
          )}
        </div>
      </div>

      {/* Right */}
      <aside className="space-y-4">
        <PremiumSpeechBox onClick={goPremium} />
        <LiveTicker />

        {/* Trending tags */}
        <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800 p-4">
          <SectionTitle>Trending tags</SectionTitle>
          <div className="mt-3 flex flex-wrap gap-2">
            {["logo","essay","bugfix","maths","video","guitar","poster","shorts","uiux","python","react"].map(t =>
              <Tag key={t}>#{t}</Tag>
            )}
          </div>
        </div>

        {/* Top helpers */}
        <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800 p-4">
          <SectionTitle>Top helpers</SectionTitle>
          <div className="mt-3 space-y-3">
            {[
              {name:'Alex M.', skill:'Design • Writing', rep:4.9, tokens:420},
              {name:'Omar J.', skill:'Coding • CSS', rep:4.8, tokens:378},
              {name:'Maya A.', skill:'Writing • Editing', rep:4.8, tokens:355},
              {name:'Rhea P.', skill:'Music • Sound', rep:4.7, tokens:330},
            ].map((h,i)=>(
              <div key={i} className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{h.name}</div>
                  <div className="text-xs text-zinc-400">{h.skill}</div>
                </div>
                <div className="flex items-center gap-2">
                  <StatBadge icon="⭐">{h.rep}</StatBadge>
                  <StatBadge icon="👑">{h.tokens}</StatBadge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Modal */}
      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected ? selected.title : ""}
        footer={
          selected && (
            <>
              <button
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-100"
                onClick={() => setSelected(null)}
              >Close</button>

              {selected.tab === "Open" && (
                <button
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold"
                  onClick={() => { onAccept(selected.id); setSelected(null); }}
                >
                  Accept task
                </button>
              )}

              {selected.tab === "In progress" && (
                <button
                  className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-semibold"
                  onClick={() => { onDeliver(selected.id); setSelected(null); }}
                >
                  Deliver work
                </button>
              )}

              {selected.tab === "Delivered" && (
                <button
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold"
                  onClick={() => { onConfirm(selected.id); setSelected(null); }}
                >
                  Client confirm (+1 👑)
                </button>
              )}
            </>
          )
        }
      >
        {selected && (
          <div className="space-y-3">
            <div className="text-sm text-zinc-300">{selected.desc}</div>
            <div className="flex gap-2 flex-wrap">{selected.tags.map(t => <Tag key={t}>#{t}</Tag>)}</div>
            <div className="flex items-center gap-3 text-sm text-zinc-300">
              <SmallBadge>Category: {selected.category}</SmallBadge>
              <SmallBadge>Reputation: {selected.reputation.toFixed(1)}</SmallBadge>
              <SmallBadge>ETA: {selected.eta}h</SmallBadge>
            </div>

            {selected.tab === "In progress" && (
              <>
                <Divider />
                <div className="flex items-center justify-between">
                  <div className="font-medium text-zinc-200">Files for this task</div>
                  <FilePicker onPicked={(files) => addFilesToTask(selected.id, files)} />
                </div>
                <Divider />
                <FileList
                  files={(getState().taskFiles || {})[selected.id] || []}
                  onRemove={(fid) => removeFileFromTask(selected.id, fid)}
                />
              </>
            )}

            <Divider />
            <div className="text-sm text-zinc-400">
              Escrow: tokens release on approval or auto-release after 24h.
            </div>
          </div>
        )}
      </Modal>
    </section>
  );
}

window.Marketplace = Marketplace;
