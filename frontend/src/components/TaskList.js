import TaskItem from "./TaskItem";

function TaskList({ tasks, onToggleStatus, onDelete, onSaveEdit, busyTaskId, celebratedTaskId }) {
  if (!tasks.length) {
    return (
      <div className="card task-empty border-0 shadow-sm">
        <div className="card-body text-center text-secondary py-4">
          No tasks found for this filter. Try adding a new one.
        </div>
      </div>
    );
  }

  return (
    <div>
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onToggleStatus={onToggleStatus}
          onDelete={onDelete}
          onSaveEdit={onSaveEdit}
          busyTaskId={busyTaskId}
          celebratedTaskId={celebratedTaskId}
        />
      ))}
    </div>
  );
}

export default TaskList;
