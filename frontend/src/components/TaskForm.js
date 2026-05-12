import { useState } from "react";

const QUICK_IDEAS = ["Study",
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
  "plan outfit",
  "Portfolio",];

function TaskForm({ onSubmit, isSubmitting }) {
  const [title, setTitle] = useState("");

  const submitTitle = (taskTitle) => {
    const trimmedTitle = taskTitle.trim();
    if (!trimmedTitle) {
      return;
    }
    onSubmit(trimmedTitle);
    setTitle("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    submitTitle(title);
  };

  return (
    <form className="card task-form-card shadow-sm border-0 p-3 mb-3" onSubmit={handleSubmit}>
      <label htmlFor="task-title" className="form-label fw-semibold text-secondary mb-2">
        Add a new task
      </label>
      <div className="d-flex gap-2 flex-column flex-sm-row">
        <input
          id="task-title"
          type="text"
          className="form-control rounded-pill px-3 py-2"
          placeholder="What do you need to do?"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          disabled={isSubmitting}
        />
        <button className="btn btn-primary rounded-pill px-4 py-2" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Adding..." : "Add"}
        </button>
      </div>
      <div className="quick-ideas d-flex flex-wrap gap-2 mt-3">
        {QUICK_IDEAS.map((idea) => (
          <button
            className="quick-idea"
            type="button"
            key={idea}
            onClick={() => submitTitle(idea)}
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
