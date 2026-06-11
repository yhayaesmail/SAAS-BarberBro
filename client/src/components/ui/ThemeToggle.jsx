import { useTheme } from '../../context/ThemeContext.jsx';

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();

  return (
    <button className="theme-float-btn" onClick={toggle} aria-label="Toggle theme">
      {theme === 'light' ? '\u263E' : '\u2600'}
    </button>
  );
}