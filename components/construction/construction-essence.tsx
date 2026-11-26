import styles from "styles/construction.module.css";
import { LeafIcon } from "./icons";

const pillars = [
  {
    label: "01 / NATUREZA",
    title: "A vida inspira.",
    description:
      "Um olhar atento à natureza e às conexões que nos lembram que fazemos parte dela.",
    icon: <LeafIcon />,
  },
  {
    label: "02 / CULTURA",
    title: "O encontro transforma.",
    description:
      "Histórias, saberes e diferentes formas de ver o mundo. É na troca que criamos novos sentidos.",
    icon: (
      <span className={styles.symbol} aria-hidden="true">
        ✳
      </span>
    ),
  },
  {
    label: "03 / MEMÓRIA",
    title: "A história permanece.",
    description:
      "Preservar o que nos trouxe até aqui é abrir caminhos para as histórias que ainda vamos contar.",
    icon: (
      <svg
        viewBox="0 0 40 40"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        aria-hidden="true"
      >
        <circle cx="20" cy="20" r="14" />
        <circle cx="20" cy="20" r="9" />
        <circle cx="20" cy="20" r="4" />
      </svg>
    ),
  },
];

export default function ConstructionEssence() {
  return (
    <section
      className={styles.essence}
      id="essencia"
      aria-labelledby="essence-title"
    >
      <div className={styles.sectionHeading}>
        <div>
          <p className={styles.eyebrow}>O QUE NOS MOVE</p>
          <h2 id="essence-title">Raízes que nos conectam.</h2>
        </div>
        <p className={styles.sectionIntro}>
          Mais do que um espaço digital.
          <br />
          Um encontro com o que merece permanecer.
        </p>
      </div>
      <div className={styles.pillars}>
        {pillars.map((pillar) => (
          <article className={styles.pillar} key={pillar.label}>
            <div className={styles.pillarTop}>
              <span>{pillar.label}</span>
              {pillar.icon}
            </div>
            <h3>{pillar.title}</h3>
            <p>{pillar.description}</p>
            <span className={styles.pillarLine} />
          </article>
        ))}
      </div>
    </section>
  );
}
