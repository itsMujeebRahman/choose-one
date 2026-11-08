import { useAppSession } from "../../lib/session";
import { useErrorToast } from "../../hooks/use-error-toast";
import { Redirect, Stack, usePathname } from "expo-router";
import SessionStatus from "../../components/feedback/session-status";

export default function AppLayout() {
  const pathname = usePathname();
  const { data: session, isPending, error, refetch } = useAppSession();
  useErrorToast(
    error,
    "We couldn’t restore your session. Please try again.",
    "session-error",
  );
  if (isPending) return <SessionStatus />;
  if (error)
    return (
      <SessionStatus
        retry={() => {
          void refetch();
        }}
      />
    );
  if (!session) return <Redirect href="/auth" />;
  if (!session.user.nameConfirmed && pathname !== "/complete-profile")
    return <><Redirect href="/complete-profile" /><SessionStatus /></>;
  return <Stack screenOptions={{ headerShown: false }} />;
}
