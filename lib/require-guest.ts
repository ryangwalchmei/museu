import type { GetServerSideProps } from "next";
import controller from "infra/controller";
import { UnauthorizedError } from "infra/errors";
import session from "models/session";

const requireGuest: GetServerSideProps<Record<string, never>> = async ({
  req,
  res,
}) => {
  res.setHeader("Cache-Control", "private, no-store, max-age=0");

  const token = req.cookies.session_id;
  if (!token) return { props: {} };

  try {
    await session.findOneValidByToken(token);
  } catch (error) {
    if (!(error instanceof UnauthorizedError)) throw error;

    controller.clearSessionCookie(res);
    return { props: {} };
  }

  return {
    redirect: { destination: "/", permanent: false },
  };
};

export default requireGuest;
