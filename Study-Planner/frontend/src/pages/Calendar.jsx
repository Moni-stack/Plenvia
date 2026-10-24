import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { apiRequest } from "../api";

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const categoryStyles = {
  Study: { chip: "bg-[#EDE1FA] text-[#6B46A8]", dot: "bg-[#8B5FBF]" },
  Exam: { chip: "bg-[#FBE3EC] text-[#B84B72]", dot: "bg-[#D9739E]" },
  Personal: { chip: "bg-[#FDF0DE] text-[#B07A2E]", dot: "bg-[#E3B166]" },
};

function ChevronIcon({ direction = "left" }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      className={direction === "right" ? "rotate-180" : ""}
    >
      <path
        d="M10 3L5 8L10 13"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CaretDown() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path
        d="M2.5 4.5L6 8L9.5 4.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Calendar() {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const [selectedDate, setSelectedDate] = useState(null);
  const [newTask, setNewTask] = useState({ title: "", category: "Study" });
  const [isDragging, setIsDragging] = useState(false);

  const [tasks, setTasks] = useState([]);
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const data = await apiRequest("/tasks");
      setTasks(data);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    }
  };

  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else setCurrentMonth(currentMonth - 1);
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else setCurrentMonth(currentMonth + 1);
  };

  const addTask = async () => {
    if (!selectedDate || !newTask.title) return;

    const key = formatLocalDate(selectedDate);

    try {
      const createdTask = await apiRequest("/tasks", "POST", {
        title: newTask.title,
        description: newTask.category,
        priority: "medium",
        deadline: key,
      });

      setTasks(prev => [...prev, createdTask]);

      setNewTask({ title: "", category: "Study" });
      setSelectedDate(null);
    } catch (error) {
      console.error("Failed to create task:", error);
      alert("Failed to create task");
    }
  };

  const handleDragEnd = async (result) => {
  setIsDragging(false);

  if (!result.destination) return;

  const fromDate = result.source.droppableId;
  const toDate = result.destination.droppableId;

  const sourceTasks = tasks.filter(
    task => task.deadline === fromDate
  );

  const movedTask = sourceTasks[result.source.index];

  if (!movedTask) return;

  try {
    const updatedTask = await apiRequest(
      `/tasks/${movedTask.id}`,
      "PUT",
      {
        deadline: toDate,
      }
    );

    setTasks(prev =>
      prev.map(task =>
        task.id === movedTask.id ? updatedTask : task
      )
    );
   } catch (error) {
    console.error("Failed to move task:", error);
    alert("Failed to move task");
   }
  };

  const generateDates = () => {
    const boxes = [];

    for (let i = 0; i < firstDay; i++) boxes.push(null);

    for (let i = 1; i <= daysInMonth; i++) {
      boxes.push(new Date(currentYear, currentMonth, i));
    }

    return boxes;
  };

  const formatLocalDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fdf3fa] via-[#f7ecfa] to-[#efe4f7] px-4 py-10 sm:px-8">
      <div className="mx-auto max-w-6xl rounded-[28px] border border-[#e9dcf1] bg-white/60 p-6 shadow-[0_25px_70px_-25px_rgba(91,58,142,0.35)] sm:p-10">

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <button
            onClick={prevMonth}
            aria-label="Previous month"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#5b3a8e] shadow-sm ring-1 ring-[#e9dcf1] transition hover:-translate-y-0.5 hover:bg-[#f0e6f9] hover:shadow-md active:translate-y-0"
          >
            <ChevronIcon direction="left" />
          </button>

          <div className="text-center">
            <p className="font-display text-3xl font-medium tracking-tight text-[#3a2a4d] sm:text-4xl">
              {monthNames[currentMonth]}
              <span className="ml-2 text-[#b79add]">{currentYear}</span>
            </p>
          </div>

          <button
            onClick={nextMonth}
            aria-label="Next month"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#5b3a8e] shadow-sm ring-1 ring-[#e9dcf1] transition hover:-translate-y-0.5 hover:bg-[#f0e6f9] hover:shadow-md active:translate-y-0"
          >
            <ChevronIcon direction="right" />
          </button>
        </div>

        {/* Week row */}
        <div className="mb-3 grid grid-cols-7 text-center">
          {daysOfWeek.map((d) => (
            <div key={d} className="text-xs font-semibold tracking-wide text-[#9c8ab0]">
              {d}
            </div>
          ))}
        </div>

        <DragDropContext
        onDragStart={() => setIsDragging(true)}
        onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-7 gap-2 sm:gap-3">

            {generateDates().map((date, idx) => {
              if (!date) return <div key={`blank-${idx}`} className="min-h-[110px]" />;

              const key = formatLocalDate(date);
              const isToday = key === formatLocalDate(today);
              const dayTasks = tasks.filter(task => task.deadline === key);
              
              return (
                <Droppable droppableId={key} key={key}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      onClick={() => {
                        if (!isDragging) {
                          setSelectedDate(date);
                        }
                      }}
                      className={`group flex min-h-[110px] cursor-pointer flex-col gap-1 rounded-2xl border p-2.5 transition
                        ${isToday
                          ? "border-[#d9739e]/40 bg-white shadow-[0_8px_20px_-8px_rgba(217,115,158,0.45)]"
                          : "border-transparent bg-white/70 hover:bg-white hover:shadow-[0_8px_20px_-10px_rgba(91,58,142,0.3)]"}
                        ${snapshot.isDraggingOver ? "ring-2 ring-[#b79add]" : ""}`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-sm font-semibold ${
                            isToday
                              ? "flex h-6 w-6 items-center justify-center rounded-full bg-[#d9739e] text-white"
                              : "text-[#5b3a8e]/80"
                          }`}
                        >
                          {date.getDate()}
                        </span>
                      </div>

                      <div className="flex flex-col gap-1">
                        {dayTasks.map((task, i) => (
                          <Draggable
                          draggableId={String(task.id)}
                          index={i}
                          key={task.id}
                          >
                          {(drag, dragSnapshot) => (
                          <div
                          ref={drag.innerRef}
                          {...drag.draggableProps}
                          {...drag.dragHandleProps}
                          className={`relative flex cursor-grab items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] font-medium
                            ${categoryStyles[task.category]?.chip || "bg-[#f0e6f9] text-[#5b3a8e]"}
                            ${dragSnapshot.isDragging ? "z-50 cursor-grabbing shadow-xl" : ""}`}
                            >
                            <span
                            className={`h-1.5 w-1.5 flex-shrink-0 rounded-full
                              ${categoryStyles[task.category]?.dot || "bg-[#8b5fbf]"}`}
                              />
                              <span className="truncate">{task.title}</span>
                              </div>
                            )}
                            </Draggable>
                        ))}
                      </div>

                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              );
            })}
          </div>
        </DragDropContext>
      </div>

      {/* Modal */}
      {selectedDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#3a2a4d]/30 px-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-[24px] border border-[#e9dcf1] bg-white p-7 shadow-[0_30px_80px_-20px_rgba(91,58,142,0.45)]">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-[#b79add]">
              New task
            </p>
            <h3 className="mb-5 font-display text-xl font-medium text-[#3a2a4d]">
              {selectedDate.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
            </h3>

            <label className="mb-1 block text-xs font-semibold text-[#9c8ab0]">Task name</label>
            <input
              autoFocus
              className="mb-4 w-full rounded-xl border border-[#e9dcf1] bg-[#fdf9fd] px-3.5 py-2.5 text-sm text-[#3a2a4d] outline-none transition focus:border-[#b79add] focus:bg-white focus:ring-2 focus:ring-[#e9dcf1]"
              placeholder="e.g. Finish reading notes"
              value={newTask.title}
              onChange={e => setNewTask({ ...newTask, title: e.target.value })}
              onKeyDown={e => e.key === "Enter" && addTask()}
            />

            <label className="mb-1 block text-xs font-semibold text-[#9c8ab0]">Category</label>
            <div className="relative mb-6">
              <select
                className="w-full appearance-none rounded-xl border border-[#e9dcf1] bg-[#fdf9fd] px-3.5 py-2.5 text-sm text-[#3a2a4d] outline-none transition focus:border-[#b79add] focus:bg-white focus:ring-2 focus:ring-[#e9dcf1]"
                value={newTask.category}
                onChange={e => setNewTask({ ...newTask, category: e.target.value })}
              >
                {Object.keys(categoryStyles).map(c => (
                  <option key={c}>{c}</option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9c8ab0]">
                <CaretDown />
              </span>
            </div>

            <button
              onClick={addTask}
              disabled={!newTask.title}
              className="mb-2 w-full rounded-xl bg-gradient-to-r from-[#8b5fbf] to-[#d9739e] py-2.5 text-sm font-semibold text-white shadow-sm transition hover:shadow-md disabled:cursor-not-allowed disabled:opacity-40"
            >
              Add task
            </button>

            <button
              onClick={() => setSelectedDate(null)}
              className="w-full py-2 text-sm font-medium text-[#9c8ab0] transition hover:text-[#3a2a4d]"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Calendar;
