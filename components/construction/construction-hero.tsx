import FloraOrb from "./flora-orb";
import { ArrowIcon } from "./icons";
import styles from "styles/construction.module.css";

export default function ConstructionHero() {
  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <div className={styles.copy}>
        <p className={styles.eyebrow}>
          <span /> UM NOVO ESPAÇO ESTÁ NASCENDO
        </p>
        <h1 id="hero-title">
          Toda história
          <br />
          começa com
          <br />
          <em>uma semente.</em>
        </h1>
        <p className={styles.intro}>
          Estamos cultivando o novo espaço digital do Museu Flora. Um lugar onde
          natureza, cultura e memória se encontram para florescer.
        </p>
        <a className={styles.cta} href="#jornada">
          Acompanhe nossa jornada <ArrowIcon />
        </a>
        <p className={styles.heroNote}>
          Em construção, com cuidado em cada detalhe.
        </p>
      </div>
      <FloraOrb />
    </section>
  );
}
