import MotivationCard from "../components/MotivationCard";
import FocusTimer from "../components/FocusTimer";
import { useCallback, useEffect, useMemo, useState } from "react";
import TaskFilters from "../components/TaskFilters";
import TaskForm from "../components/TaskForm";
import TaskList from "../components/TaskList";
import { supabase } from "../supabaseClient";
import { applyTheme, getInitialTheme, toggleTheme } from "../theme";

const PROGRESS_KEY = "todo_last_progress";
const PERFECT_DAYS_KEY = "todo_perfect_days";
const PERFECT_SIGNATURE_KEY = "todo_last_perfect_signature";

function getTodoErrorMessage(error, fallbackMessage) {
  if (error?.message?.toLowerCase().includes("row-level security")) {
    return "Supabase RLS is blocking todos. Run the SQL in supabase-todos-rls.sql once in your Supabase SQL editor.";
  }

  return error?.message || fallbackMessage;
}

function getDisplayName(email) {
  const rawName = String(email || "").split("@")[0];
  const firstName = rawName.split(/[._-]/)[0].replace(/[^a-zA-Z]/g, "");

  if (!firstName) {
    return "User";
  }

  return firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
}

function Dashboard({ user }) {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [busyTaskId, setBusyTaskId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [theme, setTheme] = useState(getInitialTheme());
  const [progressInsight, setProgressInsight] = useState("");
  const [celebratedTaskId, setCelebratedTaskId] = useState(null);
  const [celebrationMessage, setCelebrationMessage] = useState("");
  const [showPerfectDay, setShowPerfectDay] = useState(false);
  const [perfectDays, setPerfectDays] = useState(Number(localStorage.getItem(PERFECT_DAYS_KEY) || "0"));

  const fetchTasks = useCallback(async () => {
    if (!user?.id) {
      setTasks([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    const { data, error } = await supabase
      .from("todos")
      .select("id, task, priority, is_completed, user_id")
      .eq("user_id", user.id)
      .order("id", { ascending: false });

    if (error) {
      setErrorMessage(getTodoErrorMessage(error, "Could not load tasks."));
      setTasks([]);
    } else {
      setTasks(data ?? []);
    }

    setIsLoading(false);
  }, [user?.id]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const filteredTasks = useMemo(() => {
    if (filter === "completed") {
      return tasks.filter((task) => Boolean(task.is_completed));
    }
    if (filter === "pending") {
      return tasks.filter((task) => !task.is_completed);
    }
    return tasks;
  }, [tasks, filter]);

  const taskStats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((task) => Boolean(task.is_completed)).length;
    const pending = total - completed;
    const progress = total ? Math.round((completed / total) * 100) : 0;

    return { total, completed, pending, progress };
  }, [tasks]);

  const dashboardMood = useMemo(() => {
    if (!taskStats.total) {
      return {
        label: "Fresh Start",
        title: "Build your day beautifully.",
        text: "Add a few gentle priorities and let TaskDen keep them tidy."
      };
    }

    if (taskStats.progress === 100) {
      return {
        label: "All Clear",
        title: "Everything is wrapped up.",
        text: "That is a very satisfying kind of calm."
      };
    }

    if (taskStats.progress >= 70) {
      return {
        label: "Glowing",
        title: "You are close to done.",
        text: "A little more focus and this list is yours."
      };
    }

    return {
      label: "Smart Progress",
      title: "Plan your day with clarity and calm.",
      text: "Stay focused with secure tasks and personalized insights."
    };
  }, [taskStats.progress, taskStats.total]);

  useEffect(() => {
    const previousProgress = Number(localStorage.getItem(PROGRESS_KEY) || "0");
    if (taskStats.progress > previousProgress) {
      setProgressInsight("You are more productive than yesterday.");
    } else if (taskStats.progress >= 70) {
      setProgressInsight("Great job! You completed 70% of your tasks.");
    } else {
      setProgressInsight("Let's make today productive.");
    }
    localStorage.setItem(PROGRESS_KEY, String(taskStats.progress));
  }, [taskStats.progress]);

  useEffect(() => {
    if (taskStats.total > 0 && taskStats.progress === 100) {
      const perfectSignature = tasks
        .map((task) => task.id)
        .sort((first, second) => Number(first) - Number(second))
        .join("-");
      const previousSignature = localStorage.getItem(PERFECT_SIGNATURE_KEY);
      setShowPerfectDay(true);
      if (perfectSignature !== previousSignature) {
        localStorage.setItem(PERFECT_SIGNATURE_KEY, perfectSignature);
        setPerfectDays((previous) => {
          const nextPerfectDays = previous + 1;
          localStorage.setItem(PERFECT_DAYS_KEY, String(nextPerfectDays));
          return nextPerfectDays;
        });
      }
      const timerId = window.setTimeout(() => setShowPerfectDay(false), 6500);
      return () => window.clearTimeout(timerId);
    }
    return undefined;
  }, [taskStats.progress, taskStats.total, tasks]);

  const handleCreateTask = async (title, priority = "Medium") => {
    if (!user?.id) {
      setErrorMessage("Please log in before adding tasks.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    const { data, error } = await supabase
      .from("todos")
      .insert([
        {
          task: title,
          priority: priority || "Medium",
          is_completed: false,
          user_id: user.id,
        },
      ])
      .select("id, task, priority, is_completed, user_id")
      .single();
    if (error) {
      setErrorMessage(getTodoErrorMessage(error, "Could not create task."));
    } else if (data) {
      setTasks((previous) => [data, ...previous]);
    }

    setIsSubmitting(false);
  };

  const handleToggleStatus = async (task) => {
    if (!user?.id) {
      return;
    }

    setBusyTaskId(task.id);
    setErrorMessage("");

    const { data, error } = await supabase
      .from("todos")
      .update({ is_completed: !task.is_completed })
      .eq("id", task.id)
      .eq("user_id", user.id)
      .select("id, task, priority, is_completed, user_id")
      .single();

    if (error) {
      setErrorMessage(getTodoErrorMessage(error, "Could not update task status."));
    } else if (data) {
      setTasks((previous) => previous.map((item) => (item.id === task.id ? data : item)));
      if (!task.is_completed && data.is_completed) {
        setCelebratedTaskId(task.id);
        setCelebrationMessage("Task completed. Beautiful progress.");
        window.setTimeout(() => setCelebratedTaskId(null), 1200);
        window.setTimeout(() => setCelebrationMessage(""), 2200);
      }
    }

    setBusyTaskId(null);
  };

  const handleSaveEdit = async (taskId, title, priority = "Medium") => {
    if (!user?.id) {
      return;
    }

    setBusyTaskId(taskId);
    setErrorMessage("");

    const { data, error } = await supabase
      .from("todos")
      .update({ task: title, priority: priority || "Medium" })
      .eq("id", taskId)
      .eq("user_id", user.id)
      .select("id, task, priority, is_completed, user_id")
      .single();

    if (error) {
      setErrorMessage(getTodoErrorMessage(error, "Could not update task."));
    } else if (data) {
      setTasks((previous) => previous.map((item) => (item.id === taskId ? data : item)));
    }

    setBusyTaskId(null);
  };

  const handleDeleteTask = async (taskId) => {
    if (!user?.id) {
      return;
    }

    setBusyTaskId(taskId);
    setErrorMessage("");

    const { error } = await supabase.from("todos").delete().eq("id", taskId).eq("user_id", user.id);

    if (error) {
      setErrorMessage(getTodoErrorMessage(error, "Could not delete task."));
    } else {
      setTasks((previous) => previous.filter((task) => task.id !== taskId));
    }

    setBusyTaskId(null);
  };

  const handleClearCompleted = async () => {
    if (!user?.id) {
      return;
    }

    const completedTasks = tasks.filter((task) => Boolean(task.is_completed));
    if (!completedTasks.length) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    const { error } = await supabase
      .from("todos")
      .delete()
      .eq("user_id", user.id)
      .eq("is_completed", true);

    if (error) {
      setErrorMessage(getTodoErrorMessage(error, "Could not clear completed tasks."));
    } else {
      setTasks((previous) => previous.filter((task) => !task.is_completed));
      setCelebrationMessage("Completed tasks cleared. Fresh space, fresh focus.");
      window.setTimeout(() => setCelebrationMessage(""), 2200);
    }

    setIsSubmitting(false);
  };

  const focusTaskInput = () => {
    setShowPerfectDay(false);
    window.setTimeout(() => document.getElementById("task-title")?.focus(), 120);
  };

  const logout = async () => {
    setErrorMessage("");
    const { error } = await supabase.auth.signOut();
    if (error) {
      setErrorMessage(error.message || "Could not log out.");
    }
  };

  const displayName = getDisplayName(user?.email);

  return (
    <div className="app-shell">
      {celebrationMessage && (
        <div className="celebration-toast" role="status">
          {celebrationMessage}
        </div>
      )}
      {celebratedTaskId && (
        <div className="confetti-layer" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
      )}
      {showPerfectDay && (
        <div className="perfect-day-celebration" role="dialog" aria-modal="true" aria-label="All tasks completed">
          <div className="perfect-day-burst" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>
          <div className="perfect-day-card">
            <p className="perfect-day-kicker">100% complete</p>
            <h2>You did it beautifully.</h2>
            <p>
              Every task is wrapped up for today. Take a breath, enjoy the win, and come back tomorrow for another calm,
              focused reset.
            </p>
            <div className="perfect-day-count">Perfect days: {perfectDays}</div>
            <div className="d-flex justify-content-center gap-2 flex-wrap">
              <button className="btn btn-primary px-4 py-2" onClick={focusTaskInput}>
                Plan Next Task
              </button>
              <button className="btn btn-outline-primary px-4 py-2" onClick={() => setShowPerfectDay(false)}>
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="container py-4 py-md-5">
        <div className="d-flex justify-content-between align-items-center mb-3 gap-2">
          <div>
            <h1 className="h4 fw-bold mb-1">Welcome back, {displayName}</h1>
            <p className="text-secondary mb-0">{progressInsight}</p>
          </div>
          <div className="d-flex gap-2">
            <button className="btn btn-outline-secondary btn-sm" onClick={() => setTheme(toggleTheme(theme))}>
              {theme === "dark" ? "Light Mode" : "Dark Mode"}
            </button>
            <button className="btn btn-outline-danger btn-sm" onClick={logout}>
              Logout
            </button>
          </div>
        </div>

        <section className="hero-banner mb-4 mb-md-5">
          <div className="row align-items-center g-4">
            <div className="col-lg-7">
              <span className="hero-chip">{dashboardMood.label}</span>
              <h2 className="hero-title mt-3 mb-2">{dashboardMood.title}</h2>
              <p className="hero-text mb-3">{dashboardMood.text}</p>
              <div className="hero-mini-grid">
                <span>{taskStats.pending} waiting</span>
                <span>{taskStats.completed} completed</span>
              </div>
            </div>
            <div className="col-lg-5">
              <div className="hero-graphic mx-auto">
                <div className="orb orb-1" />
                <div className="orb orb-2" />
                <div className="orb orb-3" />
                <div className="hero-panel">
                  <small className="text-white-50">Completion Progress</small>
                  <h2 className="text-white fw-bold mb-1">{taskStats.progress}%</h2>
                  <div className="progress bg-white bg-opacity-25" style={{ height: "8px" }}>
                    <div className="progress-bar bg-light" style={{ width: `${taskStats.progress}%` }} />
                  </div>
                  <div className="progress-ring" style={{ "--progress": `${taskStats.progress * 3.6}deg` }}>
                    <span>{taskStats.progress}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="row g-3 mb-4">
          <div className={`streak-card mb-4 streak-${perfectDays}`}>
  <div className="d-flex justify-content-between align-items-center">
    <div>
      <p className="streak-label mb-1">Current Streak</p>
      <h3 className="streak-value mb-0">
        🔥 {perfectDays} Day{perfectDays === 1 ? "" : "s"}
      </h3>
    </div>

    <div className="streak-badge">
  {perfectDays === 0 && "Start today 🌱"}
  {perfectDays > 0 && perfectDays < 3 && "Getting started ✨"}
  {perfectDays >= 3 && perfectDays < 7 && "Building momentum 🔥"}
  {perfectDays >= 7 && "Unstoppable 💀🔥"}
</div>
  </div>
</div>
          <div className="col-4">
            <div className="stat-card">
              <p className="stat-label">Total</p>
              <h3 className="stat-value">{taskStats.total}</h3>
            </div>
          </div>
          <div className="col-4">
            <div className="stat-card">
              <p className="stat-label">Done</p>
              <h3 className="stat-value text-success">{taskStats.completed}</h3>
            </div>
          </div>
          <div className="col-4">
            <div className="stat-card">
              <p className="stat-label">Pending</p>
              <h3 className="stat-value text-primary">{taskStats.pending}</h3>
            </div>
          </div>
        </div>

        <div className="mx-auto dashboard-card">
          <MotivationCard />
          <FocusTimer />
          <TaskForm onSubmit={handleCreateTask} isSubmitting={isSubmitting} />
          <TaskFilters activeFilter={filter} onChange={setFilter} />
          {taskStats.completed > 0 && (
            <div className="task-actions-row d-flex justify-content-between align-items-center gap-2 flex-wrap mb-3">
              <span className="small text-secondary">
                {taskStats.completed} completed task{taskStats.completed === 1 ? "" : "s"} ready to archive.
              </span>
              <button className="btn btn-outline-secondary btn-sm" onClick={handleClearCompleted} disabled={isSubmitting}>
                Clear Completed
              </button>
            </div>
          )}

          {errorMessage && <div className="alert alert-danger py-2">{errorMessage}</div>}
          {isLoading ? (
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center py-4">Loading tasks...</div>
            </div>
          ) : (
            <TaskList
              tasks={filteredTasks}
              onToggleStatus={handleToggleStatus}
              onDelete={handleDeleteTask}
              onSaveEdit={handleSaveEdit}
              busyTaskId={busyTaskId}
              celebratedTaskId={celebratedTaskId}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
