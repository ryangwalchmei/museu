import ConstructionHeader from "components/construction/construction-header";
import ConstructionHero from "components/construction/construction-hero";
import ConstructionQuickLinks from "components/construction/construction-quick-links";
import ConstructionJourney from "components/construction/construction-journey";
import ConstructionEssence from "components/construction/construction-essence";
import ConstructionFooter from "components/construction/construction-footer";
import Head from "next/head";
import { useTheme } from "components/theme-provider";
import styles from "styles/construction.module.css";

export default function Construction() {
  const { light, toggleTheme } = useTheme();

  return (
    <>
      <Head>
        <title>Em construção | Museu Flora</title>
        <meta
          name="description"
          content="Estamos cultivando o novo espaço digital do Museu Flora. Natureza, cultura e memória em uma experiência que está florescendo."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content={light ? "#f5f4eb" : "#10251e"} />
      </Head>
      <div className={styles.page} data-theme={light ? "light" : "dark"}>
        <a className={styles.skipLink} href="#conteudo">
          Ir para o conteúdo
        </a>
        <div className={styles.ambient} aria-hidden="true" />
        <ConstructionHeader light={light} onToggleTheme={toggleTheme} />

        <main id="conteudo">
          <ConstructionHero />

          <ConstructionQuickLinks />

          <ConstructionJourney />

          <ConstructionEssence />
        </main>

        <ConstructionFooter />
      </div>
    </>
  );
}
