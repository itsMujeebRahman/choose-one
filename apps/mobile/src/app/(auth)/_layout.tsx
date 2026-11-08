import { useAppSession } from "../../lib/session";
import { useErrorToast } from "../../hooks/use-error-toast";
import { Redirect, Slot } from "expo-router";
import SessionStatus from "../../components/feedback/session-status";

export default function AuthLayout() {
  const { data: session, isPending, error } = useAppSession();
  useErrorToast(
    error,
    "We couldn’t restore your session. Please try again.",
    "session-error",
  );
  if (isPending) return <SessionStatus />;
  if (session && !session.user.isAnonymous)
    return (
      <>
        <Redirect
          href={session.user.nameConfirmed ? "/" : "/complete-profile"}
        />
        <SessionStatus />
      </>
    );
  return <Slot />;
}
