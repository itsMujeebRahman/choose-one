import { useErrorToast } from "../../hooks/use-error-toast";
import { Redirect, Slot, usePathname } from 'expo-router';
import { authClient } from '../../lib/auth-client';
import SessionStatus from '../../components/session-status';

export default function AppLayout() {
  const pathname = usePathname();
  const { data: session, isPending, error, refetch } = authClient.useSession();
  useErrorToast(error, "We couldn’t restore your session. Please try again.", "session-error");
  if (isPending) return <SessionStatus />;
  if (error) return <SessionStatus retry={() => { void refetch(); }} />;
  if (!session) return <Redirect href="/auth" />;
  if (!session.user.nameConfirmed && pathname !== "/complete-profile") return <Redirect href="/complete-profile" />;
  return <Slot />;
}
