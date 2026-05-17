import { useEffect, useState } from "react";

function FocusTimer() {
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

  const minutes = String(Math.floor(seconds / 60)).padStart(2, "0");
  const secs = String(seconds % 60).padStart(2, "0");

  const handleReset = () => {
    setSeconds(25 * 60);
    setIsRunning(false);
  };

  return (
    <div className="focus-card mb-4">
      <p className="focus-label">Focus Session</p>

      <h1 className="focus-time">
        {minutes}:{secs}
      </h1>

      <div className="d-flex gap-2 justify-content-center mt-3">
        <button
          className="btn btn-light px-4"
          onClick={() => setIsRunning(true)}
        >
          Start
        </button>

        <button
          className="btn btn-outline-light px-4"
          onClick={() => setIsRunning(false)}
        >
          Pause
        </button>

        <button
          className="btn btn-dark px-4"
          onClick={handleReset}
        >
          Reset
        </button>
      </div>
    </div>
  );
}

export default FocusTimer;