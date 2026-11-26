import Link from "next/link";
import styles from "styles/construction.module.css";

export default function ConstructionFooter() {
  return (
    <footer className={styles.footer}>
      <Link className={styles.footerBrand} href="/">
        Museu Flora
      </Link>
      <p>Raízes no passado. Olhar para o futuro.</p>
      <span>
        FEITO PARA FLORESCER <span aria-hidden="true">✳</span>
      </span>
    </footer>
  );
}
