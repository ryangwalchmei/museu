import Head from "next/head";
import Image from "next/image";
import { useRef, useState, type FormEvent } from "react";
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

function EyeIcon({ visible }: { visible: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden="true"
    >
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
      {visible ? <path d="m3 3 18 18" /> : null}
    </svg>
  );
}

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({ email: "", password: "" });
  const requestInFlight = useRef(false);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (requestInFlight.current) return;

    const email = emailRef.current?.value.trim() ?? "";
    const password = passwordRef.current?.value ?? "";
    const errors = {
      email: !email
        ? "Informe seu e-mail."
        : !emailRef.current?.validity.valid
          ? "Informe um e-mail válido."
          : "",
      password: password ? "" : "Informe sua senha.",
    };
    setError("");
    setFieldErrors(errors);

    if (errors.email || errors.password) {
      (errors.email ? emailRef : passwordRef).current?.focus();
      return;
    }

    requestInFlight.current = true;
    setPending(true);

    try {
      const response = await fetch("/api/v1/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ email, password }),
        signal: AbortSignal.timeout(15000),
      });

      if (!response.ok) {
        const responseData = await response.json();

        setError(
          responseData.message ??
            "Não foi possível entrar agora. Tente novamente em alguns instantes.",
        );
        return;
      }

      if (passwordRef.current) passwordRef.current.value = "";
      setAuthenticated(true);
    } catch {
      setError(
        "Não foi possível conectar. Verifique sua conexão e tente novamente.",
      );
    } finally {
      requestInFlight.current = false;
      setPending(false);
    }
  }

  return (
    <>
      <Head>
        <title>Entrar | Museu Flora</title>
        <meta
          name="description"
          content="Acesse sua conta no Museu Flora. Um espaço para cultivar conhecimento e preservar a nossa história."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#203c32" />
      </Head>

      <div className={styles.page}>
        <a className={styles.skipLink} href="#acesso">
          Ir para o formulário
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
              Um encontro entre o que somos e o que queremos deixar para o
              mundo.
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
            {authenticated ? (
              <div className={styles.success} role="status" aria-live="polite">
                <p className={styles.formEyebrow}>BEM-VINDO AO MUSEU FLORA</p>
                <h1>Que bom ter você aqui.</h1>
                <p>Login realizado com sucesso. Sua sessão está ativa.</p>
              </div>
            ) : (
              <>
                <p className={styles.formEyebrow}>BEM-VINDO DE VOLTA</p>
                <h1>Entre e faça parte.</h1>
                <p className={styles.intro}>
                  Acesse sua conta para continuar sua jornada
                  <br className={styles.desktopBreak} /> com o Museu Flora.
                </p>

                <form onSubmit={handleSubmit} noValidate aria-busy={pending}>
                  <div className={styles.field}>
                    <label htmlFor="email">E-mail</label>
                    <input
                      ref={emailRef}
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="username"
                      inputMode="email"
                      autoCapitalize="none"
                      spellCheck={false}
                      placeholder="seu@email.com"
                      required
                      disabled={pending}
                      aria-invalid={Boolean(fieldErrors.email)}
                      aria-describedby={
                        fieldErrors.email ? "email-error" : undefined
                      }
                      onChange={() => {
                        setFieldErrors((current) => ({
                          ...current,
                          email: "",
                        }));
                        setError("");
                      }}
                    />
                    {fieldErrors.email ? (
                      <p className={styles.fieldError} id="email-error">
                        {fieldErrors.email}
                      </p>
                    ) : null}
                  </div>

                  <div className={styles.field}>
                    <label htmlFor="password">Senha</label>
                    <div className={styles.passwordInput}>
                      <input
                        ref={passwordRef}
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        placeholder="Digite sua senha"
                        required
                        disabled={pending}
                        aria-invalid={Boolean(fieldErrors.password)}
                        aria-describedby={
                          fieldErrors.password ? "password-error" : undefined
                        }
                        onChange={() => {
                          setFieldErrors((current) => ({
                            ...current,
                            password: "",
                          }));
                          setError("");
                        }}
                      />
                      <button
                        type="button"
                        className={styles.revealButton}
                        aria-label={
                          showPassword ? "Ocultar senha" : "Mostrar senha"
                        }
                        aria-pressed={showPassword}
                        aria-controls="password"
                        onClick={() => setShowPassword((current) => !current)}
                      >
                        <EyeIcon visible={showPassword} />
                      </button>
                    </div>
                    {fieldErrors.password ? (
                      <p className={styles.fieldError} id="password-error">
                        {fieldErrors.password}
                      </p>
                    ) : null}
                  </div>

                  {error ? (
                    <div className={styles.error} role="alert">
                      {error}
                    </div>
                  ) : null}

                  <button
                    className={styles.submit}
                    type="submit"
                    disabled={pending}
                  >
                    {pending ? (
                      <>
                        <span className={styles.spinner} aria-hidden="true" />{" "}
                        Entrando...
                      </>
                    ) : (
                      <>
                        Entrar na minha conta <span aria-hidden="true">↗</span>
                      </>
                    )}
                  </button>
                  <p className={styles.sessionNote} aria-live="polite">
                    Seu acesso ao Museu Flora começa aqui.
                  </p>
                </form>

                <details className={styles.help}>
                  <summary>
                    Precisa de ajuda para acessar?
                    <span aria-hidden="true">+</span>
                  </summary>
                  <p>
                    Use o e-mail cadastrado e sua senha. Se ainda não ativou a
                    conta, confira o e-mail de ativação, inclusive na caixa de
                    spam. Para recuperar seu acesso ou solicitar uma conta,
                    entre em contato com a administração do museu.
                  </p>
                </details>
              </>
            )}
          </div>

          <footer className={styles.footer}>
            <span>Museu Flora</span>
            <span>Histórias que criam raízes.</span>
          </footer>
        </main>
      </div>
    </>
  );
}
