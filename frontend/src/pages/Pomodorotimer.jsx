import { useEffect, useState } from "react";
import { apiRequest } from "../api";

export default function PomodoroTimer() {
  const [subject, setSubject] = useState("");
  const [workMinutes, setWorkMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);

  const [secondsLeft, setSecondsLeft] = useState(workMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isWork, setIsWork] = useState(true);

  const [sessionsToday, setSessionsToday] = useState(0);
  const [totalMinutes, setTotalMinutes] = useState(0);

  const [startedAt, setStartedAt] = useState(null);

  // UI-only state (shows/hides the custom interval inputs)
  const [showCustom, setShowCustom] = useState(false);

  useEffect(() => {
    setSecondsLeft(workMinutes * 60);
  }, [workMinutes]);

  useEffect(() => {
    if (!isRunning) return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning]);

  useEffect(() => {
    if (secondsLeft !== 0) return;

    const completeSession = async () => {
      if (isWork) {
        const completedAt = new Date();

        try {
          await apiRequest("/study-sessions", "POST", {
            duration_minutes: workMinutes,
            started_at: startedAt || completedAt,
            completed_at: completedAt,
          });

          setSessionsToday((s) => s + 1);
          setTotalMinutes((t) => t + workMinutes);

          console.log("Study session saved successfully 🍅");
        } catch (error) {
          console.error("Failed to save study session:", error);
          alert("Study session could not be saved.");
        }

        setStartedAt(null);
      }

      setIsWork(!isWork);
      setSecondsLeft((isWork ? breakMinutes : workMinutes) * 60);
      setIsRunning(false);
    };

    completeSession();
  }, [secondsLeft, isWork, workMinutes, breakMinutes, startedAt]);

  const formatTime = () => {
    const m = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
    const s = String(secondsLeft % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  const startTimer = () => {
    if (!isRunning && isWork && !startedAt) {
      setStartedAt(new Date());
    }

    setIsRunning(true);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setIsWork(true);
    setSecondsLeft(workMinutes * 60);
    setStartedAt(null);
  };

  /* ---------- Display-only helpers (derived from existing state) ---------- */

  const totalSeconds = (isWork ? workMinutes : breakMinutes) * 60;
  const progress =
    totalSeconds > 0
      ? Math.min(1, Math.max(0, (totalSeconds - secondsLeft) / totalSeconds))
      : 0;

  // Ring geometry: an open arc with the gap centred at the bottom
  const R = 150;
  const CIRC = 2 * Math.PI * R;
  const ARC = CIRC * 0.8;
  const START_ANGLE = 126; // degrees clockwise from 3 o'clock
  const knobAngle = ((START_ANGLE + 288 * progress) * Math.PI) / 180;
  const knobX = 170 + R * Math.cos(knobAngle);
  const knobY = 170 + R * Math.sin(knobAngle);

  const presets = [
    { label: "25/5", work: 25, rest: 5 },
    { label: "50/10", work: 50, rest: 10 },
  ];
  const activePreset = presets.find(
    (p) => p.work === workMinutes && p.rest === breakMinutes
  );

  const applyPreset = (p) => {
    setWorkMinutes(p.work);
    setBreakMinutes(p.rest);
    setShowCustom(false);
  };

  const hand = { fontFamily: "'Gaegu', 'Comic Sans MS', cursive" };
  const body = { fontFamily: "'Nunito', system-ui, sans-serif" };

  return (
    <div
      style={body}
      className="relative w-full max-w-5xl overflow-hidden rounded-3xl border border-white/70 bg-gradient-to-br from-[#f3eefe] via-[#ece4fc] to-[#e3d8fa] p-6 text-[#2b2260] shadow-xl md:p-10"
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Gaegu:wght@400;700&family=Nunito:wght@400;600;700;800&display=swap');`}</style>

      {/* soft background blobs */}
      <div className="pointer-events-none absolute -left-16 top-1/3 h-64 w-64 rounded-full bg-white/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-10 bottom-0 h-72 w-72 rounded-full bg-[#d6c8f7]/50 blur-3xl" />

      <div className="relative grid items-center gap-10 md:grid-cols-[1fr_auto_1fr]">
        {/* ---------------- Left: headline + cat on books ---------------- */}
        <div className="order-2 flex flex-col md:order-1">
          <h2
            style={hand}
            className="text-4xl font-bold leading-tight text-[#2b2260] md:text-5xl"
          >
            Focus Today,
            <br />
            Build Tomorrow <span className="text-2xl text-pink-400">♥</span>
          </h2>
          <p
            style={hand}
            className="mt-4 max-w-[16rem] -rotate-3 text-xl leading-snug text-[#6a5bb0]"
          >
            Take a break, grab your focus, and make it happen!
          </p>

          {/* cat on a stack of books */}
          <div className="mt-8 hidden select-none md:block">
            <div className="relative h-32 w-48">
              <div className="absolute bottom-0 left-0 h-8 w-44 rounded-md bg-[#8c7ae6] shadow-md" />
              <div className="absolute bottom-8 left-2 h-8 w-44 rounded-md bg-[#f2a7a7] shadow-md" />
              <div className="absolute bottom-16 left-0 h-8 w-40 rounded-md bg-[#6f63c9] shadow-md" />
              <div className="absolute -top-1 left-8 text-6xl">🐱</div>
              <span className="absolute left-0 top-6 text-pink-400">♥</span>
            </div>
          </div>
        </div>

        {/* ---------------- Center: timer ---------------- */}
        <div className="order-1 flex flex-col items-center md:order-2">
          {/* ring */}
          <div className="relative h-[300px] w-[300px] sm:h-[340px] sm:w-[340px]">
            <svg viewBox="0 0 340 340" className="absolute inset-0 h-full w-full">
              {/* track */}
              <circle
                cx="170"
                cy="170"
                r={R}
                fill="#fbf9ff"
                stroke="#d9cdf7"
                strokeWidth="14"
                strokeLinecap="round"
                strokeDasharray={`${ARC} ${CIRC}`}
                transform={`rotate(${START_ANGLE} 170 170)`}
              />
              {/* progress */}
              <circle
                cx="170"
                cy="170"
                r={R}
                fill="none"
                stroke="#6d4fd8"
                strokeWidth="14"
                strokeLinecap="round"
                strokeDasharray={`${Math.max(0.01, ARC * progress)} ${CIRC}`}
                transform={`rotate(${START_ANGLE} 170 170)`}
                style={{ transition: "stroke-dasharray 1s linear" }}
              />
              {/* knob */}
              <circle
                cx={knobX}
                cy={knobY}
                r="8"
                fill="#ffffff"
                stroke="#6d4fd8"
                strokeWidth="4"
              />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl">{isWork ? "🍅" : "☕"}</span>
              <div className="mt-2 text-6xl font-extrabold tracking-tight text-[#2b2260] tabular-nums sm:text-7xl">
                {formatTime()}
              </div>
              <p className="mt-2 text-sm font-bold text-[#5b4bb0]">
                {isWork ? "Pomodoro Session" : "Break Time"}
              </p>
            </div>
          </div>

          {/* start */}
          <button
            onClick={startTimer}
            className="-mt-2 flex w-64 items-center justify-center gap-3 rounded-full bg-[#5b3fcf] py-4 text-lg font-bold text-white shadow-lg shadow-[#5b3fcf]/30 transition hover:bg-[#4d33b8] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#b9a6f5]"
          >
            <span className="text-base">▶</span> {isRunning ? "Running" : "Start"}
          </button>

          {/* secondary controls */}
          <div className="mt-3 flex gap-3 text-sm font-semibold">
            <button
              onClick={() => setIsRunning(false)}
              className="rounded-full bg-white/70 px-4 py-1.5 text-[#5b4bb0] transition hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#b9a6f5]"
            >
              ⏸ Pause
            </button>
            <button
              onClick={resetTimer}
              className="rounded-full bg-white/70 px-4 py-1.5 text-[#5b4bb0] transition hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#b9a6f5]"
            >
              🔄 Reset
            </button>
          </div>

          {/* presets */}
          <div className="mt-4 flex overflow-hidden rounded-xl border border-[#d9cdf7] bg-white/60 text-sm font-semibold">
            {presets.map((p) => {
              const active = activePreset?.label === p.label && !showCustom;
              return (
                <button
                  key={p.label}
                  onClick={() => applyPreset(p)}
                  className={`w-24 py-2 transition ${
                    active
                      ? "bg-[#5b3fcf] text-white"
                      : "text-[#5b4bb0] hover:bg-white"
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
            <button
              onClick={() => setShowCustom((v) => !v)}
              className={`w-24 py-2 transition ${
                showCustom || !activePreset
                  ? "bg-[#5b3fcf] text-white"
                  : "text-[#5b4bb0] hover:bg-white"
              }`}
            >
              Custom
            </button>
          </div>

          {/* custom intervals */}
          {showCustom && (
            <div className="mt-4 grid w-full max-w-sm grid-cols-2 gap-4 rounded-2xl bg-white/70 p-4">
              <div>
                <label className="mb-1 block text-xs font-bold text-[#5b4bb0]">
                  Work (min)
                </label>
                <input
                  type="number"
                  value={workMinutes}
                  onChange={(e) => setWorkMinutes(Number(e.target.value))}
                  className="w-full rounded-lg border border-[#d9cdf7] bg-white px-3 py-2 text-[#2b2260] outline-none focus:ring-2 focus:ring-[#8c7ae6]"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-[#5b4bb0]">
                  Break (min)
                </label>
                <input
                  type="number"
                  value={breakMinutes}
                  onChange={(e) => setBreakMinutes(Number(e.target.value))}
                  className="w-full rounded-lg border border-[#d9cdf7] bg-white px-3 py-2 text-[#2b2260] outline-none focus:ring-2 focus:ring-[#8c7ae6]"
                />
              </div>
            </div>
          )}
        </div>

        {/* ---------------- Right: encouragement, subject, stats, plant ---------------- */}
        <div className="order-3 flex flex-col items-center gap-5 md:items-end">
          <p
            style={hand}
            className="rotate-6 text-2xl font-bold text-[#5b3fcf] md:mr-4"
          >
          </p>

          <div className="w-full max-w-xs">
            <label className="mb-1 block text-sm font-bold text-[#5b4bb0]">
              What are you studying?
            </label>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g., Mathematics, Programming"
              className="w-full rounded-xl border border-[#d9cdf7] bg-white/80 px-4 py-3 text-[#2b2260] placeholder-[#a898de] outline-none focus:ring-2 focus:ring-[#8c7ae6]"
            />
          </div>

          <div className="grid w-full max-w-xs grid-cols-2 gap-3">
            <div className="rounded-2xl bg-white/70 p-3 text-center">
              <p className="text-xs font-bold text-[#6a5bb0]">Sessions today</p>
              <p className="mt-1 text-3xl font-extrabold text-[#5b3fcf]">
                {sessionsToday}
              </p>
            </div>
            <div className="rounded-2xl bg-white/70 p-3 text-center">
              <p className="text-xs font-bold text-[#6a5bb0]">Total hours</p>
              <p className="mt-1 text-3xl font-extrabold text-[#5b3fcf]">
                {(totalMinutes / 60).toFixed(1)}h
              </p>
            </div>
          </div>

          <div className="hidden select-none text-8xl leading-none md:block">
            🪴
          </div>
        </div>
      </div>
    </div>
  );
}