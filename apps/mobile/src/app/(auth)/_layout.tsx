import { useErrorToast } from "../../hooks/use-error-toast";
import { Redirect, Slot } from 'expo-router';
import { authClient } from '../../lib/auth-client';
import SessionStatus from '../../components/session-status';

export default function AuthLayout() {
  const { data: session, isPending, error } = authClient.useSession();
  useErrorToast(error, "We couldn’t restore your session. Please try again.", "session-error");
  if (isPending) return <SessionStatus />;
  if (session) return <Redirect href="/" />;
  return <Slot />;
}
