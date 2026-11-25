import { useAppSession } from "../../lib/session";
import { Redirect, Stack, usePathname } from "expo-router";
import SessionStatus from "../../components/feedback/session-status";

export default function AppLayout() {
  const pathname = usePathname();
  const { data: session, isPending, error } = useAppSession();
  if (isPending) return <SessionStatus />;
  if (error || !session) return <Redirect href="/auth" />;
  if (!session.user.nameConfirmed && pathname !== "/complete-profile")
    return (
      <>
        <Redirect href="/complete-profile" />
        <SessionStatus />
      </>
    );
  return <Stack screenOptions={{ headerShown: false }} />;
}
