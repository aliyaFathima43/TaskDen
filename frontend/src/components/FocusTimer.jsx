import { useEffect, useState } from "react";

function FocusTimer() {
  const totalSeconds = 25 * 60;
  const [seconds, setSeconds] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let timer;

    if (isRunning && seconds > 0) {
      timer = setInterval(() => {
        setSeconds((prev) => prev - 1);
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [isRunning, seconds]);

  const progress = Math.round(((totalSeconds - seconds) / totalSeconds) * 100);
  const hasStarted = seconds < totalSeconds;
  const minutes = String(Math.floor(seconds / 60)).padStart(2, "0");
  const secs = String(seconds % 60).padStart(2, "0");

  const handleReset = () => {
    setSeconds(25 * 60);
    setIsRunning(false);
  };

  return (
    <div className="focus-card mb-4">
      <div className="focus-glow" aria-hidden="true" />
      <div className="focus-header">
        <div>
          <p className="focus-label">Focus Session</p>
          <h3 className="focus-title">Deep work sprint</h3>
        </div>
        <span className={`focus-state ${isRunning ? "is-running" : ""}`}>
          {isRunning ? "Running" : "Ready"}
        </span>
      </div>

      <div className="focus-display">
        <div className="focus-ring" style={{ "--focus-progress": `${progress * 3.6}deg` }}>
          <div className="focus-ring-inner">
            <span className="focus-time">
              {minutes}:{secs}
            </span>
            <small>{progress}% complete</small>
          </div>
        </div>
      </div>

      <div className="focus-progress-track" aria-hidden="true">
        <span style={{ width: `${progress}%` }} />
      </div>

      <div className="focus-actions d-flex gap-2 justify-content-center mt-3">
        <button
          className="btn btn-light px-4"
          onClick={() => setIsRunning(true)}
          disabled={isRunning}
        >
          {hasStarted && !isRunning ? "Resume" : "Start"}
        </button>

        <button
          className="btn btn-outline-light px-4"
          onClick={() => setIsRunning(false)}
        >
          Pause
        </button>

        <button
          className="btn btn-outline-light px-4"
          onClick={handleReset}
        >
          Reset
        </button>
      </div>
    </div>
  );
}

export default FocusTimer;
