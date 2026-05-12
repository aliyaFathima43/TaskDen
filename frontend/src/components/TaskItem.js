import { useState } from "react";

function TaskItem({ task, onToggleStatus, onDelete, onSaveEdit, busyTaskId, celebratedTaskId }) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(task.title);
  const isBusy = busyTaskId === task.id;
  const isDone = Boolean(task.status);
  const isCelebrating = celebratedTaskId === task.id;

  const handleSave = () => {
    const trimmedTitle = draftTitle.trim();
    if (!trimmedTitle) {
      return;
    }
    onSaveEdit(task.id, trimmedTitle);
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
            <input
              type="text"
              className="form-control form-control-sm mb-2"
              value={draftTitle}
              onChange={(event) => setDraftTitle(event.target.value)}
              disabled={isBusy}
            />
          ) : (
            <h6 className={`task-title mb-1 ${isDone ? "text-decoration-line-through text-muted" : ""}`}>
              {task.title}
            </h6>
          )}

          <div className="d-flex align-items-center gap-2">
            <small className="text-secondary">{new Date(task.created_at).toLocaleString()}</small>
            <span className={`task-status ${isDone ? "done" : ""}`}>
              {isDone ? "Completed" : "Pending"}
            </span>
          </div>
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
                  setDraftTitle(task.title);
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
