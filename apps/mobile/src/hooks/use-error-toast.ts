import { useEffect } from "react";
import { toast } from "sonner-native";

// React to a new failure, not every render or error-object identity change.
export function useErrorToast(error: unknown, message: string, id: string) {
  const hasError = Boolean(error);
  useEffect(() => {
    if (hasError) toast.error(message, { id });
  }, [hasError, message, id]);
}
