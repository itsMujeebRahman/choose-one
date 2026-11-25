import { useAppSession } from "../../lib/session";
import { Redirect, Slot } from "expo-router";
import SessionStatus from "../../components/feedback/session-status";

export default function AuthLayout() {
  const { data: session, isPending, error } = useAppSession();
  if (isPending) return <SessionStatus />;
  if (!error && session && !session.user.isAnonymous)
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
