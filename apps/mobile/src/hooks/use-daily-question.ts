import { useEffect, useState } from "react";
import { AppState } from "react-native";
import { dailyQuestion, getTimeUntilNextQuestion } from "../lib/daily-question";

export function useDailyQuestion(name: string) {
  const [question, setQuestion] = useState(() => dailyQuestion(name));
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    function refresh() {
      clearTimeout(timer);
      setQuestion(dailyQuestion(name));
      const delay = getTimeUntilNextQuestion() + 100;
      timer = setTimeout(refresh, delay);
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
