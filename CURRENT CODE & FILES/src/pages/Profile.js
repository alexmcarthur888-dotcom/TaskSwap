/* src/pages/Profile.js */
/* global React */

/**
 * Profile (full-fat)
 * - Avatar derived from name initial
 * - Editable name + bio
 * - Skills manager (add/remove, prevent duplicates)
 * - Availability editor
 * - Badges section
 * - Token & reputation pills from props
 * - Dark Tailwind styling to match the rest of the app
 *
 * Props:
 *  - myTokens: number
 *  - myReputation: number
 */

const { useState } = React;

function Pill({ children }) {
  return (
    <span className="px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 text-xs">
      {children}
    </span>
  );
}

function Badge({ children }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-200 px-3 py-1 text-xs font-medium">
      {children}
    </span>
  );
}

function Metric({ label, value, sub }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
      <div className="text-xs uppercase tracking-wide text-zinc-400">{label}</div>
      <div className="mt-1 text-2xl font-black text-white">{value}</div>
      {sub && <div className="text-xs text-zinc-400 mt-1">{sub}</div>}
    </div>
  );
}

function ListChip({ text, onRemove }) {
  return (
    <span className="px-3 py-1 rounded-full bg-indigo-600/90 text-white text-sm flex items-center gap-2">
      {text}
      <button
        onClick={onRemove}
        className="text-xs bg-black/20 px-1 rounded-full hover:bg-black/40"
        title="Remove"
      >
        ✕
      </button>
    </span>
  );
}

function Profile({ myTokens, myReputation }) {
  const [name, setName] = useState("Alex M.");
  const [location, setLocation] = useState("Brighton, UK");
  const [bio, setBio] = useState(
    "I love clean design, quick turnarounds, and helping classmates ship projects. DM me for logos, slide decks, and front-end tweaks!"
  );

  const [skills, setSkills] = useState(["Design", "Writing", "Coding"]);
  const [newSkill, setNewSkill] = useState("");

  const [availability, setAvailability] = useState({
    weekdays: "Mon–Fri: 6–9pm",
    saturday: "Sat: 10am–4pm",
    sunday: "Sun: Occasional",
  });

  const [badges, setBadges] = useState([
    "Rising Talent",
    "Trusted",
    "100+ hrs",
    "Early Adopter",
  ]);

  const [links, setLinks] = useState([
    { label: "Portfolio", url: "https://example.com" },
    { label: "GitHub", url: "https://github.com/username" },
  ]);

  function avatarLetter() {
    return (name && name.trim()[0] ? name.trim()[0] : "U").toUpperCase();
  }

  function addSkill() {
    const s = newSkill.trim();
    if (!s) return;
    if (skills.some((x) => x.toLowerCase() === s.toLowerCase())) {
      setNewSkill("");
      return;
    }
    setSkills([...skills, s]);
    setNewSkill("");
  }

  function removeSkill(s) {
    setSkills(skills.filter((x) => x !== s));
  }

  function updateLink(i, key, val) {
    setLinks((ls) => ls.map((l, idx) => (idx === i ? { ...l, [key]: val } : l)));
  }

  function addLink() {
    setLinks([...links, { label: "", url: "" }]);
  }

  function removeLink(i) {
    setLinks((ls) => ls.filter((_, idx) => idx !== i));
  }

  return (
    <section className="grid xl:grid-cols-3 gap-6">
      {/* LEFT COLUMN: Identity card */}
      <div className="xl:col-span-1 rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 text-white grid place-items-center font-black text-2xl shadow-lg">
            {avatarLetter()}
          </div>
          <div className="flex-1">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-lg font-bold bg-transparent text-white border-b border-transparent focus:border-zinc-700 outline-none"
              aria-label="Name"
            />
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full text-sm bg-transparent text-zinc-300 border-b border-transparent focus:border-zinc-700 outline-none mt-1"
              aria-label="Location"
            />
          </div>
        </div>

        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={4}
          className="mt-4 w-full rounded-xl border border-zinc-700 bg-zinc-800 text-sm text-zinc-200 p-3"
          aria-label="Bio"
        />

        <div className="mt-4 flex flex-wrap gap-2">
          <Pill>{myTokens} 👑</Pill>
          <Pill>⭐ {Number.isFinite(myReputation) ? myReputation.toFixed(1) : "—"}</Pill>
        </div>

        {/* Quick metrics */}
        <div className="mt-6 grid grid-cols-3 gap-3">
          <Metric label="Completed" value="24" sub="tasks" />
          <Metric label="On-time" value="96%" sub="delivery" />
          <Metric label="Streak" value="🔥 6" sub="days" />
        </div>
      </div>

      {/* RIGHT COLUMN: Details */}
      <div className="xl:col-span-2 space-y-6">
        {/* Skills */}
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-white">Skills</h3>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {skills.length === 0 && (
              <div className="text-sm text-zinc-400">No skills added yet.</div>
            )}
            {skills.map((s) => (
              <ListChip key={s} text={s} onRemove={() => removeSkill(s)} />
            ))}
          </div>

          <div className="mt-4 flex gap-2">
            <input
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              placeholder="Add a skill (e.g., Figma)"
              className="flex-1 rounded-xl border border-zinc-700 bg-zinc-800 text-zinc-200 px-3 py-2"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addSkill();
                }
              }}
            />
            <button
              onClick={addSkill}
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-500"
            >
              Add
            </button>
          </div>
        </div>

        {/* Availability */}
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6">
          <h3 className="font-semibold text-white">Availability</h3>
          <div className="grid sm:grid-cols-3 gap-3 mt-3">
            <input
              value={availability.weekdays}
              onChange={(e) => setAvailability({ ...availability, weekdays: e.target.value })}
              className="rounded-xl border border-zinc-700 bg-zinc-800 text-zinc-200 px-3 py-2"
              aria-label="Weekdays availability"
            />
            <input
              value={availability.saturday}
              onChange={(e) => setAvailability({ ...availability, saturday: e.target.value })}
              className="rounded-xl border border-zinc-700 bg-zinc-800 text-zinc-200 px-3 py-2"
              aria-label="Saturday availability"
            />
            <input
              value={availability.sunday}
              onChange={(e) => setAvailability({ ...availability, sunday: e.target.value })}
              className="rounded-xl border border-zinc-700 bg-zinc-800 text-zinc-200 px-3 py-2"
              aria-label="Sunday availability"
            />
          </div>
        </div>

        {/* Links / Portfolio */}
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-white">Links</h3>
            <button
              onClick={addLink}
              className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-sm"
            >
              + Add link
            </button>
          </div>

          <div className="mt-3 space-y-3">
            {links.length === 0 && (
              <div className="text-sm text-zinc-400">No links added yet.</div>
            )}
            {links.map((l, i) => (
              <div key={i} className="grid sm:grid-cols-[1fr_2fr_auto] gap-2">
                <input
                  value={l.label}
                  onChange={(e) => updateLink(i, "label", e.target.value)}
                  placeholder="Label (e.g., Portfolio)"
                  className="rounded-xl border border-zinc-700 bg-zinc-800 text-zinc-200 px-3 py-2"
                />
                <input
                  value={l.url}
                  onChange={(e) => updateLink(i, "url", e.target.value)}
                  placeholder="https://"
                  className="rounded-xl border border-zinc-700 bg-zinc-800 text-zinc-200 px-3 py-2"
                />
                <button
                  onClick={() => removeLink(i)}
                  className="px-3 py-2 rounded-xl bg-rose-600/80 text-white text-sm hover:bg-rose-600"
                  title="Remove link"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Badges */}
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6">
          <h3 className="font-semibold text-white">Badges</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {badges.length === 0 && <div className="text-sm text-zinc-400">No badges yet.</div>}
            {badges.map((b, i) => (
              <Badge key={i}>{b}</Badge>
            ))}
          </div>
        </div>

        {/* Guardian info / safety hint */}
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6">
          <h3 className="font-semibold text-white">Guardian options</h3>
          <p className="mt-2 text-sm text-zinc-300">
            For under-16s, guardians can view activity and set token limits. You can enable guardian
            view in Settings (coming soon).
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge>Parental view</Badge>
            <Badge>Limits</Badge>
            <Badge>Safe</Badge>
          </div>
        </div>
      </div>
    </section>
  );
}
