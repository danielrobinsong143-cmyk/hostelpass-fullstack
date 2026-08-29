import { useContext } from "react";
import { ThemeContext } from "../context/themeContextDefinition";
import UiIcon from "./UiIcon";
import "../styles/theme-toggle.css";

function ThemeToggle() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const isDark = theme === "dark";

  return (
    <button type="button" className={`theme-toggle ${isDark ? "is-dark" : "is-light"}`} onClick={toggleTheme} role="switch" aria-checked={isDark} aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"} title={isDark ? "Switch to light mode" : "Switch to dark mode"}>
      <span className="theme-toggle-option"><UiIcon name="sun" size={14} /> Light</span>
      <span className="theme-toggle-option"><UiIcon name="moon" size={14} /> Dark</span>
      <span className="theme-toggle-thumb" aria-hidden="true" />
    </button>
  );
}

export default ThemeToggle;
