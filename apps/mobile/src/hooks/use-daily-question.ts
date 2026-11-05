import { useEffect, useState } from "react";
import { AppState } from "react-native";
import { dailyQuestion } from "../lib/daily-question";

export function useDailyQuestion(name: string) {
  const [question, setQuestion] = useState(() => dailyQuestion(name));
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    function refresh() {
      clearTimeout(timer);
      setQuestion(dailyQuestion(name));
      const now = new Date();
      const midnight = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1,
      );
      timer = setTimeout(refresh, midnight.getTime() - now.getTime() + 100);
    }
    refresh();
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") refresh();
    });
    return () => {
      clearTimeout(timer);
      subscription.remove();
    };
  }, [name]);
  return question;
}
