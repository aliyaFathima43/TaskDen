import { useEffect, useState } from "react";

function FocusTimer() {
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [minutesInput, setMinutesInput] = useState("0");
  const [secondsInput, setSecondsInput] = useState("0");
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let timer;

    if (isRunning && seconds > 0) {
      timer = setInterval(() => {
        setSeconds((prev) => prev - 1);
      }, 1000);
    } else if (isRunning && seconds === 0) {
      setIsRunning(false);
    }

    return () => clearInterval(timer);
  }, [isRunning, seconds]);

  const progress = durationSeconds ? Math.round(((durationSeconds - seconds) / durationSeconds) * 100) : 0;
  const hasStarted = durationSeconds > 0 && seconds < durationSeconds;
  const minutes = String(Math.floor(seconds / 60)).padStart(2, "0");
  const secs = String(seconds % 60).padStart(2, "0");
  const canStart = seconds > 0;
  const isComplete = durationSeconds > 0 && seconds === 0;
  const statusLabel = isRunning ? "Running" : isComplete ? "Done" : hasStarted ? "Paused" : durationSeconds > 0 ? "Ready" : "Set time";

  const updateDuration = (nextMinutes, nextSeconds) => {
    const parsedMinutes = Math.max(0, Number(nextMinutes) || 0);
    const parsedSeconds = Math.min(59, Math.max(0, Number(nextSeconds) || 0));
    const nextDuration = parsedMinutes * 60 + parsedSeconds;

    setDurationSeconds(nextDuration);
    setSeconds(nextDuration);
    setIsRunning(false);
  };

  const handleMinutesChange = (event) => {
    const nextMinutes = event.target.value.replace(/\D/g, "");
    setMinutesInput(nextMinutes);
    updateDuration(nextMinutes, secondsInput);
  };

  const handleSecondsChange = (event) => {
    const nextSeconds = event.target.value.replace(/\D/g, "").slice(0, 2);
    const normalizedSeconds = String(Math.min(59, Number(nextSeconds) || 0));
    setSecondsInput(normalizedSeconds);
    updateDuration(minutesInput, normalizedSeconds);
  };

  const handleReset = () => {
    setSeconds(durationSeconds);
    setIsRunning(false);
  };

  return (
    <div className={`focus-card mb-4 ${isComplete ? "is-complete" : ""}`}>
      <div className="focus-glow" aria-hidden="true" />
      {isComplete && (
        <div className="focus-finish-burst" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
      )}
      <div className="focus-header">
        <div>
          <p className="focus-label">Focus Session</p>
          <h3 className="focus-title">{isComplete ? "Sprint complete" : "Custom focus sprint"}</h3>
        </div>
        <span className={`focus-state ${isRunning ? "is-running" : ""}`}>
          {statusLabel}
        </span>
      </div>

      <div className="focus-time-setter" aria-label="Set focus timer duration">
        <label>
          <span>Minutes</span>
          <input
            type="number"
            min="0"
            value={minutesInput}
            onChange={handleMinutesChange}
            disabled={isRunning}
          />
        </label>
        <span className="focus-time-separator">:</span>
        <label>
          <span>Seconds</span>
          <input
            type="number"
            min="0"
            max="59"
            value={secondsInput}
            onChange={handleSecondsChange}
            disabled={isRunning}
          />
        </label>
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
      {isComplete && <p className="focus-complete-message">Beautiful focus. Take a breath and enjoy the win.</p>}

      <div className="focus-progress-track" aria-hidden="true">
        <span style={{ width: `${progress}%` }} />
      </div>

      <div className="focus-actions d-flex gap-2 justify-content-center mt-3">
        <button
          className="btn btn-light px-4"
          onClick={() => setIsRunning(true)}
          disabled={isRunning || !canStart}
        >
          {hasStarted && !isRunning ? "Resume" : "Start"}
        </button>

        <button
          className="btn btn-outline-light px-4"
          onClick={() => setIsRunning(false)}
          disabled={!isRunning}
        >
          Pause
        </button>

        <button
          className="btn btn-outline-light px-4"
          onClick={handleReset}
          disabled={!durationSeconds}
        >
          Reset
        </button>
      </div>
    </div>
  );
}

export default FocusTimer;
