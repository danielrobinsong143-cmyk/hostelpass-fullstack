import { useContext } from "react";
import { ThemeContext } from "../context/themeContextDefinition";
import "../styles/theme-toggle.css";

function ThemeToggle() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      className={`theme-toggle ${isDark ? "is-dark" : "is-light"}`}
      onClick={toggleTheme}
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <span className="theme-toggle-sky">
        <span className="theme-toggle-cloud theme-toggle-cloud-1" />
        <span className="theme-toggle-cloud theme-toggle-cloud-2" />
        <span className="theme-toggle-star theme-toggle-star-1" />
        <span className="theme-toggle-star theme-toggle-star-2" />
        <span className="theme-toggle-star theme-toggle-star-3" />
      </span>

      <span className="theme-toggle-knob">
        {/* Sun */}
        <svg
          className="theme-toggle-icon theme-toggle-icon-sun"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="5" fill="currentColor" />
          <g stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="12" y1="1.5" x2="12" y2="4" />
            <line x1="12" y1="20" x2="12" y2="22.5" />
            <line x1="1.5" y1="12" x2="4" y2="12" />
            <line x1="20" y1="12" x2="22.5" y2="12" />
            <line x1="4.2" y1="4.2" x2="6" y2="6" />
            <line x1="18" y1="18" x2="19.8" y2="19.8" />
            <line x1="4.2" y1="19.8" x2="6" y2="18" />
            <line x1="18" y1="6" x2="19.8" y2="4.2" />
          </g>
        </svg>

        {/* Moon */}
        <svg
          className="theme-toggle-icon theme-toggle-icon-moon"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M20 14.5A8.5 8.5 0 1 1 9.5 4a6.8 6.8 0 0 0 10.5 10.5Z"
            fill="currentColor"
          />
        </svg>
      </span>
    </button>
  );
}

export default ThemeToggle;
