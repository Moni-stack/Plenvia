import { useState, useEffect, useRef } from "react";
import {
  AreaChart, Area, BarChart, Bar, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from "recharts";

function ChartFrame({ height, children }) {
  const containerRef = useRef(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const updateWidth = () => setWidth(element.getBoundingClientRect().width);
    updateWidth();

    const observer = new ResizeObserver(updateWidth);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} style={{ width: "100%", height }}>
      {width > 0 ? children(width, height) : null}
    </div>
  );
}

// ─── Mock Data ───────────────────────────────────────────────────────────────

const weeklyHours = [
  { day: "Mon", Math: 2.5, Chemistry: 1, Physics: 1.5 },
  { day: "Tue", Math: 1, Chemistry: 0, Physics: 2 },
  { day: "Wed", Math: 3, Chemistry: 1.5, Physics: 0.5 },
  { day: "Thu", Math: 2, Chemistry: 0, Physics: 2.5 },
  { day: "Fri", Math: 1.5, Chemistry: 2, Physics: 1 },
  { day: "Sat", Math: 0.5, Chemistry: 0, Physics: 0.5 },
  { day: "Sun", Math: 2, Chemistry: 0, Physics: 1.5 },
];

const focusTrend = [
  { week: "Wk 1", score: 72 },
  { week: "Wk 2", score: 68 },
  { week: "Wk 3", score: 81 },
  { week: "Wk 4", score: 76 },
  { week: "Wk 5", score: 59 },
  { week: "Wk 6", score: 85 },
];

const plannedVsActual = [
  { day: "Mon", Planned: 4, Actual: 5 },
  { day: "Tue", Planned: 3, Actual: 3 },
  { day: "Wed", Planned: 5, Actual: 4.5 },
  { day: "Thu", Planned: 4, Actual: 4.5 },
  { day: "Fri", Planned: 3, Actual: 2.5 },
  { day: "Sat", Planned: 2, Actual: 1 },
  { day: "Sun", Planned: 3, Actual: 3.5 },
];

const productivityByHour = [
  { time: "6AM", focus: 88 },
  { time: "8AM", focus: 91 },
  { time: "10AM", focus: 74 },
  { time: "12PM", focus: 55 },
  { time: "2PM", focus: 48 },
  { time: "4PM", focus: 63 },
  { time: "6PM", focus: 79 },
  { time: "8PM", focus: 70 },
  { time: "10PM", focus: 45 },
];

const subjectRadar = [
  { subject: "Math", score: 85 },
  { subject: "Chemistry", score: 52 },
  { subject: "Physics", score: 78 },
  { subject: "English", score: 65 },
  { subject: "History", score: 70 },
];

const insights = [
  {
    icon: "🌅",
    type: "Peak Time",
    color: "from-amber-400 to-orange-400",
    bg: "bg-amber-50 border-amber-200",
    text: "You study Math best between 6–8 AM. Your focus score peaks at 91 during this window.",
    tag: "Peak Performance",
  },
  {
    icon: "📉",
    type: "Skip Pattern",
    color: "from-red-400 to-pink-400",
    bg: "bg-red-50 border-red-200",
    text: "You skip Chemistry on weekends. It's been missed 3 out of 4 recent Saturdays and Sundays.",
    tag: "Habit Gap",
  },
  {
    icon: "⚡",
    type: "Focus Drop",
    color: "from-purple-400 to-violet-500",
    bg: "bg-purple-50 border-purple-200",
    text: "Your focus drops sharply after 2 continuous hours. Consider a 15-min break at the 90-min mark.",
    tag: "Burnout Risk",
  },
  {
    icon: "🔁",
    type: "Retention Alert",
    color: "from-blue-400 to-cyan-400",
    bg: "bg-blue-50 border-blue-200",
    text: "Revise Organic Chemistry Chapter 4 — low retention detected based on repeat sessions without progress.",
    tag: "Memory Alert",
  },
  {
    icon: "🔥",
    type: "Burnout Watch",
    color: "from-rose-400 to-red-500",
    bg: "bg-rose-50 border-rose-200",
    text: "Week 5 showed low focus (59) despite long hours. Burnout pattern detected — rest was needed.",
    tag: "Health Signal",
  },
  {
    icon: "🏆",
    type: "Consistency Win",
    color: "from-green-400 to-emerald-500",
    bg: "bg-green-50 border-green-200",
    text: "Your consistency score this week is 82% — your best in 6 weeks. Keep the streak alive!",
    tag: "Milestone",
  },
];

// ─── Metric Card ──────────────────────────────────────────────────────────────

function MetricCard({ icon, label, value, sub, accent }) {
  return (
    <div className={`bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${accent}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
        <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
      </div>
    </div>
  );
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-lg text-sm">
        <p className="font-semibold text-gray-700 mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }}>
            {p.name}: <span className="font-bold">{p.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
}

// ─── Weekly Consistency Bar ───────────────────────────────────────────────────

const consistencyDays = [
  { day: "M", done: true },
  { day: "T", done: true },
  { day: "W", done: true },
  { day: "T", done: true },
  { day: "F", done: false },
  { day: "S", done: false },
  { day: "S", done: true },
];

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Analytics() {
  const [activeTab, setActiveTab] = useState("overview");

  const tabs = ["overview", "subjects", "focus", "insights"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-pink-50 to-slate-50 p-6">
      <div className="max-w-6xl mx-auto">

        {/* ── Header ── */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            📊 Analytics
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Real insights into how you study — not just numbers.
          </p>
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-2 mb-8 bg-white rounded-2xl p-1.5 shadow-sm border border-gray-100 w-fit">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-xl text-sm font-semibold capitalize transition-all ${
                activeTab === tab
                  ? "bg-purple-500 text-white shadow-md"
                  : "text-gray-500 hover:text-purple-600 hover:bg-purple-50"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ════════════════ OVERVIEW TAB ════════════════ */}
        {activeTab === "overview" && (
          <div className="space-y-6">

            {/* Metric Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MetricCard icon="⏱" label="Total This Week" value="24.5h" sub="+3h vs last week" accent="bg-purple-100" />
              <MetricCard icon="🎯" label="Focus Score" value="76/100" sub="↑ 8 pts this week" accent="bg-pink-100" />
              <MetricCard icon="🔥" label="Study Streak" value="6 days" sub="Personal best!" accent="bg-orange-100" />
              <MetricCard icon="✅" label="Consistency" value="82%" sub="5 of 7 days hit target" accent="bg-green-100" />
            </div>

            {/* Weekly Consistency Visual */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="font-semibold text-gray-700 mb-4">Weekly Study Consistency</h2>
              <div className="flex gap-3 items-center">
                {consistencyDays.map((d, i) => (
                  <div key={i} className="flex flex-col items-center gap-2">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all ${
                        d.done
                          ? "bg-purple-500 text-white shadow-md shadow-purple-200"
                          : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      {d.done ? "✓" : "–"}
                    </div>
                    <span className="text-xs text-gray-400">{d.day}</span>
                  </div>
                ))}
                <div className="ml-auto text-right">
                  <p className="text-3xl font-bold text-purple-600">82%</p>
                  <p className="text-xs text-gray-400">this week</p>
                </div>
              </div>
            </div>

            {/* Planned vs Actual */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="font-semibold text-gray-700 mb-1">Planned vs Actual Study Hours</h2>
              <p className="text-xs text-gray-400 mb-5">How closely did you follow your schedule?</p>
              <ChartFrame height={220}>
                {(width, height) => (
                <BarChart width={width} height={height} data={plannedVsActual} barGap={6} barCategoryGap="30%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} unit="h" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="Planned" fill="#e9d5ff" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="Actual" fill="#a855f7" radius={[6, 6, 0, 0]} />
                </BarChart>
                )}
              </ChartFrame>
            </div>

            {/* Burnout Detection */}
            <div className="bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-200 rounded-2xl p-5 flex gap-4 items-start">
              <div className="text-3xl mt-1">🚨</div>
              <div>
                <p className="font-semibold text-rose-700 text-sm">Burnout Risk Detected — Week 5</p>
                <p className="text-rose-600 text-sm mt-1">
                  You logged <strong>18+ hours</strong> but your focus score dropped to <strong>59/100</strong>.
                  Long hours with low focus is an early burnout signal. Scheduling rest days improves long-term retention.
                </p>
                <div className="flex gap-2 mt-3">
                  <span className="px-3 py-1 bg-rose-100 text-rose-600 rounded-full text-xs font-medium">Low Focus</span>
                  <span className="px-3 py-1 bg-rose-100 text-rose-600 rounded-full text-xs font-medium">High Hours</span>
                  <span className="px-3 py-1 bg-rose-100 text-rose-600 rounded-full text-xs font-medium">Rest Recommended</span>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ════════════════ SUBJECTS TAB ════════════════ */}
        {activeTab === "subjects" && (
          <div className="space-y-6">

            {/* Stacked bar — hours per subject */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="font-semibold text-gray-700 mb-1">Study Hours by Subject This Week</h2>
              <p className="text-xs text-gray-400 mb-5">Stacked daily breakdown</p>
              <ChartFrame height={240}>
                {(width, height) => (
                <BarChart width={width} height={height} data={weeklyHours} barCategoryGap="30%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} unit="h" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="Math" stackId="a" fill="#a855f7" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="Chemistry" stackId="a" fill="#f472b6" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="Physics" stackId="a" fill="#818cf8" radius={[6, 6, 0, 0]} />
                </BarChart>
                )}
              </ChartFrame>
            </div>

            {/* Radar — subject mastery */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="font-semibold text-gray-700 mb-1">Subject Mastery Radar</h2>
                <p className="text-xs text-gray-400 mb-4">Based on focus + completion scores</p>
                <ChartFrame height={240}>
                  {(width, height) => (
                  <RadarChart width={width} height={height} data={subjectRadar}>
                    <PolarGrid stroke="#f0f0f0" />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fill: "#6b7280" }} />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar name="Score" dataKey="score" stroke="#a855f7" fill="#a855f7" fillOpacity={0.25} strokeWidth={2} />
                    <Tooltip content={<CustomTooltip />} />
                  </RadarChart>
                  )}
                </ChartFrame>
              </div>

              {/* Subject breakdown pills */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="font-semibold text-gray-700 mb-4">Subject Summary</h2>
                <div className="space-y-4">
                  {[
                    { name: "Math", hours: "9h", score: 85, color: "bg-purple-500" },
                    { name: "Physics", hours: "7.5h", score: 78, color: "bg-indigo-400" },
                    { name: "English", hours: "4h", score: 65, color: "bg-pink-400" },
                    { name: "History", hours: "3.5h", score: 70, color: "bg-amber-400" },
                    { name: "Chemistry", hours: "2.5h", score: 52, color: "bg-red-400" },
                  ].map((s) => (
                    <div key={s.name}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-gray-700">{s.name}</span>
                        <span className="text-gray-400">{s.hours} · {s.score}/100</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${s.color} rounded-full transition-all`}
                          style={{ width: `${s.score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-red-400 mt-4 bg-red-50 px-3 py-2 rounded-lg">
                  ⚠️ Chemistry has the lowest score and fewest hours — consider prioritising it.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════ FOCUS TAB ════════════════ */}
        {activeTab === "focus" && (
          <div className="space-y-6">

            {/* Focus trend */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="font-semibold text-gray-700 mb-1">Focus Score Trend (6 Weeks)</h2>
              <p className="text-xs text-gray-400 mb-5">Higher is better — 80+ is your sweet spot</p>
              <ChartFrame height={220}>
                {(width, height) => (
                <AreaChart width={width} height={height} data={focusTrend}>
                  <defs>
                    <linearGradient id="focusGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="week" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <YAxis domain={[40, 100]} tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="score" stroke="#a855f7" strokeWidth={3} fill="url(#focusGrad)" dot={{ fill: "#a855f7", strokeWidth: 2, r: 5 }} />
                </AreaChart>
                )}
              </ChartFrame>
            </div>

            {/* Productivity by time of day */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="font-semibold text-gray-700 mb-1">Productivity by Time of Day</h2>
              <p className="text-xs text-gray-400 mb-5">When are you actually sharpest?</p>
              <ChartFrame height={220}>
                {(width, height) => (
                <AreaChart width={width} height={height} data={productivityByHour}>
                  <defs>
                    <linearGradient id="timeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f472b6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f472b6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="time" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="focus" stroke="#f472b6" strokeWidth={3} fill="url(#timeGrad)" dot={{ fill: "#f472b6", strokeWidth: 2, r: 4 }} />
                </AreaChart>
                )}
              </ChartFrame>
              <div className="flex gap-3 mt-4 flex-wrap">
                <span className="px-3 py-1.5 bg-green-100 text-green-700 rounded-xl text-xs font-medium">🌅 Peak: 6–8 AM (91)</span>
                <span className="px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded-xl text-xs font-medium">☀️ Moderate: 4–6 PM (63–79)</span>
                <span className="px-3 py-1.5 bg-red-100 text-red-700 rounded-xl text-xs font-medium">🌙 Avoid: 2 PM & 10 PM (45–48)</span>
              </div>
            </div>

            {/* Focus tips */}
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { icon: "⏰", title: "Best Study Window", body: "Schedule hard subjects between 6–8 AM for maximum retention." },
                { icon: "🧠", title: "Focus Ceiling", body: "Your focus reliably drops after 90–120 min. Build breaks in proactively." },
                { icon: "😴", title: "Late-Night Warning", body: "Post 9 PM sessions show a 40% drop in retention vs morning sessions." },
              ].map((tip) => (
                <div key={tip.title} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <div className="text-2xl mb-3">{tip.icon}</div>
                  <p className="font-semibold text-gray-700 text-sm">{tip.title}</p>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">{tip.body}</p>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ════════════════ INSIGHTS TAB ════════════════ */}
        {activeTab === "insights" && (
          <div className="space-y-4">
            <div className="mb-2">
              <p className="text-sm text-gray-500">
                Rule-based smart insights derived from your study patterns. These update as your data grows.
              </p>
            </div>
            {insights.map((ins, i) => (
              <div
                key={i}
                className={`rounded-2xl p-5 border flex gap-4 items-start ${ins.bg}`}
              >
                <div className="text-3xl mt-0.5">{ins.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full text-white bg-gradient-to-r ${ins.color}`}>
                      {ins.tag}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">{ins.text}</p>
                </div>
              </div>
            ))}

            {/* ML Readiness Note */}
            <div className="bg-white rounded-2xl p-5 border border-dashed border-purple-300 mt-4">
              <p className="text-sm font-semibold text-purple-700 mb-1">🤖 ML-Ready Architecture</p>
              <p className="text-xs text-gray-500 leading-relaxed">
                These insights are currently rule-based. Once connected to your backend, this section can power 
                real ML models — spaced repetition algorithms, retention curve prediction, and personalised 
                scheduling — using your actual session data.
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
