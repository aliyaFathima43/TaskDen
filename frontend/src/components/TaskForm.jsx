import { useRef, useState } from "react";

const QUICK_IDEAS = [
  "Study",
  "Workout",
  "Pray",
  "Read",
  "Code",
  "Journal",
  "Revise",
  "Hydrate",
  "Meditate",
  "Clean room",
  "Skin care",
  "Plan outfit",
  "Portfolio",
];

function TaskForm({ onSubmit, isSubmitting }) {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("");
  const [showPriorityReminder, setShowPriorityReminder] = useState(false);
  const prioritySelectRef = useRef(null);

  const submitTitle = (taskTitle, selectedPriority = priority) => {
    const trimmedTitle = taskTitle.trim();

    if (!trimmedTitle) return;
    if (!selectedPriority) {
      setShowPriorityReminder(true);
      window.setTimeout(() => prioritySelectRef.current?.focus(), 0);
      return;
    }

    onSubmit(trimmedTitle, selectedPriority);
    setTitle("");
    setPriority("");
    setShowPriorityReminder(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    submitTitle(title);
  };

  const handleTitleKeyDown = (event) => {
    if (event.key !== "Enter") {
      return;
    }

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      return;
    }

    event.preventDefault();
    if (priority) {
      submitTitle(trimmedTitle, priority);
      return;
    }

    setShowPriorityReminder(true);
    window.setTimeout(() => prioritySelectRef.current?.focus(), 0);
  };

  const handleQuickIdea = (idea) => {
    setTitle(idea);
    setPriority("");
    setShowPriorityReminder(true);
    window.setTimeout(() => prioritySelectRef.current?.focus(), 0);
  };

  const handlePriorityChange = (event) => {
    const selectedPriority = event.target.value;
    setPriority(selectedPriority);
    setShowPriorityReminder(false);

    if (title.trim()) {
      submitTitle(title, selectedPriority);
    }
  };

  return (
    <form
      className="card task-form-card shadow-sm border-0 p-3 mb-3"
      onSubmit={handleSubmit}
    >
      <label
        htmlFor="task-title"
        className="form-label fw-semibold text-secondary mb-2"
      >
        Add a new task
      </label>

      <div className="d-flex gap-2 flex-column flex-sm-row">
        <input
          id="task-title"
          type="text"
          className="form-control rounded-pill px-3 py-2"
          placeholder="Type your task, then tap +"
          value={title}
          onChange={(event) => {
            setTitle(event.target.value);
            if (showPriorityReminder) {
              setShowPriorityReminder(false);
            }
          }}
          onKeyDown={handleTitleKeyDown}
          disabled={isSubmitting}
        />

       <button
  className="btn btn-primary rounded-circle add-task-btn"
  type="button"
  disabled={isSubmitting}
  onClick={() => submitTitle(title)}
>
  +
</button>
      </div>
      <div className="mt-3">
  <select
    ref={prioritySelectRef}
    className={`form-select rounded-pill bg-white text-dark priority-select ${
      showPriorityReminder ? "is-priority-reminder" : ""
    }`}
    value={priority}
    onChange={handlePriorityChange}
    onBlur={() => setShowPriorityReminder(false)}
    disabled={isSubmitting}
  >
    <option value="">Choose priority</option>
    <option value="High">High Priority</option>
    <option value="Medium">Medium Priority</option>
    <option value="Low">Low Priority</option>
  </select>
</div>

      <div className="quick-ideas d-flex flex-wrap gap-2 mt-3">
        {QUICK_IDEAS.map((idea) => (
          <button
            className="quick-idea"
            type="button"
            key={idea}
            onClick={() => handleQuickIdea(idea)}
            disabled={isSubmitting}
          >
            {idea}
          </button>
        ))}
      </div>
    </form>
  );
}

export default TaskForm;
