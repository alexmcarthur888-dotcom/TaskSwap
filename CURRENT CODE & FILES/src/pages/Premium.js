/* src/pages/Premium.js */
/* global React, bus */

const { useMemo, useState, useEffect } = React;

function gbp(n) {
  const v = Math.round(n * 100) / 100;
  return "£" + (Number.isInteger(v) ? v.toString() : v.toFixed(2));
}
function toastOrAlert(payload) {
  if (typeof bus !== "undefined" && bus?.emit) {
    bus.emit("toast", payload);
  } else {
    alert(`${payload.title}${payload.body ? ` — ${payload.body}` : ""}`);
  }
}
const SUB_DISCOUNT = { None: 0, Bronze: 5, Silver: 10, Gold: 20, Platinum: 30 };

function ensureAuroraCSS() {
  if (document.getElementById("premium-aurora-css")) return;
  const css = `
  .glow-aurora{position:relative;border-radius:1.5rem;z-index:0}
  .glow-aurora::before{
    content:"";
    position:absolute;
    inset:0;
    border-radius:inherit;
    padding:2px;
    background:
      linear-gradient(90deg,
        rgba(34,211,238,0.95),
        rgba(59,130,246,0.95),
        rgba(168,85,247,0.95),
        rgba(244,114,182,0.95),
        rgba(250,204,21,0.95),
        rgba(45,212,191,0.95),
        rgba(34,211,238,0.95));
    background-size:200% 100%;
    animation:auroraFlow 8s linear infinite;
    -webkit-mask:
      linear-gradient(#000 0 0) content-box,
      linear-gradient(#000 0 0);
    -webkit-mask-composite:xor;
            mask-composite:exclude;
    pointer-events:none;
    z-index:2;
  }
  .glow-aurora::after{
    content:"";
    position:absolute;
    inset:-18px;
    border-radius:inherit;
    pointer-events:none;
    background:
      radial-gradient(60% 60% at 20% 20%, rgba(34,211,238,0.40), transparent 60%),
      radial-gradient(60% 60% at 80% 30%, rgba(168,85,247,0.36), transparent 65%),
      radial-gradient(60% 60% at 40% 80%, rgba(250,204,21,0.30), transparent 65%),
      radial-gradient(60% 60% at 75% 75%, rgba(45,212,191,0.36), transparent 65%);
    filter: blur(38px);
    opacity: .90;
    animation: auroraFlow 10s linear infinite reverse;
    z-index:1;
  }
  .glow-aurora > .panel{
    position:relative;
    border-radius:inherit;
    overflow:hidden;
    z-index:3;
  }
  @keyframes auroraFlow{
    0%{background-position:0% 50%}
    100%{background-position:200% 50%}
  }`;
  const style = document.createElement("style");
  style.id = "premium-aurora-css";
  style.textContent = css;
  document.head.appendChild(style);
}

const bronzeGlow = "border-amber-900 shadow-[0_0_26px_rgba(120,53,15,0.65)] ring-1 ring-amber-900/70";
const silverGlow = "border-slate-300 shadow-[0_0_26px_rgba(192,192,192,0.55)] ring-1 ring-slate-200/70";
const goldGlow = "border-yellow-400 shadow-[0_0_34px_rgba(255,215,0,0.65)] ring-1 ring-yellow-300/80";
const platinumGlow = "border-fuchsia-300 shadow-[0_0_34px_rgba(217,70,239,0.65)] ring-1 ring-fuchsia-300/80";

function BoostCard({ tier, basePrice, hours, multiplier, glowClass, subTier, onChoose }) {
  const subDiscount = SUB_DISCOUNT[subTier] || 0;
  const discounted = basePrice * (1 - subDiscount / 100);
  const accentText = tier === "Bronze" ? "text-amber-300" : tier === "Silver" ? "text-slate-200" : "text-yellow-300";

  return (
    <div className={["relative rounded-3xl border-2 bg-zinc-900/50 p-6 text-center transition shadow-lg", glowClass].join(" ")}>
      <div
        className="pointer-events-none absolute -inset-1 rounded-3xl blur-xl opacity-50"
        style={{
          background:
            tier === "Bronze"
              ? "radial-gradient(60% 60% at 50% 0%, rgba(120,53,15,.25), transparent 70%)"
              : tier === "Silver"
              ? "radial-gradient(60% 60% at 50% 0%, rgba(192,192,192,.20), transparent 70%)"
              : "radial-gradient(60% 60% at 50% 0%, rgba(255,215,0,.25), transparent 70%)",
        }}
        aria-hidden
      />
      <div className="relative">
        <h3 className={["text-xl font-extrabold", accentText].join(" ")}>{tier} Boost</h3>
        <div className="mt-2">
          {subDiscount ? (
            <div className="flex items-center justify-center gap-2">
              <span className="text-zinc-400 line-through">{gbp(basePrice)}</span>
              <span className="text-2xl font-black text-white">{gbp(discounted)}</span>
              <span className="text-xs text-emerald-400 font-semibold">-{subDiscount}% with {subTier}</span>
            </div>
          ) : (
            <div className="text-2xl font-black text-white">{gbp(basePrice)}</div>
          )}
        </div>
        <div className="mt-1 text-sm text-zinc-300">{multiplier} tokens for <span className="font-semibold">{hours} hours</span></div>
        <ul className="mt-4 text-sm text-zinc-300 space-y-1">
          <li className="flex items-center gap-2 justify-center"><span className="h-2 w-2 rounded-full bg-white/60 inline-block" />High-impact short burst</li>
          <li className="flex items-center gap-2 justify-center"><span className="h-2 w-2 rounded-full bg-white/60 inline-block" />Activates immediately</li>
        </ul>
        <button
          className="mt-6 w-full px-4 py-2 rounded-xl bg-white text-black font-semibold hover:bg-zinc-200 focus:outline-none focus:ring-2 focus:ring-white/50"
          onClick={() => onChoose({ tier, price: discounted, hours, multiplier })}
        >
          Buy Boost
        </button>
      </div>
    </div>
  );
}

function SubCard({ tier, pricePerMonth, perks, glowClass, activeSub, setActiveSub }) {
  const accentText = tier === "Bronze" ? "text-amber-300" : tier === "Silver" ? "text-slate-200" : tier === "Gold" ? "text-yellow-300" : "text-fuchsia-300";
  const current = activeSub === tier;

  return (
    <div className={["relative rounded-3xl border-2 bg-zinc-900/50 p-6 text-center transition shadow-lg flex flex-col", glowClass].join(" ")} style={{ minHeight: 420 }}>
      <div
        className="pointer-events-none absolute -inset-1 rounded-3xl blur-xl opacity-50"
        style={{
          background:
            tier === "Bronze"
              ? "radial-gradient(60% 60% at 50% 0%, rgba(120,53,15,.20), transparent 70%)"
              : tier === "Silver"
              ? "radial-gradient(60% 60% at 50% 0%, rgba(192,192,192,.18), transparent 70%)"
              : tier === "Gold"
              ? "radial-gradient(60% 60% at 50% 0%, rgba(255,215,0,.22), transparent 70%)"
              : "radial-gradient(60% 60% at 50% 0%, rgba(217,70,239,.22), transparent 70%)",
        }}
        aria-hidden
      />
      <div className="relative">
        <h3 className={["text-xl font-extrabold", accentText].join(" ")}>{tier} Subscription</h3>
        <div className="mt-1 text-2xl font-black text-white">{gbp(pricePerMonth)} <span className="text-sm font-normal text-zinc-300">/ month</span></div>
        <ul className="mt-4 text-sm text-zinc-300 space-y-1 text-left max-w-xs mx-auto">
          {perks.map((p, i) => (
            <li key={i} className="flex items-start gap-2"><span className="mt-[6px] h-2 w-2 rounded-full bg-white/60 inline-block shrink-0" /><span>{p}</span></li>
          ))}
        </ul>
      </div>
      <div className="grow" />
      <div className="relative">
        <button
          className={"w-full px-4 py-2 rounded-xl font-semibold focus:outline-none focus:ring-2 " + (current ? "bg-emerald-400 text-black hover:bg-emerald-300 focus:ring-emerald-300/60" : "bg-white text-black hover:bg-zinc-200 focus:ring-white/50")}
          onClick={() => {
            const next = current ? "None" : tier;
            setActiveSub(next);
            toastOrAlert({
              icon: "💳",
              title: current ? `${tier} subscription canceled` : `${tier} subscription active`,
              body: current ? "Discounts removed" : `${gbp(pricePerMonth)}/month — discounts now apply to boosts & Premium Time`,
            });
          }}
        >
          {current ? "Cancel subscription" : "Subscribe"}
        </button>
        <div className="mt-2 text-xs text-zinc-500">Auto-renewing. Cancel anytime.</div>
      </div>
    </div>
  );
}

function PremiumTimeSlider({ subTier }) {
  useEffect(() => { ensureAuroraCSS(); }, []);
  const [months, setMonths] = useState(6);
  const dynamicMinPercent = months >= 12 ? 10 : 15;
  const [percent, setPercent] = useState(15);

  useEffect(() => { setPercent((p) => (p < dynamicMinPercent ? dynamicMinPercent : p)); }, [months]);

  const { termDiscountPct, subDiscountPct, total } = useMemo(() => {
    const basePerTenPct = 5;
    const steps = percent / 10;
    const baseMonthly = steps * basePerTenPct;
    let termDiscountPct = 0;
    if (months >= 24) termDiscountPct = 35;
    else if (months >= 12) termDiscountPct = 20;
    else if (months >= 6) termDiscountPct = 10;
    const preDiscount = baseMonthly * months;
    const afterTerm = preDiscount * (1 - termDiscountPct / 100);
    const subDiscountPct = SUB_DISCOUNT[subTier] || 0;
    const total = afterTerm * (1 - subDiscountPct / 100);
    return { termDiscountPct, subDiscountPct, total };
  }, [percent, months, subTier]);

  const onActivate = () => toastOrAlert({ icon: "💫", title: "Premium Time activated", body: `${percent}% for ${months} month${months > 1 ? "s" : ""} — ${gbp(total)}` });

  return (
    <div className="glow-aurora">
      <div className="panel rounded-3xl border-2 border-zinc-100/10 bg-zinc-900/60 p-6 shadow-[0_0_46px_rgba(0,0,0,0.35)] relative">
        <h3 className="text-lg font-semibold text-white">Premium Time — Custom Long-Term Bonus</h3>
        <p className="text-sm text-zinc-300 mt-1">
          Minimum commitment is <span className="font-semibold text-white">6 months</span>. +10% bonuses unlock only with{" "}
          <span className="font-semibold text-white">12 months or more</span>. For 6–11 months, the minimum is +15%.
        </p>

        <div className="mt-5 grid lg:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center justify-between">
              <label className="text-sm text-zinc-300">Token bonus</label>
              <div className="text-white font-semibold">{percent}%</div>
            </div>
            <input
              type="range"
              min={dynamicMinPercent}
              max={100}
              step={5}
              value={percent}
              onChange={(e) => setPercent(parseInt(e.target.value, 10))}
              className="w-full mt-2 accent-yellow-400"
            />
            <div className="flex justify-between text-xs text-zinc-400 mt-1">
              <span>+{dynamicMinPercent}% {months >= 12 ? "(min for ≥12m)" : "(min for 6–11m)"}</span>
              <span>+100% (2×)</span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="text-sm text-zinc-300">Duration</label>
              <div className="text-white font-semibold">{months} month{months > 1 ? "s" : ""}</div>
            </div>
            <input
              type="range"
              min={6}
              max={24}
              step={1}
              value={months}
              onChange={(e) => setMonths(parseInt(e.target.value, 10))}
              className="w-full mt-2 accent-yellow-400"
            />
            <div className="flex justify-between text-xs text-zinc-400 mt-1">
              <span>6 mo</span><span>24 mo</span>
            </div>
          </div>
        </div>

        <div className="mt-6 grid sm:grid-cols-4 gap-3 text-sm">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3">
            <div className="text-zinc-400">Base / month</div>
            <div className="text-white font-semibold">{gbp((percent / 10) * 5)}</div>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3">
            <div className="text-zinc-400">Term discount</div>
            <div className="text-white font-semibold">{termDiscountPct}%</div>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3">
            <div className="text-zinc-400">{subTier} sub discount</div>
            <div className="text-white font-semibold">{subDiscountPct}%</div>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3">
            <div className="text-zinc-400">Total</div>
            <div className="text-white font-extrabold">{gbp(total)}</div>
          </div>
        </div>

        <button
          className="mt-6 w-full px-4 py-3 rounded-2xl bg-yellow-400 text-black font-extrabold tracking-wide hover:bg-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-300/60"
          onClick={onActivate}
        >
          Activate Premium Time
        </button>
      </div>
    </div>
  );
}

function SparkleField() {
  const sparkles = [
    { top: "7%", left: "10%" },
    { top: "18%", left: "32%" },
    { top: "12%", left: "78%" },
    { top: "28%", left: "58%" },
    { top: "40%", left: "14%" },
    { top: "50%", left: "48%" },
    { top: "66%", left: "20%" },
    { top: "74%", left: "82%" },
    { top: "56%", left: "70%" },
    { top: "84%", left: "38%" },
  ];
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {sparkles.map((s, i) => (
        <span
          key={i}
          className="absolute text-yellow-300/90 animate-ping"
          style={{ top: s.top, left: s.left, animationDelay: `${i * 0.25}s`, animationDuration: "1.8s" }}
          aria-hidden
        >
          ✦
        </span>
      ))}
    </div>
  );
}

function Premium() {
  const [activeSub, setActiveSub] = useState("None");

  const boosts = [
    { tier: "Bronze", basePrice: 15, hours: 2, multiplier: "2×" },
    { tier: "Silver", basePrice: 25, hours: 4, multiplier: "2×" },
    { tier: "Gold", basePrice: 40, hours: 8, multiplier: "2×" },
  ];

  const subs = [
    { tier: "Bronze", pricePerMonth: 5, perks: ["+10% tokens on every job", "Bronze badge & profile flair", "5% discount on Boosts & Premium Time"], glow: bronzeGlow },
    { tier: "Silver", pricePerMonth: 12, perks: ["+20% tokens on every job", "Silver badge", "Priority listings", "Access to Premium-only tasks", "10% discount on Boosts & Premium Time"], glow: silverGlow },
    { tier: "Gold", pricePerMonth: 25, perks: ["+30% tokens on every job", "Gold badge + glowing border", "Front-page placement", "Exclusive Gold-only gigs", "1 free Silver Boost each month", "20% discount on Boosts & Premium Time"], glow: goldGlow },
    { tier: "Platinum", pricePerMonth: 50, perks: ["+40% tokens on every job", "Platinum badge with animated glow", "Highlighted profile", "1 free Gold Boost each month", "30% discount on Boosts & Premium Time", "Always-on 1.25× (caps at 2× with boosts)"], glow: platinumGlow },
  ];

  const chooseBoost = (b) =>
    toastOrAlert({
      icon: "⚡",
      title: `${b.tier} Boost purchased`,
      body: `${b.multiplier} for ${b.hours} hours — ${gbp(b.price ?? b.basePrice)}`,
    });

  return (
    <section className="relative p-5 md:p-7">
      <SparkleField />

      <h2 className="text-3xl font-black text-center text-yellow-400 mb-1">Premium Upgrades</h2>
      <p className="text-center text-sm text-zinc-300 mb-8">
        Boost your earnings and unlock exclusive perks.{" "}
        <span className="text-zinc-400">Premium never affects Top helpers — rankings are based on verified work only.</span>
      </p>

      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-3">One-off Boost Packages</h3>
        <div className="grid md:grid-cols-3 gap-6">
          {boosts.map((b) => (
            <BoostCard
              key={b.tier}
              tier={b.tier}
              basePrice={b.basePrice}
              hours={b.hours}
              multiplier={b.multiplier}
              subTier={activeSub}
              onChoose={chooseBoost}
              glowClass={b.tier === "Bronze" ? bronzeGlow : b.tier === "Silver" ? silverGlow : goldGlow}
            />
          ))}
        </div>
      </div>

      <div className="my-10">
        <h3 className="text-lg font-semibold text-white mb-3">Monthly Premium Accounts</h3>
        <div className="grid md:grid-cols-4 gap-6">
          {subs.map((s) => (
            <SubCard
              key={s.tier}
              tier={s.tier}
              pricePerMonth={s.pricePerMonth}
              perks={s.perks}
              glowClass={s.glow}
              activeSub={activeSub}
              setActiveSub={setActiveSub}
            />
          ))}
        </div>
      </div>

      <div className="my-6">
        <h3 className="text-lg font-semibold text-white mb-3">Premium Time (Flexible)</h3>
        <PremiumTimeSlider subTier={activeSub} />
      </div>

      <div className="mt-8 text-center text-sm text-zinc-400">
        Questions? See the <span className="text-yellow-300 font-medium">FAQ</span>.
      </div>
    </section>
  );
}

window.Premium = Premium;
