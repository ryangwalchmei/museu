import Link from "next/link";
import type { ReactNode } from "react";
import styles from "styles/construction.module.css";
import { ArrowIcon, LeafIcon } from "./icons";

interface QuickLinkCardProps {
  href: string;
  eyebrow: string;
  title: string;
  description: string;
  icon: ReactNode;
}

const quickLinks: QuickLinkCardProps[] = [
  {
    href: "/auth/login",
    eyebrow: "SUA CONTA",
    title: "Acessar o museu",
    description: "Entre com seu e-mail e senha.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden="true"
      >
        <path
          d="M14 4h5v16h-5M3 12h11m-4-4 4 4-4 4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    href: "#jornada",
    eyebrow: "PASSO A PASSO",
    title: "O que vem por aí",
    description: "Conheça as etapas desta jornada.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden="true"
      >
        <path
          d="M4 19h16M5 15l5-5 4 2 5-8m-5 0h5v5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    href: "#essencia",
    eyebrow: "NOSSO PROPÓSITO",
    title: "A essência do Flora",
    description: "Descubra o que nos inspira.",
    icon: <LeafIcon />,
  },
];

function QuickLinkCard({
  href,
  eyebrow,
  title,
  description,
  icon,
}: QuickLinkCardProps) {
  const CardLink = href.startsWith("#") ? "a" : Link;

  return (
    <CardLink className={styles.quickCard} href={href}>
      <span className={styles.cardIcon}>{icon}</span>
      <div>
        <small>{eyebrow}</small>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      <ArrowIcon />
    </CardLink>
  );
}

export default function ConstructionQuickLinks() {
  return (
    <section className={styles.quickSection} aria-labelledby="quick-title">
      <div className={styles.sectionHeading}>
        <p className={styles.eyebrow}>ENQUANTO FLORESCEMOS</p>
        <h2 id="quick-title">Seu próximo caminho.</h2>
      </div>
      <div className={styles.quickLinks}>
        {quickLinks.map((link) => (
          <QuickLinkCard key={link.href} {...link} />
        ))}
      </div>
    </section>
  );
}
