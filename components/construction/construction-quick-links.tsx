import AccountAccessCard from "./account-access-card";
import QuickLinkCard from "./quick-link-card";
import styles from "styles/construction.module.css";
import { LeafIcon } from "./icons";
import type { CurrentUser } from "hooks/use-current-user";

const quickLinks = [
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

export default function ConstructionQuickLinks({
  account,
}: {
  account: CurrentUser;
}) {
  return (
    <section className={styles.quickSection} aria-labelledby="quick-title">
      <div className={styles.sectionHeading}>
        <p className={styles.eyebrow}>ENQUANTO FLORESCEMOS</p>
        <h2 id="quick-title">Seu próximo caminho.</h2>
      </div>
      <div className={styles.quickLinks}>
        <AccountAccessCard account={account} />
        {quickLinks.map((link) => (
          <QuickLinkCard key={link.href} {...link} />
        ))}
      </div>
    </section>
  );
}
