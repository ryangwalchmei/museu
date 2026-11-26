import Link from "next/link";
import { LeafIcon } from "./icons";
import styles from "styles/construction.module.css";

interface ConstructionHeaderProps {
  light: boolean;
  onToggleTheme: () => void;
}

export default function ConstructionHeader({
  light,
  onToggleTheme,
}: ConstructionHeaderProps) {
  return (
    <header className={styles.header}>
      <Link className={styles.brand} href="/" aria-label="Museu Flora — início">
        <LeafIcon />
        <span>
          Museu Flora<small>MEMÓRIA QUE FLORESCE</small>
        </span>
      </Link>
      <div className={styles.headerActions}>
        <span className={styles.buildBadge}>
          <i /> Em construção
        </span>
        <button
          className={styles.themeButton}
          type="button"
          onClick={onToggleTheme}
          aria-label={light ? "Ativar tema escuro" : "Ativar tema claro"}
          aria-pressed={light}
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
      </div>
    </header>
  );
}
