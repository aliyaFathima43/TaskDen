import { useEffect, useState } from "react";

function TaskItem({ task, onToggleStatus, onDelete, onSaveEdit, busyTaskId, celebratedTaskId }) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(task.task);
  const [draftPriority, setDraftPriority] = useState(task.priority || "Medium");
  const isBusy = busyTaskId === task.id;
  const isDone = Boolean(task.is_completed);
  const isCelebrating = celebratedTaskId === task.id;

  useEffect(() => {
    setDraftTitle(task.task);
    setDraftPriority(task.priority || "Medium");
  }, [task.task, task.priority]);

  const handleSave = () => {
    const trimmedTitle = draftTitle.trim();
    if (!trimmedTitle) {
      return;
    }
    onSaveEdit(task.id, trimmedTitle, draftPriority);
    setIsEditing(false);
  };

  return (
    <div className={`card border-0 shadow-sm mb-3 task-item ${isDone ? "is-done" : ""} ${isCelebrating ? "just-completed" : ""}`}>
      {isCelebrating && (
        <div className="task-sparkles" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
      )}
      <div className="card-body d-flex align-items-start gap-3">
        <input
          className="form-check-input mt-1"
          type="checkbox"
          checked={isDone}
          onChange={() => onToggleStatus(task)}
          disabled={isBusy}
        />

        <div className="flex-grow-1">
         {isEditing ? (
  <div className="edit-task-fields">
    <input
      type="text"
      className="form-control form-control-sm"
      value={draftTitle}
      onChange={(event) => setDraftTitle(event.target.value)}
      disabled={isBusy}
    />
    <select
      className="form-select form-select-sm priority-edit-select"
      value={draftPriority}
      onChange={(event) => setDraftPriority(event.target.value)}
      disabled={isBusy}
    >
      <option value="High">High Priority</option>
      <option value="Medium">Medium Priority</option>
      <option value="Low">Low Priority</option>
    </select>
  </div>
) : (
  <>
    <span
      className={`priority-badge priority-${task.priority?.toLowerCase() || "medium"}`}
    >
      {task.priority || "Medium"}
    </span>

    <h6
      className={`task-title mb-1 ${
        isDone ? "text-decoration-line-through text-muted" : ""
      }`}
    >
      {task.task}
    </h6>
  </>
)}
        </div>

        <div className="d-flex gap-2">
          {isEditing ? (
            <>
              <button className="btn btn-success btn-sm" onClick={handleSave} disabled={isBusy}>
                Save
              </button>
              <button
                className="btn btn-outline-secondary btn-sm"
                onClick={() => {
                  setDraftTitle(task.task);
                  setDraftPriority(task.priority || "Medium");
                  setIsEditing(false);
                }}
                disabled={isBusy}
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              className="btn btn-outline-primary btn-sm"
              onClick={() => setIsEditing(true)}
              disabled={isBusy}
            >
              Edit
            </button>
          )}

          <button className="btn btn-outline-danger btn-sm" onClick={() => onDelete(task.id)} disabled={isBusy}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default TaskItem;
