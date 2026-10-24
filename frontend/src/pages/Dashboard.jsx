import { useState, useEffect } from "react";
import TodoApp from "./TodoApp";
import Calendar from "./Calendar";
import Leaderboard from "./Leaderboard";
import PomodoroTimer from "./Pomodorotimer";
import Analytics from "./Analytics";
import { apiRequest } from "../api";

function Dashboard() {
  const [todayTasks, setTodayTasks] = useState([]);
  const [studyStats, setStudyStats] = useState({
    total_minutes: 0,
    sessions: 0,
  });
  const [streak, setStreak] = useState(0);

  const fetchTodayTasks = async () => {
    try {
      const data = await apiRequest("/tasks");

      const today = new Date();

      const todayKey =
        `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

      const filteredTasks = data.filter(
        task =>
          task.deadline === todayKey &&
          task.status !== "completed"
        );

      setTodayTasks(filteredTasks);
    } catch (error) {
      console.error("Failed to fetch today's tasks:", error);
    }
  };

  const fetchStudyStats = async () => {
    try {
      const data = await apiRequest("/study-sessions/today");
      setStudyStats(data);
    } catch (error) {
      console.error("Failed to fetch study stats:", error);
    }
  };

  const fetchStreak = async () => {
    try {
      const data = await apiRequest("/streak");
      setStreak(data.current_streak);
    } catch (error) {
      console.error("Failed to fetch streak:", error);
    }
  };

  const [activePage, setActivePage] = useState("dashboard");
  useEffect(() => {
    if (activePage === "dashboard") {
      fetchTodayTasks();
      fetchStudyStats();
      fetchStreak();
    }
  }, [activePage]);

  const menuItems = [
    { name: "Dashboard", key: "dashboard" },
    { name: "Tasks", key: "tasks" },
    { name: "Calendar", key: "calendar" },
    { name: "Leaderboard", key: "leaderboard" },
    { name: "Analytics", key: "analytics" },
    { name: "Profile", key: "profile" },
    { name: "Goals", key: "goals" },
    { name: "Settings", key: "settings" },
  ];

  /* ---------- display-only helpers ---------- */
  const priorityStyle = (p) => {
    const v = String(p || "").toLowerCase();
    if (v === "high") return "bg-rose-50 text-rose-600 ring-rose-200";
    if (v === "medium") return "bg-amber-50 text-amber-600 ring-amber-200";
    if (v === "low") return "bg-emerald-50 text-emerald-600 ring-emerald-200";
    return "bg-violet-50 text-violet-600 ring-violet-200";
  };

  const MAX_VISIBLE_TASKS = 4;
  const visibleTasks = todayTasks.slice(0, MAX_VISIBLE_TASKS);
  const hiddenCount = todayTasks.length - visibleTasks.length;

  const statCards = [
    {
      title: "Today's tasks",
      icon: "📌",
      value: todayTasks.length,
      sub: todayTasks.length === 1 ? "task remaining" : "tasks remaining",
      chip: "bg-fuchsia-100",
      onClick: () => setActivePage("tasks"),
    },
    {
      title: "Study time",
      icon: "⏱",
      value: `${Math.floor(studyStats.total_minutes / 60)}h ${studyStats.total_minutes % 60}m`,
      sub: "focused today",
      chip: "bg-violet-100",
      onClick: () => setActivePage("analytics"),
    },
    {
      title: "Streak",
      icon: "🔥",
      value: streak,
      sub: streak === 1 ? "day in a row" : "days in a row",
      chip: "bg-orange-100",
      onClick: () => setActivePage("leaderboard"),
    },
    {
      title: "Goals",
      icon: "🎯",
      value: "0/1",
      sub: "set a goal",
      chip: "bg-emerald-100",
      onClick: () => setActivePage("goals"),
    },
  ];

  return (
    <div
      style={{ fontFamily: "'Nunito', system-ui, sans-serif" }}
      className="flex h-screen flex-col overflow-hidden bg-gradient-to-br from-[#f6f0ff] via-[#eee9ff] to-[#e6f3ff] text-[#2b2260]"
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap');`}</style>

      {/* ================= TOP NAV ================= */}
      <header className="shrink-0 px-8 pt-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setActivePage("dashboard")}
            className="text-3xl font-extrabold tracking-tight text-[#1f1a3d]"
          >
            Plenvia
          </button>

          <nav className="flex flex-wrap items-center justify-end gap-x-6 gap-y-1">
            {menuItems.map((item) => (
              <button
                key={item.key}
                onClick={() => setActivePage(item.key)}
                className={`py-1 text-base font-semibold transition ${
                  activePage === item.key
                    ? "text-[#5b3fcf] underline decoration-2 underline-offset-8"
                    : "text-[#4a4378] hover:text-[#5b3fcf]"
                }`}
              >
                {item.name}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Page Content */}
      <main
        className={`min-h-0 flex-1 px-8 pb-6 pt-4 ${
          activePage === "dashboard" ? "overflow-hidden" : "overflow-y-auto"
        }`}
      >
        {/* ================= DASHBOARD ================= */}
        {activePage === "dashboard" && (
          <div className="flex h-full flex-col gap-4">
            {/* Greeting */}
            <div className="shrink-0">
              <h1 className="text-2xl font-extrabold tracking-tight text-[#1f1a3d]">
                Hey Monisha
              </h1>
              <p className="text-sm font-semibold text-[#7a6cc0]">
                Small steps today, big results tomorrow
              </p>
            </div>

            {/* Stats */}
            <div className="grid shrink-0 grid-cols-2 gap-4 md:grid-cols-4">
              {statCards.map((c) => (
                <button
                  key={c.title}
                  onClick={c.onClick}
                  className="flex items-center gap-3 rounded-2xl border border-white/80 bg-white/70 px-4 py-3 text-left shadow-sm shadow-violet-200/50 backdrop-blur transition hover:bg-white"
                >
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg ${c.chip}`}
                  >
                    {c.icon}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#7a6cc0]">{c.title}</p>
                    <p className="text-xl font-extrabold leading-tight text-[#1f1a3d]">
                      {c.value}
                      <span className="ml-2 text-xs font-semibold text-[#8a7cc8]">
                        {c.sub}
                      </span>
                    </p>
                  </div>
                </button>
              ))}
            </div>

            {/* Pomodoro + Today's Tasks */}
            <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-[1.75fr_1fr]">
              <div className="min-h-0 overflow-hidden rounded-3xl">
                <PomodoroTimer />
              </div>

              {/* Today's Tasks */}
              <section className="flex min-h-0 flex-col overflow-hidden rounded-3xl border border-white/80 bg-white/75 p-5 shadow-lg shadow-violet-200/40 backdrop-blur">
                <div className="flex shrink-0 items-center justify-between">
                  <h2 className="text-lg font-extrabold text-[#2b2260]">
                    Today's tasks
                  </h2>
                  <button
                    onClick={() => setActivePage("tasks")}
                    className="text-sm font-bold text-[#5b3fcf] transition hover:text-[#3b2a9a]"
                  >
                    View all
                  </button>
                </div>

                <div className="mt-3 min-h-0 flex-1 overflow-hidden">
                  {todayTasks.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center text-center">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 text-3xl">
                        📋
                      </div>
                      <p className="mt-3 text-base font-extrabold text-[#2b2260]">
                        Nothing due today
                      </p>
                      <p className="mt-1 text-sm font-semibold text-[#7a6cc0]">
                        Plan ahead or take a breather.
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-violet-100">
                      {visibleTasks.map((task) => (
                        <div
                          key={task.id}
                          className="flex items-center gap-3 py-3"
                        >
                          <span className="h-5 w-5 shrink-0 rounded-md border-2 border-violet-300 bg-violet-50" />
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-bold text-[#2b2260]">
                              {task.title}
                            </p>
                            {task.description && (
                              <p className="truncate text-xs font-semibold text-[#8a7cc8]">
                                {task.description}
                              </p>
                            )}
                          </div>
                          {task.priority && (
                            <span
                              className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold capitalize ring-1 ${priorityStyle(
                                task.priority
                              )}`}
                            >
                              {task.priority}
                            </span>
                          )}
                        </div>
                      ))}

                      {hiddenCount > 0 && (
                        <button
                          onClick={() => setActivePage("tasks")}
                          className="w-full pt-3 text-center text-sm font-bold text-[#5b3fcf] hover:underline"
                        >
                          +{hiddenCount} more task{hiddenCount !== 1 ? "s" : ""}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </section>
            </div>
          </div>
        )}

        {/* ================= TASKS ================= */}
        {activePage === "tasks" && (
          <div className="rounded-2xl bg-white/80 p-6 shadow-lg">
            <TodoApp />
          </div>
        )}

        {/* ================= CALENDAR ================= */}
        {activePage === "calendar" && (
          <div className="rounded-2xl bg-white/80 p-6 shadow-lg">
            <Calendar />
          </div>
        )}

        {/* ================= LEADERBOARD ================= */}
        {activePage === "leaderboard" && <Leaderboard />}

        {activePage === "analytics" && <Analytics />}

        {/* ================= PLACEHOLDER ================= */}
        {!["dashboard", "tasks", "calendar", "leaderboard", "analytics"].includes(
          activePage
        ) && (
          <div className="rounded-2xl bg-white/80 p-6 text-gray-600 shadow-lg">
            🚧 {activePage} section coming soon
          </div>
        )}
      </main>
    </div>
  );
}

export default Dashboard;