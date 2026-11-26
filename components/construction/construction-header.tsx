import ThemeToggle from "components/theme-toggle";
import type { CurrentUser } from "hooks/use-current-user";
import Link from "next/link";
import { useRef, useState } from "react";
import styles from "styles/construction.module.css";
import { LeafIcon } from "./icons";

interface ConstructionHeaderProps {
  light: boolean;
  onToggleTheme: () => void;
  account: CurrentUser;
}

export default function ConstructionHeader({
  light,
  onToggleTheme,
  account,
}: ConstructionHeaderProps) {
  const { session, logout } = account;
  const authenticated = session.status === "authenticated";
  const [logoutState, setLogoutState] = useState<
    "idle" | "pending" | "success" | "error"
  >("idle");
  const logoutRef = useRef(false);

  async function handleLogout() {
    if (logoutRef.current) return;
    logoutRef.current = true;
    setLogoutState("pending");
    try {
      await logout();
      setLogoutState("success");
    } catch {
      setLogoutState("error");
    } finally {
      logoutRef.current = false;
    }
  }

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
        {(authenticated ||
          logoutState === "pending" ||
          logoutState === "error") && (
          <button
            type="button"
            className={styles.logoutButton}
            onClick={handleLogout}
            disabled={logoutState === "pending"}
            aria-busy={logoutState === "pending"}
            aria-label={
              logoutState === "pending" ? "Saindo..." : "Sair da conta"
            }
            title={logoutState === "pending" ? "Saindo..." : "Sair da conta"}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M9 4H4v16h5M10 12h10m-4-4 4 4-4 4" />
            </svg>
            <span>{logoutState === "pending" ? "Saindo..." : "Sair"}</span>
          </button>
        )}
      </div>
    </header>
  );
}
