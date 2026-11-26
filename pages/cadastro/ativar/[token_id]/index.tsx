import AuthLayout from "components/auth-layout";
import requireGuest from "lib/require-guest";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useRef, useState } from "react";
import styles from "styles/login.module.css";
import activationStyles from "styles/activation.module.css";

export const getServerSideProps = requireGuest;

const tokenPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
type ActivationStatus =
  "ready" | "loading" | "success" | "unavailable" | "forbidden" | "error";

function ActivationContent({ token }: { token: string }) {
  const validToken = tokenPattern.test(token);
  const [status, setStatus] = useState<ActivationStatus>(
    validToken ? "ready" : "unavailable",
  );
  const [error, setError] = useState("");
  const inFlight = useRef(false);
  const pending = status === "loading";
  const canActivate = status === "ready" || status === "error" || pending;

  async function activate() {
    if (!validToken || inFlight.current || !canActivate) return;
    inFlight.current = true;
    setStatus("loading");
    setError("");

    try {
      const response = await fetch(
        `/api/v1/activations/${encodeURIComponent(token)}`,
        {
          method: "PATCH",
          credentials: "same-origin",
          signal: AbortSignal.timeout(15000),
        },
      );

      if (response.ok) {
        setStatus("success");
      } else if (response.status === 404 || response.status === 400) {
        setStatus("unavailable");
      } else if (response.status === 403) {
        setStatus("forbidden");
      } else {
        setStatus("error");
        setError(
          response.status === 429
            ? "Muitas tentativas. Aguarde um momento antes de tentar novamente."
            : "Não foi possível ativar seu cadastro agora. Tente novamente em alguns instantes.",
        );
      }
    } catch {
      setStatus("error");
      setError(
        "Não foi possível confirmar a ativação. Verifique sua conexão e tente novamente. Se já ativou a conta, você pode entrar com seu e-mail e senha.",
      );
    } finally {
      inFlight.current = false;
    }
  }

  const content = {
    ready: {
      eyebrow: "FALTA SÓ UM PASSO",
      title: "Sua história começa aqui.",
      description:
        "Confirme seu cadastro para fazer parte do Museu Flora. Depois da ativação, você poderá entrar com seu e-mail e senha.",
    },
    loading: {
      eyebrow: "PREPARANDO SEU ACESSO",
      title: "Ativando seu cadastro...",
      description:
        "Aguarde um instante enquanto confirmamos seu cadastro no Museu Flora.",
    },
    success: {
      eyebrow: "BEM-VINDO AO MUSEU FLORA",
      title: "Seu cadastro floresceu.",
      description:
        "Cadastro ativado com sucesso! Agora você pode acessar sua conta com o e-mail e a senha que cadastrou.",
    },
    unavailable: {
      eyebrow: "VAMOS CUIDAR DO SEU ACESSO",
      title: "Este link não está disponível.",
      description:
        "O link de ativação é inválido, expirou ou já foi utilizado. Se você já ativou seu cadastro, pode entrar na sua conta.",
    },
    forbidden: {
      eyebrow: "CONFIRA SEU ACESSO",
      title: "Não foi possível ativar.",
      description:
        "Sua conta pode já estar ativada. Tente entrar com seu e-mail e senha. Se não conseguir, entre em contato com a administração do museu.",
    },
    error: {
      eyebrow: "VAMOS TENTAR NOVAMENTE",
      title: "Falta pouco para entrar.",
      description:
        "Não conseguimos concluir a confirmação do seu cadastro. Você pode tentar novamente abaixo.",
    },
  }[status];

  return (
    <>
      <div role="status" aria-live="polite" aria-atomic="true">
        <p className={styles.formEyebrow}>{content.eyebrow}</p>
        <h1>{content.title}</h1>
        <p className={styles.intro}>{content.description}</p>
      </div>

      {status === "success" ? (
        <div className={activationStyles.confirmation}>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="m8 12 3 3 5-6" />
          </svg>
          <span>Tudo pronto para o seu primeiro acesso.</span>
        </div>
      ) : null}

      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}

      {canActivate ? (
        <>
          <button
            type="button"
            className={styles.submit}
            disabled={pending}
            onClick={activate}
          >
            {pending ? (
              <>
                <span className={styles.spinner} aria-hidden="true" />{" "}
                Ativando...
              </>
            ) : (
              <>
                {status === "error"
                  ? "Tentar novamente"
                  : "Ativar meu cadastro"}
                <span aria-hidden="true">↗</span>
              </>
            )}
          </button>
          <p className={styles.sessionNote}>
            O link de ativação tem validade de 15 minutos.
          </p>
          <Link className={activationStyles.secondaryLink} href="/auth/login">
            Já ativou sua conta? Entrar
          </Link>
        </>
      ) : (
        <Link
          className={`${styles.submit} ${activationStyles.primaryLink}`}
          href="/auth/login"
        >
          Ir para o login<span aria-hidden="true">↗</span>
        </Link>
      )}

      <details className={styles.help}>
        <summary>
          Precisa de ajuda com a ativação?<span aria-hidden="true">+</span>
        </summary>
        <p>
          Abra o link completo recebido por e-mail. Ele pode ser usado uma única
          vez e expira em 15 minutos. Se o link expirou e sua conta ainda não
          foi ativada, entre em contato com a administração do museu para obter
          ajuda.
        </p>
      </details>
    </>
  );
}

export default function ActivateRegistration() {
  const router = useRouter();
  const token =
    typeof router.query.token_id === "string" ? router.query.token_id : "";

  return (
    <>
      <Head>
        <title>Ativar cadastro | Museu Flora</title>
        <meta
          name="description"
          content="Ative seu cadastro no Museu Flora e prepare-se para o seu primeiro acesso."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="noindex, nofollow" />
        <meta name="referrer" content="no-referrer" />
      </Head>
      <AuthLayout>
        {router.isReady ? (
          <ActivationContent key={token} token={token} />
        ) : (
          <p className={styles.intro} role="status">
            Preparando sua ativação...
          </p>
        )}
      </AuthLayout>
    </>
  );
}
