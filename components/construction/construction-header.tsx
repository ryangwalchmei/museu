import ThemeToggle from "components/theme-toggle";
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
        <ThemeToggle
          light={light}
          onToggle={onToggleTheme}
          className={styles.themeButton}
        />
      </div>
    </header>
  );
}
