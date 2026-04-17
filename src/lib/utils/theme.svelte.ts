type Theme = "light" | "dark" | "system";

let current = $state<Theme>("system");

function apply(theme: Theme) {
  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", isDark);
}

export function initTheme() {
  current = (localStorage.getItem("theme") as Theme) ?? "system";
  apply(current);

  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", () => {
      if (current === "system") apply("system");
    });
}

export function setTheme(theme: Theme) {
  current = theme;
  localStorage.setItem("theme", theme);
  apply(theme);
}

export function getTheme(): Theme {
  return current;
}
