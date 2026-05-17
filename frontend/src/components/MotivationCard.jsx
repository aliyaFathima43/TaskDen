const QUOTES = [
  "Small progress is still progress.",
  "Discipline creates freedom.",
  "Focus on consistency, not perfection.",
  "One task at a time ✨",
  "Your future self will thank you.",
  "Done is better than perfect.",
  "Dreams need deadlines.",
  "You don’t have to do everything at once 🌷",
  "A soft life still requires discipline ✨",
  "Tiny steps still count.",
  "Rest. Reset. Continue.",
  "Progress feels better than pressure.",
  "Your pace is valid 🌙",
  "Romanticize becoming your best self.",
  "Even slow progress is beautiful.",
  "Today’s effort is tomorrow’s confidence.",
  "Calm mind. Clear goals.",
];

function MotivationCard() {
  const randomQuote =
    QUOTES[Math.floor(Math.random() * QUOTES.length)];

  return (
    <div className="motivation-card mb-4">
      <p className="motivation-label">Daily Motivation</p>

      <h4 className="motivation-text">
        “{randomQuote}”
      </h4>
    </div>
  );
}

export default MotivationCard;