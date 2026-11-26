import { useCallback, useEffect, useRef, useState } from "react";

type SessionState =
  | { status: "loading" }
  | { status: "anonymous" }
  | { status: "authenticated"; username: string }
  | { status: "error" };

export default function useCurrentUser() {
  const [session, setSession] = useState<SessionState>({ status: "loading" });
  const requestRef = useRef<Promise<SessionState> | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  const refresh = useCallback(() => {
    if (requestRef.current) return requestRef.current;

    const controller = new AbortController();
    controllerRef.current = controller;

    const request = (async (): Promise<SessionState> => {
      let nextSession: SessionState;

      try {
        const response = await fetch("/api/v1/user", {
          credentials: "same-origin",
          cache: "no-store",
          signal: AbortSignal.any([
            controller.signal,
            AbortSignal.timeout(15000),
          ]),
        });

        if (response.ok) {
          const user = await response.json();
          nextSession =
            typeof user?.username === "string"
              ? { status: "authenticated", username: user.username }
              : { status: "error" };
        } else {
          nextSession = {
            status:
              response.status === 401 || response.status === 403
                ? "anonymous"
                : "error",
          };
        }
      } catch {
        nextSession = { status: "error" };
      }

      if (!controller.signal.aborted) setSession(nextSession);
      return nextSession;
    })();

    requestRef.current = request;
    void request.finally(() => {
      if (requestRef.current === request) requestRef.current = null;
    });
    return request;
  }, []);

  useEffect(() => {
    void refresh();

    function revalidate() {
      if (document.visibilityState === "visible") void refresh();
    }

    window.addEventListener("focus", revalidate);
    document.addEventListener("visibilitychange", revalidate);

    return () => {
      window.removeEventListener("focus", revalidate);
      document.removeEventListener("visibilitychange", revalidate);
      controllerRef.current?.abort();
      requestRef.current = null;
    };
  }, [refresh]);

  return { session, refresh };
}
