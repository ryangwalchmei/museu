import { LeafIcon } from "./icons";
import styles from "styles/construction.module.css";

export default function FloraOrb() {
  return (
    <div className={styles.orbScene} aria-hidden="true">
      <div className={styles.orbGrid} />
      <div className={styles.outerRing}>
        <i />
      </div>
      <div className={styles.middleRing}>
        <i />
      </div>
      <div className={styles.innerRing} />
      <div className={styles.core}>
        <LeafIcon />
        <span>flora</span>
        <small>RAÍZES PARA O FUTURO</small>
      </div>
      <span className={styles.orbTop}>NATUREZA VIVA</span>
      <span className={styles.orbBottom}>UM NOVO COMEÇO · MUSEU FLORA</span>
      <span className={styles.starOne}>✳</span>
      <span className={styles.starTwo}>+</span>
    </div>
  );
}
