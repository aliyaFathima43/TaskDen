const FILTERS = [
  { key: "all", label: "All" },
  { key: "completed", label: "Completed" },
  { key: "pending", label: "Pending" }
];

function TaskFilters({ activeFilter, onChange }) {
  return (
    <div className="d-flex flex-wrap gap-2 mb-3 align-items-center">
      <span className="small text-secondary me-1">View:</span>
      {FILTERS.map((filter) => (
        <button
          key={filter.key}
          type="button"
          className={`btn btn-sm rounded-pill px-3 ${
            activeFilter === filter.key ? "btn-primary" : "btn-outline-primary"
          }`}
          onClick={() => onChange(filter.key)}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}

export default TaskFilters;
