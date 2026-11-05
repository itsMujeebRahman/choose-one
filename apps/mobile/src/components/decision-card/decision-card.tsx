import { useDailyQuestion } from "../../hooks/use-daily-question";
import {
  nextAnswerColorIndex,
  storedAnswerColorIndex,
} from "../../lib/color-storage";
import { randomUUID } from "expo-crypto";
import { useEffect, useRef, useState } from "react";
import { Keyboard, StyleSheet, Text, TextInput, View } from "react-native";
import { toast } from "sonner-native";
import { chooseOption } from "../../lib/choose-option";
import { colors as c, fonts as f } from "../../theme/tokens";
import ProblemTitleInput from "./problem-title-input";
import OptionsQuestion from "./options-question";
import EditProblemButton from "./edit-problem-button";
import OptionsForm, { type DecisionOption } from "./options-form";
import ChoiceLoader, { preloadChoiceSticker } from "./choice-loader";
import ChoiceResult, { answerColors } from "./choice-result";
import Animated, { FadeOut } from "react-native-reanimated";

type Stage = "title" | "question" | "options" | "loading" | "result";
export default function DecisionCard({
  userName,
  backgroundColor = c.peachLight,
}: {
  userName: string;
  backgroundColor?: string;
}) {
  const dailyGreeting = useDailyQuestion(userName);
  const [stage, setStage] = useState<Stage>("title");
  const [problemTitle, setProblemTitle] = useState("");
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");
  const [options, setOptions] = useState<DecisionOption[]>([
    { id: 0, value: "" },
    { id: 1, value: "" },
  ]);
  const [answer, setAnswer] = useState("");
  const [answerColorIndex, setAnswerColorIndex] = useState(() =>
    storedAnswerColorIndex(answerColors.length),
  );
  const nextId = useRef(2);
  const submission = useRef<{ signature: string; id: string } | null>(null);
  const busy = useRef(false);
  const controller = useRef<AbortController | null>(null);
  useEffect(
    () => () => {
      controller.current?.abort();
      controller.current = null;
    },
    [],
  );
  useEffect(() => {
    void preloadChoiceSticker();
  }, []);
  function startNewDecision() {
    setEditingTitle(false);
    setTitleDraft("");
    setProblemTitle("");
    setOptions([
      { id: 0, value: "" },
      { id: 1, value: "" },
    ]);
    setAnswer("");
    nextId.current = 2;
    submission.current = null;
    Keyboard.dismiss();
    setStage("title");
  }
  function saveTitle() {
    const title = titleDraft.trim();
    if (!title) {
      toast.error("Enter the problem name first.");
      return;
    }
    setProblemTitle(title);
    setEditingTitle(false);
    Keyboard.dismiss();
  }
  async function choose() {
    if (busy.current) return;
    const values = options.map((option) => option.value.trim());
    if (values.some((value) => !value)) {
      toast.error("Fill in each option before we choose.");
      return;
    }
    if (
      new Set(values.map((value) => value.toLowerCase())).size !== values.length
    ) {
      toast.error("Give each option a different name.");
      return;
    }
    const signature = JSON.stringify({
      title: problemTitle.trim(),
      options: values,
    });
    if (submission.current?.signature !== signature)
      submission.current = { signature, id: randomUUID() };
    const requestId = submission.current.id;
    Keyboard.dismiss();
    busy.current = true;
    setStage("loading");
    const request = new AbortController();
    controller.current = request;
    const timeout = setTimeout(() => request.abort(), 15000);
    try {
      // Settle the request immediately, then reveal its outcome after ten seconds.
      const [result] = await Promise.all([
        chooseOption(
          problemTitle.trim(),
          values,
          requestId,
          request.signal,
        ).then(
          (value) => ({ value, error: null }),
          (error) => ({ value: null, error }),
        ),
        new Promise<void>((resolve) => setTimeout(resolve, 10000)),
      ]);
      if (controller.current !== request) return;
      if (request.signal.aborted)
        throw new Error("The request took too long. Please try again.");
      if (result.error) throw result.error;
      setAnswer(result.value!);
      setAnswerColorIndex(nextAnswerColorIndex(answerColors.length));
      setStage("result");
    } catch (error) {
      if (controller.current !== request) return;
      toast.error(
        error instanceof Error && error.name !== "AbortError"
          ? error.message
          : "Couldn’t reach the API. Please try again.",
      );
      setStage("options");
    } finally {
      clearTimeout(timeout);
      busy.current = false;
    }
  }
  return (
    <View style={[s.card, { backgroundColor }]}>
      <Text style={s.title}>{dailyGreeting}</Text>
      {stage === "title" ? (
        <ProblemTitleInput
          value={problemTitle}
          onChange={setProblemTitle}
          onContinue={() => {
            if (!problemTitle.trim()) {
              toast.error("Enter the problem name first.");
              return;
            }
            setProblemTitle(problemTitle.trim());
            Keyboard.dismiss();
            setStage("question");
          }}
        />
      ) : (
        <View style={s.problem}>
          <Text style={s.problemLabel}>YOUR PROBLEM</Text>
          <View style={s.problemRow}>
            {editingTitle ? (
              <TextInput
                autoFocus
                accessibilityLabel="Edit problem name"
                value={titleDraft}
                onChangeText={setTitleDraft}
                maxLength={100}
                style={[s.problemTitle, s.titleInput]}
                returnKeyType="done"
                onSubmitEditing={saveTitle}
                underlineColorAndroid="transparent"
              />
            ) : (
              <Text style={s.problemTitle}>{problemTitle}</Text>
            )}
            {stage !== "loading" && (
              <EditProblemButton
                editing={editingTitle}
                onPress={() => {
                  if (editingTitle) saveTitle();
                  else {
                    setTitleDraft(problemTitle);
                    setEditingTitle(true);
                  }
                }}
              />
            )}
          </View>
        </View>
      )}
      {stage === "question" && !editingTitle && (
        <OptionsQuestion
          onContinue={() => setStage("options")}
          onCancel={startNewDecision}
        />
      )}
      {stage === "options" && !editingTitle && (
        <OptionsForm
          options={options}
          onChange={(id, value) =>
            setOptions((current) =>
              current.map((option) =>
                option.id === id ? { ...option, value } : option,
              ),
            )
          }
          onRemove={(id) =>
            setOptions((current) =>
              current.filter((option) => option.id !== id),
            )
          }
          onAdd={() =>
            setOptions((current) =>
              current.length < 10
                ? [...current, { id: nextId.current++, value: "" }]
                : current,
            )
          }
          onSubmit={choose}
        />
      )}
      {stage === "loading" && (
        <Animated.View exiting={FadeOut.duration(260)}>
          <ChoiceLoader />
        </Animated.View>
      )}
      {stage === "result" && !editingTitle && (
        <ChoiceResult
          answer={answer}
          colorIndex={answerColorIndex}
          onStartNew={startNewDecision}
        />
      )}
    </View>
  );
}
const s = StyleSheet.create({
  card: {
    width: "100%",
    maxWidth: 500,
    alignSelf: "center",
    backgroundColor: c.peachLight,
    borderRadius: 36,
    padding: 28,
  },
  title: {
    fontFamily: f.regular,
    fontSize: 34,
    lineHeight: 39,
    letterSpacing: -1.2,
    color: c.ink,
  },
  problem: { marginTop: 22, gap: 10 },
  problemLabel: {
    fontFamily: f.medium,
    fontSize: 10,
    letterSpacing: 1.4,
    color: c.muted,
  },
  problemRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  titleInput: {
    flex: 1,
    minWidth: 0,
    backgroundColor: c.surface,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  problemTitle: {
    flexShrink: 1,
    fontFamily: f.medium,
    fontSize: 21,
    lineHeight: 27,
    color: c.ink,
  },
});
