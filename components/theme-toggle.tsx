interface ThemeToggleProps {
  light: boolean;
  onToggle: () => void;
  className: string;
}

export default function ThemeToggle({
  light,
  onToggle,
  className,
}: ThemeToggleProps) {
  return (
    <button
      className={className}
      type="button"
      onClick={onToggle}
      aria-label={light ? "Ativar tema escuro" : "Ativar tema claro"}
      aria-pressed={!light}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden="true"
      >
        {light ? (
          <path d="M20 14A8 8 0 0 1 10 4a8 8 0 1 0 10 10Z" />
        ) : (
          <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" />
          </>
        )}
      </svg>
    </button>
  );
}
