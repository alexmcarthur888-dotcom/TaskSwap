/* src/pages/Community.js */
/* global React */

/**
 * Community Page
 * - Feed of posts (with like button)
 * - Ability to write a new post (if unlocked)
 * - Trending tags sidebar
 * - LockButton ensures posting is disabled until Starter Task 3 is done
 */

const { useState } = React;

function LockButton({ locked, onClick, className = "", children }) {
  return (
    <div className="relative group inline-block">
      <button
        disabled={locked}
        onClick={locked ? undefined : onClick}
        className={[
          "relative overflow-hidden px-4 py-2 rounded-xl",
          locked ? "opacity-60 grayscale cursor-not-allowed" : "bg-white text-black font-semibold hover:bg-zinc-200",
          className,
        ].join(" ")}
        title={locked ? "complete starter tasks to unlock" : undefined}
      >
        {children}
      </button>
      {locked && (
        <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-max max-w-[220px] px-3 py-1.5 rounded-lg bg-zinc-800 text-white text-xs shadow-lg opacity-0 group-hover:opacity-100 transition pointer-events-none">
          complete starter tasks to unlock
        </div>
      )}
    </div>
  );
}

function Tag({ children }) {
  return (
    <span className="inline-flex items-center rounded-full border border-zinc-200 dark:border-zinc-700 px-2 py-0.5 text-[11px] uppercase tracking-wide text-zinc-600 dark:text-zinc-300">
      {children}
    </span>
  );
}

function Community({ locked }) {
  const [posts, setPosts] = useState([
    { id: 1, user: "Maya", text: "Just finished a logo for a class project — happy to swap for essay feedback!", likes: 2 },
    { id: 2, user: "James", text: "Anyone good with coding? Need help debugging a small JS app.", likes: 5 },
    { id: 3, user: "Sofia", text: "Offering quick video editing (shorts, transitions). DM me!", likes: 1 },
  ]);
  const [draft, setDraft] = useState("");

  function addPost() {
    if (!draft.trim()) return;
    setPosts([{ id: Date.now(), user: "You", text: draft.trim(), likes: 0 }, ...posts]);
    setDraft("");
  }

  function toggleLike(id) {
    setPosts((ps) =>
      ps.map((p) => (p.id === id ? { ...p, likes: (p.likes || 0) + 1 } : p))
    );
  }

  return (
    <section className="grid lg:grid-cols-[2fr_1fr] gap-8">
      {/* Feed */}
      <div className="space-y-6">
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6">
          <h3 className="font-semibold text-white">Post to feed</h3>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={3}
            placeholder="Share progress, ask for help, or start a challenge…"
            className="mt-3 w-full rounded-xl border border-zinc-700 bg-zinc-800 text-zinc-100 placeholder-zinc-400 px-3 py-2"
          />
          <div className="mt-3 flex justify-end">
            <LockButton locked={locked} onClick={addPost}>
              Post
            </LockButton>
          </div>
        </div>

        <div className="space-y-4">
          {posts.map((p) => (
            <div
              key={p.id}
              className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4"
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-indigo-600 text-white font-bold grid place-items-center">
                  {p.user[0]}
                </div>
                <div className="font-semibold text-white">{p.user}</div>
              </div>
              <p className="mt-2 text-sm text-zinc-300">{p.text}</p>
              <div className="mt-2">
                <button
                  onClick={() => toggleLike(p.id)}
                  className="text-sm text-zinc-400 hover:text-white"
                >
                  ❤️ {p.likes}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sidebar */}
      <aside className="space-y-6">
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6">
          <h3 className="font-semibold text-white">Trending tags</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {["logo", "essay", "bugfix", "maths", "video", "guitar"].map((t) => (
              <Tag key={t}>#{t}</Tag>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6">
          <h3 className="font-semibold text-white">Tips</h3>
          <p className="text-sm text-zinc-400 mt-2">
            Share progress updates or small wins. Be specific with what you’re asking for
            and what you’re offering.
          </p>
        </div>
      </aside>
    </section>
  );
}
