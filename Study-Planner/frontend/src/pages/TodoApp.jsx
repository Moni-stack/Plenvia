import { useState, useEffect } from "react";
import { apiRequest } from "../api";

const categoryStyles = {
  Study: "bg-[#EDE1FA] text-[#6B46A8]",
  Personal: "bg-[#FDF0DE] text-[#B07A2E]",
  Health: "bg-[#F6E2EE] text-[#A65B85]",
  Others: "bg-[#EFEAF5] text-[#7C6E92]",
};

const priorityStyles = {
  High: { active: "bg-[#D9739E] text-white", pill: "bg-[#FBE3EC] text-[#B84B72]" },
  Medium: { active: "bg-[#8B5FBF] text-white", pill: "bg-[#EDE1FA] text-[#6B46A8]" },
  Low: { active: "bg-[#E3B166] text-white", pill: "bg-[#FDF0DE] text-[#B07A2E]" },
};

function CaretDown() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <path d="M7.5 2V13M2 7.5H13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M2 6.2L4.7 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
      <path d="M2 2L11 11M11 2L2 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function CalendarDotIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <rect x="1.5" y="2.5" width="9" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M1.5 5H10.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M4 1.3V3M8 1.3V3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function formatTaskDate(dateString) {
  if (!dateString) return "";

  const date = new Date(`${dateString}T00:00:00`);

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default function TodoApp() {
  const [tasks, setTasks] = useState([]);
  const pendingTasks = tasks
    .filter((task) => task.status !== "completed")
    .sort((a, b) => {
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return a.deadline.localeCompare(b.deadline);
  });

  const completedTasks = tasks
    .filter((task) => task.status === "completed")
    .sort((a, b) => {
      if (!a.completed_at) return 1;
      if (!b.completed_at) return -1;

      return new Date(b.completed_at) - new Date(a.completed_at);
  });

  const [newTask, setNewTask] = useState("");
  const [category, setCategory] = useState("Study");
  const [priority, setPriority] = useState("Medium");
  const [dueDate, setDueDate] = useState("");

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const data = await apiRequest("/tasks");
      setTasks(data);
    } catch (err) {
      console.error("ERROR:", err);
    }
  };

  const addTask = async () => {
    if (newTask.trim() === "") return;

    const taskData = {
      title: newTask,
      description: category,
      priority: priority,
      deadline: dueDate,
    };

    const newTaskFromDB = await apiRequest("/tasks", "POST", taskData);

    setTasks([...tasks, newTaskFromDB]);

    setNewTask("");
    setDueDate("");
  };

  const toggleTask = async (id, currentStatus) => {
    const updatedStatus =
      currentStatus === "completed" ? "pending" : "completed";

    const updatedTask = await apiRequest(`/tasks/${id}`, "PUT", {
      status: updatedStatus,
    });

    setTasks(tasks.map((t) => (t.id === id ? updatedTask : t)));
  };

  const deleteTask = async (id) => {
    await apiRequest(`/tasks/${id}`, "DELETE");

    setTasks(tasks.filter((t) => t.id !== id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fdf3fa] via-[#f7ecfa] to-[#efe4f7] px-4 py-10 flex justify-center">
      <div className="w-full max-w-xl">

        <div className="mb-6 text-center">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-[#b79add]">
            Stay on track
          </p>
          <h1 className="font-display text-3xl font-medium text-[#3a2a4d]">
            Task Planner
          </h1>
        </div>

        {/* ------------ FORM -------------- */}
        <div className="mb-6 rounded-[26px] border border-[#e9dcf1] bg-white/70 p-6 shadow-[0_25px_70px_-30px_rgba(91,58,142,0.4)] backdrop-blur-sm">
          <div className="mb-4">
            <label className="mb-1 block text-xs font-semibold text-[#9c8ab0]">
              Task name
            </label>
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTask()}
              placeholder="What do you need to get done?"
              className="w-full rounded-xl border border-[#e9dcf1] bg-[#fdf9fd] px-3.5 py-2.5 text-sm text-[#3a2a4d] outline-none transition focus:border-[#b79add] focus:bg-white focus:ring-2 focus:ring-[#e9dcf1]"
            />
          </div>

          <div className="mb-4 grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-[#9c8ab0]">
                Category
              </label>
              <div className="relative">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-[#e9dcf1] bg-[#fdf9fd] px-3.5 py-2.5 text-sm text-[#3a2a4d] outline-none transition focus:border-[#b79add] focus:bg-white focus:ring-2 focus:ring-[#e9dcf1]"
                >
                  <option>Study</option>
                  <option>Personal</option>
                  <option>Health</option>
                  <option>Others</option>
                </select>
                <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9c8ab0]">
                  <CaretDown />
                </span>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-[#9c8ab0]">
                Due date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-xl border border-[#e9dcf1] bg-[#fdf9fd] px-3.5 py-2.5 text-sm text-[#3a2a4d] outline-none transition focus:border-[#b79add] focus:bg-white focus:ring-2 focus:ring-[#e9dcf1]"
              />
            </div>
          </div>

          <div className="mb-5">
            <label className="mb-1.5 block text-xs font-semibold text-[#9c8ab0]">
              Priority
            </label>
            <div className="grid grid-cols-3 gap-2">
              {["Low", "Medium", "High"].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setPriority(level)}
                  className={`rounded-xl border py-2 text-sm font-semibold transition ${
                    priority === level
                      ? `border-transparent ${priorityStyles[level].active} shadow-sm`
                      : "border-[#e9dcf1] bg-[#fdf9fd] text-[#9c8ab0] hover:bg-white"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={addTask}
            disabled={!newTask.trim()}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#8b5fbf] to-[#d9739e] py-2.5 text-sm font-semibold text-white shadow-sm transition hover:shadow-md disabled:cursor-not-allowed disabled:opacity-40"
          >
            <PlusIcon />
            Add task
          </button>
        </div>

        {/* ------------- TASK LIST --------------- */}

        {tasks.length === 0 ? (
        <div className="rounded-[26px] border border-dashed border-[#e9dcf1] bg-white/40 p-10 text-center">
          <p className="font-display text-lg text-[#3a2a4d]/70">
          Nothing here yet
          </p>
          <p className="mt-1 text-sm text-[#9c8ab0]">
          Add a task above to get started.
          </p>
        </div>
        ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
 
        {/* ================= IN PROGRESS ================= */}

       <div>
        <div className="mb-3 px-1">
          <h2 className="font-display text-lg font-medium text-[#3a2a4d]">
          🌱 In Progress
          </h2>

          <p className="mt-0.5 text-xs text-[#9c8ab0]">
          Tasks waiting to be completed
          </p>
        </div>

        {pendingTasks.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#e9dcf1] bg-white/40 p-6 text-center">
          <p className="text-sm text-[#9c8ab0]">
            No pending tasks 🎉
          </p>
        </div>
        ) : (
        <div className="space-y-3">
          {pendingTasks.map((task) => (
            <div
              key={task.id}
              className="group flex items-start gap-3 rounded-2xl border border-[#e9dcf1] bg-white/80 p-4 shadow-sm transition hover:shadow-md"
            >

              {/* Complete button */}
              <button
                onClick={() => toggleTask(task.id, task.status)}
                aria-label="Mark as complete"
                className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border border-[#b79add] transition hover:bg-[#f0e6f9]"
              />

              <div className="min-w-0 flex-1">

                {/* Task title */}
                <div className="text-sm font-medium text-[#3a2a4d]">
                  {task.title}
                </div>

                {/* Category / Priority / Date */}
                <div className="mt-2 flex flex-wrap gap-1.5">

                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                      categoryStyles[task.description] ||
                      "bg-[#EFEAF5] text-[#7C6E92]"
                    }`}
                  >
                    {task.description}
                  </span>

                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                      priorityStyles[task.priority]?.pill ||
                      "bg-[#EFEAF5] text-[#7C6E92]"
                    }`}
                  >
                    {task.priority}
                  </span>

                  {task.deadline && (
                    <span className="flex items-center gap-1 rounded-full bg-[#F5F1FA] px-2.5 py-0.5 text-[11px] font-semibold text-[#7C6E92]">
                      <CalendarDotIcon />
                      {formatTaskDate(task.deadline)}
                    </span>
                  )}

                </div>
              </div>

              {/* Delete */}
              <button
                onClick={() => deleteTask(task.id)}
                aria-label="Delete task"
                className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-[#c9bcd8] opacity-0 transition hover:bg-[#FBE3EC] hover:text-[#B84B72] group-hover:opacity-100"
              >
                <CloseIcon />
              </button>

            </div>
          ))}
        </div>
      )}
    </div>


          {/* ================= MY WINS ================= */}

    <div>
      <div className="mb-3 px-1">
        <h2 className="font-display text-lg font-medium text-[#3a2a4d]">
          🏆 My Wins
        </h2>

        <p className="mt-0.5 text-xs text-[#9c8ab0]">
          Tasks you've successfully completed
        </p>
      </div>

      {completedTasks.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#e9dcf1] bg-white/40 p-6 text-center">
          <p className="text-sm text-[#9c8ab0]">
            Your wins will appear here ✨
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {completedTasks.map((task) => (
            <div
              key={task.id}
              className="group flex items-start gap-3 rounded-2xl border border-[#e9dcf1] bg-white/80 p-4 shadow-sm transition hover:shadow-md"
            >

              {/* Completed button */}
              <button
                onClick={() => toggleTask(task.id, task.status)}
                aria-label="Mark as pending"
                className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[#8b5fbf]"
              >
                <CheckIcon />
              </button>

              <div className="min-w-0 flex-1">

                {/* Task title */}
                <div className="text-sm font-medium text-[#9c8ab0] line-through">
                  {task.title}
                </div>

                {/* Category / Priority / Completion */}
                <div className="mt-2 flex flex-wrap gap-1.5">

                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                      categoryStyles[task.description] ||
                      "bg-[#EFEAF5] text-[#7C6E92]"
                    }`}
                  >
                    {task.description}
                  </span>

                  <span className="rounded-full bg-[#EDE1FA] px-2.5 py-0.5 text-[11px] font-semibold text-[#6B46A8]">
                    Completed
                  </span>

                  {task.completed_at && (
                    <span className="flex items-center gap-1 rounded-full bg-[#F5F1FA] px-2.5 py-0.5 text-[11px] font-semibold text-[#7C6E92]">
                      <CalendarDotIcon />
                      {new Date(task.completed_at).toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          day: "numeric",
                        }
                      )}
                    </span>
                  )}

                </div>
              </div>

              {/* Delete */}
              <button
                onClick={() => deleteTask(task.id)}
                aria-label="Delete task"
                className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-[#c9bcd8] opacity-0 transition hover:bg-[#FBE3EC] hover:text-[#B84B72] group-hover:opacity-100"
              >
                <CloseIcon />
              </button>

            </div>
          ))}
        </div>
      )}
    </div>

  </div>
)}
        
    </div>
    </div>
  );
}