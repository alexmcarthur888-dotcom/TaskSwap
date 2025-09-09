/* src/pages/StarterTasks.js */
/* global React */

/**
 * StarterTasks (full-fat)
 * Props:
 *  - tasks: array of {id,title,desc,done}
 *  - setTasks: (updater) => void
 *  - notify: ({icon,title,body}) => void
 *
 * Behavior:
 *  - ✅ NO per-task token award.
 *  - App (main.js) will award +1 token when ALL tasks are done.
 *  - UI copy updated to reflect single final reward.
 */

const { useState } = React;

function Badge({ children }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-200 px-3 py-1 text-xs font-medium">
      {children}
    </span>
  );
}

function StarterTasks({ tasks, setTasks, notify }) {
  const complete = (id) => {
    setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, done: true } : t)));
    const remaining = tasks.filter((t) => !t.done && t.id !== id).length;
    notify?.({
      icon: "✅",
      title: "Starter task checked off",
      body: remaining
        ? `${remaining} starter task${remaining > 1 ? "s" : ""} left`
        : "All starter tasks complete!",
    });
  };

  return (
    <section className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6">
      <h2 className="text-xl font-bold text-white">Starter Tasks</h2>
      <p className="text-sm text-zinc-300 mt-1">
        Complete the 3 starter tasks to unlock everything.{" "}
        <span className="text-white font-semibold">
          You’ll receive 1 👑 token once all three are complete.
        </span>
      </p>

      <div className="mt-4 grid md:grid-cols-3 gap-4">
        {tasks.map((t) => (
          <div key={t.id} className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 flex flex-col">
            <div className="text-sm text-zinc-400">~1 hour</div>
            <div className="mt-1 font-semibold text-white">{t.title}</div>
            <p className="mt-1 text-sm text-zinc-300">{t.desc}</p>

            <div className="mt-auto pt-3 flex items-center justify-between">
              <Badge>Final reward: 1 👑 when all done</Badge>
              {t.done ? (
                <span className="text-emerald-400 font-semibold">Done</span>
              ) : (
                <button
                  onClick={() => complete(t.id)}
                  className="px-3 py-2 rounded-xl bg-white text-black text-sm font-semibold"
                >
                  Mark done
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 text-xs text-zinc-400">
        Tip: Finishing “Complete your profile” will unlock the “Post Task” tab early.
      </div>
    </section>
  );
}
