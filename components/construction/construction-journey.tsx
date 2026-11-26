import { useState } from "react";
import styles from "styles/construction.module.css";

const journey = [
  {
    label: "Raízes",
    status: "Concluído",
    title: "Uma base para florescer.",
    description:
      "Os primeiros caminhos já estão prontos: cadastro, ativação e acesso à conta. É o começo do nosso espaço digital.",
  },
  {
    label: "Cultivo",
    status: "Em construção",
    title: "Estamos cultivando essa experiência.",
    description:
      "O espaço digital do Museu Flora está ganhando forma. Estamos cuidando de cada detalhe para aproximar natureza, cultura e memória.",
  },
  {
    label: "Crescimento",
    status: "Próxima etapa",
    title: "Tempo de cuidar dos detalhes.",
    description:
      "A próxima etapa será revisar a experiência, testar os caminhos e preparar o espaço para receber você.",
  },
  {
    label: "Florescer",
    status: "Mais adiante",
    title: "Um novo encontro com o museu.",
    description:
      "Quando tudo estiver pronto, este será um lugar para descobrir, se conectar e fazer parte da história do Museu Flora.",
  },
];

export default function ConstructionJourney() {
  const [activeStep, setActiveStep] = useState(1);
  const selectedStep = journey[activeStep];

  return (
    <section
      className={styles.journey}
      id="jornada"
      aria-labelledby="journey-title"
    >
      <div className={styles.sectionHeading}>
        <div>
          <p className={styles.eyebrow}>DA SEMENTE AO FLORESCER</p>
          <h2 id="journey-title">Cada etapa, um novo começo.</h2>
        </div>
        <span>Selecione uma etapa para explorar</span>
      </div>
      <div className={styles.timeline} aria-label="Etapas do projeto">
        {journey.map((step, index) => (
          <button
            key={step.label}
            className={styles.step}
            data-selected={activeStep === index}
            data-current={index === 1}
            type="button"
            aria-pressed={activeStep === index}
            aria-controls="journey-detail"
            onClick={() => setActiveStep(index)}
          >
            <span className={styles.marker}>
              {index === 0 ? "✓" : String(index + 1).padStart(2, "0")}
            </span>
            <span>{step.label}</span>
            <small>{step.status}</small>
          </button>
        ))}
      </div>
      <div
        className={styles.timelineDetail}
        id="journey-detail"
        aria-live="polite"
        aria-atomic="true"
      >
        <span className={styles.detailNumber}>
          {String(activeStep + 1).padStart(2, "0")}
        </span>
        <div>
          <p className={styles.eyebrow}>{selectedStep.label}</p>
          <h3>{selectedStep.title}</h3>
          <p>{selectedStep.description}</p>
        </div>
        <span className={styles.detailStatus}>{selectedStep.status}</span>
      </div>
    </section>
  );
}
