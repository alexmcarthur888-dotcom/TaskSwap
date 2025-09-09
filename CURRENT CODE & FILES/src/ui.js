/* src/ui.js */
/* global React */
const { useEffect, useState } = React;

/* ------------------------- Event bus ------------------------- */
(function setupBus(){
  const listeners = {};
  window.bus = {
    on(evt, fn){ (listeners[evt] ||= new Set()).add(fn); return () => listeners[evt].delete(fn); },
    emit(evt, payload){ (listeners[evt]||[]).forEach(fn => fn(payload)); },
  };
})();

/* ------------------------- Persistent state ------------------------- */
/**
 * We bumped LS_KEY → v4 to force a clean slate.
 * This clears any old completedJobs that were making the Premium tab outline on first load.
 */
const LS_KEY = 'taskswap_state_v4';

const defaultState = {
  tokens: 121,
  reputation: 4.7,
  streak: 6,
  completedJobs: 0,          // counts "Client confirm" presses in Marketplace
  premiumHintDismissed: false,
  starterTasks: [
    { id:"s1", title:"Complete your profile", done:false },
    { id:"s2", title:"Post your first task", done:false },
    { id:"s3", title:"Reply in the community", done:false },
  ],
  starterRewarded: false,    // +1 👑 after all three are done (awarded once)
};

function loadState(){
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw);

    // Merge with defaults to keep forward-compat in case we add keys later
    const merged = {
      ...defaultState,
      ...parsed,
      starterTasks: Array.isArray(parsed.starterTasks) ? parsed.starterTasks : defaultState.starterTasks
    };

    // Safety: ensure counters are sane
    if (typeof merged.completedJobs !== 'number' || merged.completedJobs < 0) merged.completedJobs = 0;

    return merged;
  } catch(e){
    return defaultState;
  }
}
function saveState(s){ localStorage.setItem(LS_KEY, JSON.stringify(s)); }

let STATE = loadState();
window.getState = () => STATE;
window.setState = (patchOrFn) => {
  const next = typeof patchOrFn === 'function' ? patchOrFn(STATE) : { ...STATE, ...patchOrFn };
  STATE = next;
  saveState(STATE);
  bus.emit('state', STATE);
};
window.resetState = () => { STATE = defaultState; saveState(STATE); bus.emit('state', STATE); };

/* Allow quick resets from the URL for dev/testing: ?reset=1 */
(function maybeQueryReset(){
  try {
    const params = new URLSearchParams(location.search);
    if (params.get('reset') === '1') {
      window.resetState();
      console.info('[TaskSwap] State reset via ?reset=1');
    }
  } catch(e){}
})();

/* Convenient hook */
function useAppState(){
  const [s, setS] = useState(getState());
  useEffect(() => bus.on('state', setS), []);
  return [s, setState];
}

/* ------------------------- Shared UI helpers ------------------------- */
const classNames = (...xs) => xs.filter(Boolean).join(' ');
const currency = (n) => `${n} 👑`;

function Pill({children}) {
  return <span className="px-2.5 py-1 rounded-full bg-zinc-100/10 text-zinc-300 text-xs">{children}</span>;
}
function Tag({children}) {
  return <span className="inline-flex items-center rounded-full border border-zinc-700 px-2 py-0.5 text-[11px] uppercase tracking-wide text-zinc-300">{children}</span>;
}
function StatBadge({icon, children}) {
  return (
    <span className="inline-flex items-center gap-1 rounded-lg bg-zinc-800/70 border border-zinc-700 px-2 py-1 text-sm">
      <span className="opacity-80">{icon}</span>
      <span>{children}</span>
    </span>
  );
}

/* ------------------------- Premium visual helpers ------------------------- */
/**
 * Visual thresholds:
 *  - 0 confirms  → no outline/glow
 *  - 1 confirm   → outline
 *  - 2+ confirms → glow
 *  - 3+ confirms → Marketplace shows the sidebar speech box (handled there)
 */
function usePremiumVisual(state){
  const n = Number(state.completedJobs) || 0;
  const outline = n >= 1;
  const glow    = n >= 2;
  const bubble  = n >= 3 && !state.premiumHintDismissed;
  return { outline, glow, bubble };
}

/* Expose for other modules */
window.UI = { classNames, currency, Pill, Tag, StatBadge, useAppState, usePremiumVisual };
