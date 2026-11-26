import Link from "next/link";
import type { ReactNode } from "react";
import styles from "styles/construction.module.css";
import { ArrowIcon } from "./icons";

interface QuickLinkCardProps {
  href: string;
  eyebrow: string;
  title: string;
  description: string;
  icon: ReactNode;
  onNavigate?: (event: { preventDefault: () => void }) => void;
  pending?: boolean;
}

export default function QuickLinkCard({
  href,
  eyebrow,
  title,
  description,
  icon,
  onNavigate,
  pending = false,
}: QuickLinkCardProps) {
  const content = (
    <>
      <span className={styles.cardIcon}>{icon}</span>
      <div>
        <small>{eyebrow}</small>
        <h3>{title}</h3>
        <p>{pending ? "Verificando sua sessão..." : description}</p>
      </div>
      <ArrowIcon />
    </>
  );

  return href.startsWith("#") ? (
    <a className={styles.quickCard} href={href}>
      {content}
    </a>
  ) : (
    <Link
      className={styles.quickCard}
      href={href}
      prefetch={false}
      onNavigate={onNavigate}
      aria-busy={pending}
    >
      {content}
    </Link>
  );
}
