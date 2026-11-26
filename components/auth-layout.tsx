import Image from "next/image";
import type { ReactNode } from "react";
import styles from "styles/login.module.css";

function LeafMark() {
  return (
    <svg viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <path
        d="M10 29C3 13 18 7 31 7c1 15-5 27-21 22Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M8 33 26 13M14 26l-1-10m6 5 9-1"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className={styles.page}>
      <a className={styles.skipLink} href="#acesso">
        Ir para o conteúdo
      </a>

      <aside className={styles.story} aria-label="Museu Flora">
        <div className={styles.brand}>
          <span className={styles.brandIcon}>
            <LeafMark />
          </span>
          <span>
            Museu <strong>Flora</strong>
            <small>MEMÓRIA QUE FLORESCE</small>
          </span>
        </div>

        <div className={styles.storyContent}>
          <p className={styles.eyebrow}>
            <span /> NATUREZA, CULTURA E MEMÓRIA
          </p>
          <h2>
            Cultivar o presente.
            <br />
            <em>Preservar a história.</em>
          </h2>
          <p className={styles.storyDescription}>
            Um encontro entre o que somos e o que queremos deixar para o mundo.
          </p>
          <div className={styles.botanical} aria-hidden="true">
            <span className={styles.orbit} />
            <Image src="/botanical.svg" alt="" width="480" height="440" />
            <span className={styles.specimenLabel}>
              FLORA
              <br />
              <span>Um acervo vivo de histórias.</span>
            </span>
          </div>
        </div>

        <div className={styles.storyFooter}>
          <span>Raízes no passado. Olhar para o futuro.</span>
          <span aria-hidden="true">✳</span>
        </div>
      </aside>

      <main className={styles.access} id="acesso">
        <div className={styles.topNote}>
          <span className={styles.statusDot} /> ESPAÇO DO MUSEU
        </div>

        <div className={styles.formArea}>
          <span className={styles.welcomeIcon}>
            <LeafMark />
          </span>
          {children}
        </div>

        <footer className={styles.footer}>
          <span>Museu Flora</span>
          <span>Histórias que criam raízes.</span>
        </footer>
      </main>
    </div>
  );
}
