import { useRouter } from "next/router";
import { useRef, useState } from "react";
import type { CurrentUser } from "hooks/use-current-user";
import QuickLinkCard from "./quick-link-card";

export default function AccountAccessCard({
  account,
}: {
  account: CurrentUser;
}) {
  const router = useRouter();
  const { session, refresh } = account;
  const [checkingAccess, setCheckingAccess] = useState(false);
  const navigatingRef = useRef(false);
  const authenticated = session.status === "authenticated";

  async function handleLogin(event: { preventDefault: () => void }) {
    event.preventDefault();
    if (navigatingRef.current) return;

    navigatingRef.current = true;
    setCheckingAccess(true);

    try {
      const currentSession = await refresh();
      if (currentSession.status === "anonymous")
        await router.push("/auth/login");
    } finally {
      navigatingRef.current = false;
      setCheckingAccess(false);
    }
  }

  const content = authenticated
    ? {
        eyebrow: `Olá, ${session.username}`,
        title: "Continuar navegando",
        description: "Seu acesso está ativo. Explore nossa jornada.",
      }
    : session.status === "loading"
      ? {
          eyebrow: "SUA CONTA",
          title: "Verificando acesso",
          description: "Verificando sua sessão...",
        }
      : session.status === "error"
        ? {
            eyebrow: "SUA CONTA",
            title: "Tentar novamente",
            description:
              "Não foi possível verificar sua sessão. Clique para tentar novamente.",
          }
        : {
            eyebrow: "SUA CONTA",
            title: "Acessar o museu",
            description: "Entre com seu e-mail e senha.",
          };

  return (
    <QuickLinkCard
      {...content}
      href={authenticated ? "#jornada" : "/auth/login"}
      onNavigate={authenticated ? undefined : handleLogin}
      pending={session.status === "loading" || checkingAccess}
      icon={
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden="true"
        >
          {authenticated ? (
            <>
              <circle cx="12" cy="12" r="9" />
              <path
                d="m8 12 3 3 5-6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </>
          ) : (
            <path
              d="M14 4h5v16h-5M3 12h11m-4-4 4 4-4 4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
        </svg>
      }
    />
  );
}
