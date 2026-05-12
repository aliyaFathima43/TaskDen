const THEME_KEY = "todo_theme";

export function getInitialTheme() {
  return localStorage.getItem(THEME_KEY) || "light";
}

export function applyTheme(theme) {
  document.body.setAttribute("data-theme", theme);
  localStorage.setItem(THEME_KEY, theme);
}

export function toggleTheme(currentTheme) {
  return currentTheme === "dark" ? "light" : "dark";
}
