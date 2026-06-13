import { useState, useRef, useEffect } from "react";
import {
  MessageCircle,
  Heart,
  Stethoscope,
  Sparkles,
  LogOut,
  Send,
  AlertCircle,
  ArrowRight,
  Check,
  Users,
} from "lucide-react";
import { api } from "./api";

/* ---------------------------------------------------------------- */
/* Design tokens                                                      */
/* ---------------------------------------------------------------- */

const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,500;0,600;1,500&family=Inter:wght@400;500;600;700&display=swap');

    :root {
      --bg: #EEF2F6;
      --surface: #FFFFFF;
      --surface-alt: #E3EAF1;
      --ink: #28415C;
      --ink-soft: #6F8295;
      --accent: #F4B860;
      --accent-deep: #DE9A45;
      --sage: #8FAE9A;
      --sage-deep: #6E927E;
      --line: #D7E0E8;
      --danger-bg: #FDECEA;
      --danger-text: #A8434F;
    }
    .font-display { font-family: 'Lora', Georgia, serif; }
    .font-body { font-family: 'Inter', system-ui, -apple-system, sans-serif; }
    .bg-canvas { background-color: var(--bg); }
    .bg-surface { background-color: var(--surface); }
    .bg-surface-alt { background-color: var(--surface-alt); }
    .bg-accent { background-color: var(--accent); }
    .bg-accent-deep { background-color: var(--accent-deep); }
    .bg-sage { background-color: var(--sage); }
    .bg-sage-deep { background-color: var(--sage-deep); }
    .text-ink { color: var(--ink); }
    .text-ink-soft { color: var(--ink-soft); }
    .text-accent-deep { color: var(--accent-deep); }
    .text-sage-deep { color: var(--sage-deep); }
    .text-on-accent { color: #3D2E12; }
    .border-line { border-color: var(--line); }
    .bg-danger { background-color: var(--danger-bg); }
    .text-danger { color: var(--danger-text); }

    @keyframes breathe {
      0%, 100% { transform: scale(1); opacity: 0.9; }
      50% { transform: scale(1.07); opacity: 1; }
    }
    .breathe { animation: breathe 4.5s ease-in-out infinite; }

    .scrollbar-thin::-webkit-scrollbar { width: 6px; }
    .scrollbar-thin::-webkit-scrollbar-thumb { background: var(--line); border-radius: 4px; }
  `}</style>
);

/* ---------------------------------------------------------------- */
/* Brand mark                                                         */
/* ---------------------------------------------------------------- */

function LumenMark({ size = 40, animated = false }) {
  return (
    <div
      className={`relative flex items-center justify-center rounded-full bg-accent ${animated ? "breathe" : ""}`}
      style={{ width: size, height: size }}
    >
      <svg
        width={size * 0.58}
        height={size * 0.58}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 21C12 21 4 16 4 9.5C4 6.5 6.5 4.5 9 5.2C9 5.2 5.5 8 7 12C8.5 8 14 6.5 15.5 10.5C15.5 16 12 21 12 21Z"
          fill="#28415C"
        />
      </svg>
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Crisis safety                                                       */
/* ---------------------------------------------------------------- */

const CRISIS_KEYWORDS = [
  "suicide",
  "kill myself",
  "end my life",
  "want to die",
  "ending it all",
  "no reason to live",
  "self harm",
  "self-harm",
  "hurt myself",
  "can't go on",
];

function containsCrisisLanguage(text) {
  const lower = text.toLowerCase();
  return CRISIS_KEYWORDS.some((kw) => lower.includes(kw));
}

function CrisisBanner() {
  return (
    <div className="bg-danger rounded-xl p-4 mb-3 flex gap-3 items-start font-body">
      <AlertCircle className="text-danger flex-shrink-0 mt-0.5" size={20} />
      <div className="text-sm text-danger">
        <p className="font-semibold mb-1">You don't have to go through this alone.</p>
        <p className="mb-1">
          If you're in immediate danger, please contact your local emergency
          services right away.
        </p>
        <p>
          You can also reach a crisis line near you through{" "}
          <span className="font-semibold">Befrienders Worldwide</span>{" "}
          (befrienders.org) or the{" "}
          <span className="font-semibold">
            International Association for Suicide Prevention
          </span>{" "}
          crisis centre directory (iasp.info).
        </p>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Landing                                                             */
/* ---------------------------------------------------------------- */

function LandingScreen({ onSelectRole }) {
  return (
    <div className="min-h-screen bg-canvas font-body flex flex-col items-center justify-center px-6 py-12">
      <div className="flex flex-col items-center text-center max-w-md">
        <LumenMark size={72} animated />
        <h1 className="font-display text-4xl text-ink mt-6">Lumen</h1>
        <p className="text-ink-soft mt-3 leading-relaxed">
          A gentle companion for the days that feel heavy — and a direct line
          to a real therapist when you need one.
        </p>

        <div className="w-full mt-10 flex flex-col gap-3">
          <button
            onClick={() => onSelectRole("client")}
            className="w-full bg-accent hover:bg-accent-deep text-on-accent font-semibold rounded-2xl py-4 px-6 flex items-center justify-between transition-colors"
          >
            <span className="flex items-center gap-3">
              <Heart size={20} />
              I'm looking for support
            </span>
            <ArrowRight size={18} />
          </button>

          <button
            onClick={() => onSelectRole("therapist")}
            className="w-full bg-surface hover:bg-surface-alt text-ink font-semibold rounded-2xl py-4 px-6 flex items-center justify-between transition-colors border border-line"
          >
            <span className="flex items-center gap-3">
              <Stethoscope size={20} />
              I'm a therapist
            </span>
            <ArrowRight size={18} />
          </button>
        </div>

        <p className="text-xs text-ink-soft mt-8 leading-relaxed">
          Lumen's companion is an AI, not a licensed professional. If you're in
          crisis, please contact local emergency services or a crisis line.
        </p>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Auth (mock)                                                         */
/* ---------------------------------------------------------------- */

function AuthForm({ role, onComplete, onBack }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("login");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const roleLabel = role === "therapist" ? "therapist" : "member";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "signup") {
        await api.signup(name.trim(), email.trim(), password, role);
      }
      await api.login(email.trim(), password);
      const me = await api.me();
      if (me.role !== role) {
        api.logout();
        throw new Error(
          `This account is registered as a ${me.role}. Please use the "${me.role === "therapist" ? "I'm a therapist" : "I'm looking for support"}" option.`
        );
      }
      onComplete(me.name);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas font-body flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm bg-surface rounded-2xl p-8 border border-line">
        <div className="flex items-center gap-3 mb-6">
          <LumenMark size={40} />
          <div>
            <p className="font-display text-lg text-ink leading-tight">Lumen</p>
            <p className="text-xs text-ink-soft">
              {mode === "login" ? "Welcome back" : "Create your"} {roleLabel}{" "}
              account
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-danger text-danger text-sm rounded-xl p-3 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {mode === "signup" && (
            <div>
              <label className="text-sm text-ink-soft block mb-1">Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full rounded-xl border border-line px-4 py-2.5 text-ink font-body focus:outline-none focus:ring-2 focus:ring-accent"
                required
              />
            </div>
          )}
          <div>
            <label className="text-sm text-ink-soft block mb-1">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="you@example.com"
              className="w-full rounded-xl border border-line px-4 py-2.5 text-ink font-body focus:outline-none focus:ring-2 focus:ring-accent"
              required
            />
          </div>
          <div>
            <label className="text-sm text-ink-soft block mb-1">Password</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="••••••••"
              className="w-full rounded-xl border border-line px-4 py-2.5 text-ink font-body focus:outline-none focus:ring-2 focus:ring-accent"
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent hover:bg-accent-deep text-on-accent font-semibold rounded-xl py-3 mt-2 transition-colors disabled:opacity-50"
          >
            {loading ? "Please wait…" : mode === "login" ? "Log in" : "Create account"}
          </button>
        </form>

        <p className="text-sm text-ink-soft text-center mt-4">
          {mode === "login" ? "New to Lumen?" : "Already have an account?"}{" "}
          <button
            onClick={() => {
              setMode(mode === "login" ? "signup" : "login");
              setError("");
            }}
            className="text-accent-deep font-semibold"
          >
            {mode === "login" ? "Sign up" : "Log in"}
          </button>
        </p>

        <button
          onClick={onBack}
          className="text-xs text-ink-soft mt-6 w-full text-center hover:text-ink"
        >
          ← Back
        </button>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Client app                                                          */
/* ---------------------------------------------------------------- */

function ChatView() {
  const WELCOME = {
    role: "assistant",
    content:
      "Hi, I'm Lumen. I'm an AI companion, here to listen and keep you company — not a substitute for your therapist, but I'm always around. How are you feeling today?",
  };

  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [crisisFlag, setCrisisFlag] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    (async () => {
      try {
        const history = await api.getChatHistory();
        if (history.length > 0) {
          setMessages(history.map((m) => ({ role: m.role, content: m.content })));
          if (history.some((m) => m.flagged_crisis)) setCrisisFlag(true);
        }
      } catch {
        // If history can't load, just keep the welcome message.
      } finally {
        setHistoryLoading(false);
      }
    })();
  }, []);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    if (containsCrisisLanguage(text)) setCrisisFlag(true);

    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInput("");
    setLoading(true);

    try {
      const { reply, crisis_detected } = await api.sendChat(text);
      if (crisis_detected) setCrisisFlag(true);
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I'm having trouble connecting right now, but I'm still here. Want to try sending that again in a moment?",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-4 border-b border-line flex items-center gap-3">
        <LumenMark size={36} />
        <div>
          <p className="font-display text-ink text-lg leading-tight">Lumen</p>
          <p className="text-xs text-ink-soft">Your AI companion · always here</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin px-6 py-5 flex flex-col gap-4">
        {crisisFlag && <CrisisBanner />}
        {historyLoading && (
          <p className="text-sm text-ink-soft text-center">Loading your conversation…</p>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {m.role === "assistant" && <LumenMark size={32} />}
            <div
              className={`max-w-md rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                m.role === "user"
                  ? "bg-accent text-on-accent"
                  : "bg-surface-alt text-ink"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3 justify-start">
            <LumenMark size={32} animated />
            <div className="bg-surface-alt text-ink-soft rounded-2xl px-4 py-3 text-sm">
              Lumen is typing…
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="px-6 py-4 border-t border-line flex gap-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Share what's on your mind…"
          className="flex-1 rounded-xl border border-line px-4 py-3 text-ink font-body focus:outline-none focus:ring-2 focus:ring-accent"
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          className="bg-accent hover:bg-accent-deep text-on-accent rounded-xl px-4 flex items-center justify-center transition-colors disabled:opacity-50"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}

function MoodView() {
  const [history, setHistory] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  const moods = [
    { value: 1, label: "Heavy", emoji: "😞" },
    { value: 2, label: "Low", emoji: "😕" },
    { value: 3, label: "Okay", emoji: "😐" },
    { value: 4, label: "Good", emoji: "🙂" },
    { value: 5, label: "Great", emoji: "😄" },
  ];

  useEffect(() => {
    (async () => {
      try {
        const moods = await api.getMoods();
        // moods come back newest-first; reverse for a left-to-right timeline
        setHistory(moods.slice(0, 7).reverse().map((m) => m.value));
      } catch {
        // ignore - just show an empty chart
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const logMood = async (value) => {
    setSelected(value);
    try {
      await api.logMood(value);
      setHistory((prev) => [...prev.slice(-6), value]);
    } catch {
      // if it fails, still reflect locally so the UI doesn't feel broken
      setHistory((prev) => [...prev.slice(-6), value]);
    }
  };

  return (
    <div className="p-8 max-w-xl">
      <h2 className="font-display text-2xl text-ink mb-1">
        How are you feeling today?
      </h2>
      <p className="text-ink-soft mb-6">
        A quick check-in helps Lumen and your therapist understand how you're doing over time.
      </p>

      <div className="flex gap-3 mb-8">
        {moods.map((m) => (
          <button
            key={m.value}
            onClick={() => logMood(m.value)}
            className={`flex-1 flex flex-col items-center gap-2 rounded-2xl py-4 border transition-colors ${
              selected === m.value
                ? "bg-accent border-accent text-on-accent"
                : "bg-surface border-line text-ink hover:bg-surface-alt"
            }`}
          >
            <span className="text-2xl">{m.emoji}</span>
            <span className="text-xs font-medium">{m.label}</span>
          </button>
        ))}
      </div>

      {selected && (
        <p className="text-sm text-sage-deep mb-6 flex items-center gap-2">
          <Check size={16} /> Logged — thanks for checking in with yourself.
        </p>
      )}

      <h3 className="font-display text-lg text-ink mb-3">This week</h3>
      <div className="flex items-end gap-2 h-32 bg-surface rounded-2xl border border-line p-4">
        {loading && <p className="text-sm text-ink-soft">Loading…</p>}
        {!loading && history.length === 0 && (
          <p className="text-sm text-ink-soft">No check-ins yet — log one above.</p>
        )}
        {history.map((v, i) => (
          <div
            key={i}
            className="flex-1 bg-sage rounded-t-lg"
            style={{ height: `${v * 18}px` }}
          />
        ))}
      </div>
    </div>
  );
}

function TherapistInfoView() {
  return (
    <div className="p-8 max-w-xl">
      <h2 className="font-display text-2xl text-ink mb-1">Your therapist</h2>
      <p className="text-ink-soft mb-6">
        Lumen's AI companion is here every day — and your assigned therapist is
        here for deeper, ongoing support.
      </p>

      <div className="bg-surface rounded-2xl border border-line p-6 flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-sage flex items-center justify-center text-white font-display text-xl">
            AO
          </div>
          <div>
            <p className="font-semibold text-ink">Dr. Amara Obi</p>
            <p className="text-sm text-ink-soft">
              Licensed Clinical Psychologist · Speaks English, Yoruba
            </p>
          </div>
        </div>
        <p className="text-sm text-ink-soft leading-relaxed">
          Dr. Obi specializes in depression, anxiety, and grief, with a warm
          and practical approach. Sessions are conducted over secure video
          call.
        </p>
        <div className="flex gap-3 mt-2">
          <button className="bg-accent hover:bg-accent-deep text-on-accent text-sm font-semibold rounded-xl px-4 py-2 transition-colors">
            Book a session
          </button>
          <button className="bg-surface-alt hover:bg-line text-ink text-sm font-semibold rounded-xl px-4 py-2 transition-colors">
            Send a message
          </button>
        </div>
      </div>
    </div>
  );
}

function PlansView() {
  const [plan, setPlan] = useState("free");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const plans = [
    {
      id: "free",
      name: "Companion",
      price: "Free",
      features: ["Daily chats with Lumen", "Mood check-ins"],
    },
    {
      id: "plus",
      name: "Plus",
      price: "$9 / month",
      features: ["Everything in Companion", "Unlimited chat history", "Priority response"],
    },
    {
      id: "therapy",
      name: "Therapy",
      price: "$49 / month",
      features: ["Everything in Plus", "2 licensed therapist sessions / month", "Direct messaging with your therapist"],
    },
  ];

  useEffect(() => {
    (async () => {
      try {
        const sub = await api.getSubscription();
        setPlan(sub.plan);
      } catch {
        // default to "free" if it can't load
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const choosePlan = async (id) => {
    setUpdating(true);
    try {
      const sub = await api.setSubscription(id);
      setPlan(sub.plan);
    } catch {
      // keep previous plan on failure
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl">
      <h2 className="font-display text-2xl text-ink mb-1">Plans</h2>
      <p className="text-ink-soft mb-6">
        Start free. Upgrade any time you want more support.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {plans.map((p) => (
          <div
            key={p.id}
            className={`rounded-2xl border p-5 flex flex-col gap-3 ${
              plan === p.id ? "border-accent bg-surface" : "border-line bg-surface"
            }`}
          >
            <p className="font-display text-lg text-ink">{p.name}</p>
            <p className="text-accent-deep font-semibold">{p.price}</p>
            <ul className="text-sm text-ink-soft flex flex-col gap-1.5 flex-1">
              {p.features.map((f) => (
                <li key={f} className="flex gap-2">
                  <Check size={14} className="text-sage-deep flex-shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => choosePlan(p.id)}
              disabled={loading || updating}
              className={`rounded-xl py-2 text-sm font-semibold transition-colors disabled:opacity-50 ${
                plan === p.id
                  ? "bg-accent text-on-accent"
                  : "bg-surface-alt text-ink hover:bg-line"
              }`}
            >
              {plan === p.id ? "Current plan" : "Choose plan"}
            </button>
          </div>
        ))}
      </div>

      <p className="text-xs text-ink-soft mt-6">
        This is a demo — connect a payment provider like Stripe to take real
        subscriptions.
      </p>
    </div>
  );
}

function ClientApp({ name, onLogout }) {
  const [view, setView] = useState("chat");

  const nav = [
    { id: "chat", label: "Lumen", icon: MessageCircle },
    { id: "mood", label: "Check-in", icon: Heart },
    { id: "therapist", label: "My therapist", icon: Stethoscope },
    { id: "plans", label: "Plans", icon: Sparkles },
  ];

  return (
    <div className="min-h-screen bg-canvas font-body flex">
      <aside className="w-60 bg-surface border-r border-line flex flex-col py-6 px-4">
        <div className="flex items-center gap-2 px-2 mb-8">
          <LumenMark size={32} />
          <span className="font-display text-lg text-ink">Lumen</span>
        </div>
        <p className="text-xs text-ink-soft px-2 mb-2">Hi, {name}</p>
        <nav className="flex flex-col gap-1">
          {nav.map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                view === item.id
                  ? "bg-surface-alt text-ink"
                  : "text-ink-soft hover:bg-surface-alt"
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>
        <button
          onClick={onLogout}
          className="mt-auto flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-ink-soft hover:bg-surface-alt transition-colors"
        >
          <LogOut size={18} />
          Log out
        </button>
      </aside>

      <main className="flex-1 h-screen overflow-hidden">
        {view === "chat" && <ChatView />}
        {view === "mood" && (
          <div className="h-full overflow-y-auto scrollbar-thin">
            <MoodView />
          </div>
        )}
        {view === "therapist" && (
          <div className="h-full overflow-y-auto scrollbar-thin">
            <TherapistInfoView />
          </div>
        )}
        {view === "plans" && (
          <div className="h-full overflow-y-auto scrollbar-thin">
            <PlansView />
          </div>
        )}
      </main>
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Therapist app                                                       */
/* ---------------------------------------------------------------- */

function moodEmoji(value) {
  return { 1: "😞", 2: "😕", 3: "😐", 4: "🙂", 5: "😄" }[value] || "—";
}

function TherapistApp({ name, onLogout }) {
  const [clients, setClients] = useState([]);
  const [selected, setSelected] = useState(null);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const data = await api.getClients();
        setClients(data);
        if (data.length > 0) setSelected(data[0]);
      } catch (err) {
        setError(err.message || "Couldn't load your clients.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-canvas font-body flex">
      <aside className="w-72 bg-surface border-r border-line flex flex-col py-6">
        <div className="flex items-center gap-2 px-6 mb-6">
          <LumenMark size={32} />
          <span className="font-display text-lg text-ink">Lumen</span>
          <span className="text-xs text-ink-soft ml-auto">for therapists</span>
        </div>
        <p className="text-xs text-ink-soft px-6 mb-3 flex items-center gap-2">
          <Users size={14} /> Your clients · Dr. {name}
        </p>
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {loading && <p className="text-sm text-ink-soft px-6">Loading…</p>}
          {!loading && error && <p className="text-sm text-danger px-6">{error}</p>}
          {!loading && !error && clients.length === 0 && (
            <p className="text-sm text-ink-soft px-6">
              No clients assigned yet.
            </p>
          )}
          {clients.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelected(c)}
              className={`w-full text-left px-6 py-3 flex items-center justify-between transition-colors ${
                selected?.id === c.id ? "bg-surface-alt" : "hover:bg-surface-alt"
              }`}
            >
              <div>
                <p className="text-sm font-medium text-ink">{c.name}</p>
                <p className="text-xs text-ink-soft">{c.email}</p>
              </div>
              <span className="text-xl">{moodEmoji(c.latest_mood)}</span>
            </button>
          ))}
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-3 px-6 py-3 text-sm font-medium text-ink-soft hover:bg-surface-alt transition-colors"
        >
          <LogOut size={18} />
          Log out
        </button>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto scrollbar-thin">
        {!selected ? (
          <p className="text-ink-soft">Select a client to view their details.</p>
        ) : (
          <>
            <h2 className="font-display text-2xl text-ink mb-1">{selected.name}</h2>
            <p className="text-ink-soft mb-6">
              Latest check-in: {moodEmoji(selected.latest_mood)} · {selected.email}
            </p>

            <h3 className="font-display text-lg text-ink mb-3">Mood, last 7 check-ins</h3>
            <div className="flex items-end gap-2 h-32 bg-surface rounded-2xl border border-line p-4 mb-8 max-w-md">
              {selected.mood_history.length === 0 && (
                <p className="text-sm text-ink-soft">No check-ins yet.</p>
              )}
              {selected.mood_history.map((v, i) => (
                <div key={i} className="flex-1 bg-sage rounded-t-lg" style={{ height: `${v * 18}px` }} />
              ))}
            </div>

            <h3 className="font-display text-lg text-ink mb-3">Session notes</h3>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={`Private notes about ${selected.name}…`}
              className="w-full max-w-md h-32 rounded-2xl border border-line p-4 text-sm text-ink font-body focus:outline-none focus:ring-2 focus:ring-accent resize-none"
            />
            <div className="mt-3">
              <button className="bg-accent hover:bg-accent-deep text-on-accent text-sm font-semibold rounded-xl px-4 py-2 transition-colors">
                Save note
              </button>
              <p className="text-xs text-ink-soft mt-2">
                Note saving isn't connected to the backend yet — this is a
                placeholder for a future endpoint.
              </p>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Root                                                                */
/* ---------------------------------------------------------------- */

export default function App() {
  const [stage, setStage] = useState("loading"); // loading | landing | auth | app
  const [role, setRole] = useState(null);
  const [name, setName] = useState("");

  // On load, check if a saved login token is still valid.
  useEffect(() => {
    (async () => {
      try {
        const me = await api.me();
        setRole(me.role);
        setName(me.name);
        setStage("app");
      } catch {
        setStage("landing");
      }
    })();
  }, []);

  const handleSelectRole = (r) => {
    setRole(r);
    setStage("auth");
  };

  const handleAuthComplete = (enteredName) => {
    setName(enteredName);
    setStage("app");
  };

  const handleLogout = () => {
    api.logout();
    setStage("landing");
    setRole(null);
    setName("");
  };

  return (
    <div className="font-body">
      <GlobalStyle />
      {stage === "loading" && (
        <div className="min-h-screen bg-canvas flex items-center justify-center">
          <LumenMark size={56} animated />
        </div>
      )}
      {stage === "landing" && <LandingScreen onSelectRole={handleSelectRole} />}
      {stage === "auth" && (
        <AuthForm
          role={role}
          onComplete={handleAuthComplete}
          onBack={() => setStage("landing")}
        />
      )}
      {stage === "app" && role === "client" && (
        <ClientApp name={name} onLogout={handleLogout} />
      )}
      {stage === "app" && role === "therapist" && (
        <TherapistApp name={name} onLogout={handleLogout} />
      )}
    </div>
  );
}
