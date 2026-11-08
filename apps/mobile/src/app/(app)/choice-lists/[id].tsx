import { useCallback, useEffect, useRef, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import Svg, { Path } from "react-native-svg";
import { toast } from "sonner-native";
import ConfirmModal from "../../../components/confirm-modal";
import ChoiceLoader, {
  preloadChoiceLoader,
} from "../../../components/decision-card/choice-loader";
import DecisionButton from "../../../components/decision-card/decision-button";
import {
  answerColorCount,
  getAnswerColors,
} from "../../../components/decision-card/choice-result";
import FightLoader from "../../../components/feedback/fight-loader";
import ProfilePage from "../../../components/profile/profile-page";
import { fullDate } from "../../../lib/date";
import {
  useChoiceListDetailQuery,
  useDeleteChoiceListMutation,
  usePickFromChoiceListMutation,
  useRenameChoiceListMutation,
  useRestartChoiceListRoundMutation,
  useUpdateChoiceListOptionsMutation,
} from "../../../services/choice-lists";
import { useTheme, useThemeStyles } from "../../../theme/theme";
import { fonts as f, type ThemeColors } from "../../../theme/tokens";

type DraftOption = {
  id?: string;
  label: string;
  key: string;
};

export default function ChoiceListScreen() {
  const { isDark } = useTheme();
  const [s, c] = useThemeStyles(createStyles);
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    data: list,
    isLoading: loading,
    refetch,
  } = useChoiceListDetailQuery(id);

  const pickMutation = usePickFromChoiceListMutation();
  const renameMutation = useRenameChoiceListMutation();
  const updateOptionsMutation = useUpdateChoiceListOptionsMutation();
  const restartRoundMutation = useRestartChoiceListRoundMutation();
  const deleteListMutation = useDeleteChoiceListMutation();

  // Pick state
  const [busy, setBusy] = useState(false);
  const picking = useRef(false);

  // Unified edit state (one edit mode for both title and options)
  const [isEditing, setIsEditing] = useState(false);
  const [titleInput, setTitleInput] = useState("");
  const [draftOptions, setDraftOptions] = useState<DraftOption[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const nextOptionKey = useRef(1);

  // Round restart & delete state
  const [isRestartingRound, setIsRestartingRound] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    void preloadChoiceLoader();
  }, []);

  useFocusEffect(
    useCallback(() => {
      void refetch();
    }, [refetch]),
  );

  const selected =
    list?.options
      .filter((o) => o.selectedOrder !== null)
      .sort((a, b) => a.selectedOrder! - b.selectedOrder!) ?? [];
  const remaining = list?.options.filter((o) => o.selectedOrder === null) ?? [];
  const latest = selected[selected.length - 1];
  const latestColor = latest
    ? getAnswerColors(c)[((latest.selectedOrder ?? 1) - 1) % answerColorCount]
    : undefined;

  // 1. Pick handler
  async function pick() {
    if (picking.current || !list) return;
    picking.current = true;
    setBusy(true);
    try {
      const [outcome] = await Promise.all([
        pickMutation
          .mutateAsync({ listId: id, roundNumber: list.roundNumber ?? 1 })
          .then((result) => ({ result, error: null }))
          .catch((error) => ({ result: null, error })),
        new Promise<void>((resolve) => setTimeout(resolve, 10000)),
      ]);
      if (outcome.error) throw outcome.error;
      await refetch();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Couldn’t pick an option.",
      );
    } finally {
      picking.current = false;
      setBusy(false);
    }
  }

  // 2. Unified Edit Handlers (Title + Options)
  function startEdit() {
    if (!list) return;
    setTitleInput(list.title);
    setDraftOptions(
      remaining.map((o) => ({
        id: o.id,
        label: o.label,
        key: `opt-${o.id}`,
      })),
    );
    setIsEditing(true);
  }

  function cancelEdit() {
    setIsEditing(false);
    if (list) {
      setTitleInput(list.title);
      setDraftOptions(
        remaining.map((o) => ({
          id: o.id,
          label: o.label,
          key: `opt-${o.id}`,
        })),
      );
    }
  }

  function handleAddDraftOption() {
    if (selected.length + draftOptions.length >= 20) {
      toast.error("Lists can have up to 20 options in total.");
      return;
    }
    setDraftOptions((prev) => [
      ...prev,
      { label: "", key: `new-${nextOptionKey.current++}` },
    ]);
  }

  function handleRemoveDraftOption(key: string) {
    if (selected.length + draftOptions.length <= 3) {
      toast.error(
        "Keep at least 3 options in the list, including previous picks.",
      );
      return;
    }
    setDraftOptions((prev) => prev.filter((o) => o.key !== key));
  }

  function handleOptionLabelChange(key: string, text: string) {
    setDraftOptions((prev) =>
      prev.map((o) => (o.key === key ? { ...o, label: text } : o)),
    );
  }

  async function handleSave() {
    if (!list || isSaving) return;

    const trimmedTitle = titleInput.trim();
    if (!trimmedTitle) {
      toast.error("Please enter a list name.");
      return;
    }
    if (trimmedTitle.length > 100) {
      toast.error("List name must be 100 characters or fewer.");
      return;
    }

    const totalOptions = selected.length + draftOptions.length;
    if (totalOptions < 3 || totalOptions > 20) {
      toast.error("Keep between 3 and 20 options in total.");
      return;
    }

    const trimmedLabels = draftOptions.map((o) => o.label.trim());
    if (trimmedLabels.some((l) => !l)) {
      toast.error("Fill in each option or remove empty ones.");
      return;
    }

    const allLower = [
      ...selected.map((o) => o.label.trim().toLowerCase()),
      ...trimmedLabels.map((l) => l.toLowerCase()),
    ];
    if (new Set(allLower).size !== allLower.length) {
      toast.error("Give each option a different name.");
      return;
    }

    const titleChanged = trimmedTitle !== list.title;
    const optionsChanged =
      draftOptions.length !== remaining.length ||
      draftOptions.some((draft, i) => {
        const orig = remaining[i];
        return !orig || draft.id !== orig.id || draft.label.trim() !== orig.label;
      });

    if (!titleChanged && !optionsChanged) {
      setIsEditing(false);
      return;
    }

    try {
      setIsSaving(true);
      let currentRev = list.revision ?? 0;

      if (titleChanged) {
        await renameMutation.mutateAsync({
          id: list.id,
          title: trimmedTitle,
          revision: currentRev,
        });
        currentRev += 1;
      }

      if (optionsChanged) {
        await updateOptionsMutation.mutateAsync({
          id: list.id,
          options: draftOptions.map((o) => ({
            ...(o.id ? { id: o.id } : {}),
            label: o.label.trim(),
          })),
          revision: currentRev,
        });
      }

      toast.success("Choice list updated.");
      setIsEditing(false);
      await refetch();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Couldn’t update choice list.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  // 4. Start new round handler
  async function handleStartNewRound() {
    if (!list || isRestartingRound) return;
    try {
      setIsRestartingRound(true);
      await restartRoundMutation.mutateAsync({
        id: list.id,
        roundNumber: list.roundNumber ?? 1,
        revision: list.revision ?? 0,
      });
      toast.success("New round started!");
      await refetch();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Couldn’t start a new round.",
      );
    } finally {
      setIsRestartingRound(false);
    }
  }

  // 5. Delete list handler with confirmation
  function confirmDeleteList() {
    if (!list || isDeleting) return;
    setShowDeleteModal(true);
  }

  async function handleDeleteList() {
    if (!list || isDeleting) return;
    try {
      setIsDeleting(true);
      await deleteListMutation.mutateAsync({
        id: list.id,
        revision: list.revision ?? 0,
      });
      setShowDeleteModal(false);
      toast.success("Choice list deleted.");
      router.replace("/lists");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Couldn’t delete this list.",
      );
      setIsDeleting(false);
    }
  }

  return (
    <ProfilePage
      backTo="/lists"
      backLabel="Back to Choice Lists"
      title="Choice List"
    >
      {loading ? (
        <FightLoader />
      ) : !list ? (
        <DecisionButton label="Try again" onPress={() => void refetch()} />
      ) : (
        <View style={s.card}>
          {/* 1. Header / List Name with Single Edit Icon */}
          <View style={s.header}>
            <View style={s.headerTop}>
              <Text style={s.label}>CHOICE LIST</Text>
              {!isEditing && (
                <View style={s.headerActions}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Edit choice list"
                    onPress={startEdit}
                    hitSlop={8}
                    style={({ pressed }) => [
                      s.iconButton,
                      pressed && { opacity: 0.6 },
                    ]}
                  >
                    <Svg
                      width={18}
                      height={18}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={c.ink}
                      strokeWidth={1.8}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      accessible={false}
                    >
                      <Path d="m16 3 5 5M4 20l4-1L21 6a2.1 2.1 0 0 0-3-3L5 16l-1 4Z" />
                    </Svg>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Delete choice list"
                    onPress={confirmDeleteList}
                    disabled={isDeleting || busy}
                    hitSlop={8}
                    style={({ pressed }) => [
                      s.iconButton,
                      (pressed || isDeleting) && { opacity: 0.6 },
                    ]}
                  >
                    <Svg
                      width={18}
                      height={18}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={c.error}
                      strokeWidth={1.8}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      accessible={false}
                    >
                      <Path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6" />
                    </Svg>
                  </Pressable>
                </View>
              )}
            </View>

            {isEditing ? (
              <TextInput
                accessibilityLabel="Edit list name"
                value={titleInput}
                onChangeText={setTitleInput}
                placeholder="Enter list name"
                placeholderTextColor={c.muted}
                keyboardAppearance={isDark ? "dark" : "light"}
                style={s.titleInput}
                maxLength={100}
                editable={!isSaving}
              />
            ) : (
              <Text selectable style={s.headingTitle}>
                {list.title}
              </Text>
            )}

            <Text style={s.cardMeta}>
              {(list.roundNumber ?? 1) > 1 ? `Round ${list.roundNumber} • ` : ""}
              {list.pickCount} of {list.optionCount} chosen - {remaining.length}{" "}
              left to try
            </Text>
          </View>

          {/* Latest Pick Banner (hidden during edit mode) */}
          {!isEditing && !busy && latest && (
            <View style={[s.answer, { backgroundColor: latestColor }]}>
              <Text style={s.answerEyebrow}>YOUR LATEST PICK</Text>
              <Text style={s.answerText}>{latest.label}</Text>
              <Text style={s.answerDate}>
                Pick {latest.selectedOrder} - {fullDate(latest.selectedAt)}
              </Text>
            </View>
          )}

          {busy && <ChoiceLoader />}

          {/* Action button: Choose next OR Start new round (hidden during edit mode) */}
          {!isEditing &&
            (remaining.length > 0 ? (
              <View style={s.actionSection}>
                <DecisionButton
                  label={busy ? "Choosing…" : "Choose my next option ↗"}
                  disabled={busy}
                  onPress={pick}
                />
                <Text style={s.caption}>
                  Pick again whenever you’re ready, today or another day. Previous
                  picks won’t repeat.
                </Text>
              </View>
            ) : (
              <View style={s.completedCard}>
                <Text style={s.completedTitle}>
                  {(list.roundNumber ?? 1) > 1
                    ? `Round ${list.roundNumber} complete!`
                    : "You’ve tried them all!"}
                </Text>
                <Text style={s.completedBody}>
                  Every option in this round has had its turn. Start a new round
                  to try them all again, keeping your previous results in history.
                </Text>
                <DecisionButton
                  label={
                    isRestartingRound
                      ? "Starting new round…"
                      : `Start Round ${(list.roundNumber ?? 1) + 1} ↗`
                  }
                  disabled={isRestartingRound || busy}
                  onPress={handleStartNewRound}
                />
              </View>
            ))}

          {/* 2. Unpicked Options Section */}
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>Still to try</Text>
          </View>

          {isEditing ? (
            <View style={s.optionsEditContainer}>
              {draftOptions.map((opt, index) => (
                <View key={opt.key} style={s.optionEditRow}>
                  <Text style={s.optionIndex}>
                    {String(index + 1).padStart(2, "0")}
                  </Text>
                  <TextInput
                    accessibilityLabel={`Option ${index + 1}`}
                    value={opt.label}
                    onChangeText={(text) =>
                      handleOptionLabelChange(opt.key, text)
                    }
                    placeholder={`Option ${index + 1}`}
                    placeholderTextColor={c.muted}
                    keyboardAppearance={isDark ? "dark" : "light"}
                    style={s.optionInput}
                    maxLength={120}
                    editable={!isSaving}
                  />
                  {selected.length + draftOptions.length > 3 ? (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Remove option ${index + 1}`}
                      hitSlop={8}
                      onPress={() => handleRemoveDraftOption(opt.key)}
                      disabled={isSaving}
                      style={({ pressed }) => [
                        s.removeOptionBtn,
                        pressed && { opacity: 0.6 },
                      ]}
                    >
                      <Text style={s.removeOptionText}>×</Text>
                    </Pressable>
                  ) : null}
                </View>
              ))}

              {selected.length + draftOptions.length < 20 && (
                <Pressable
                  accessibilityRole="button"
                  onPress={handleAddDraftOption}
                  disabled={isSaving}
                  style={({ pressed }) => [
                    s.addOptionButton,
                    pressed && { opacity: 0.7 },
                  ]}
                >
                  <Text style={s.addOptionButtonText}>
                    + Add another option
                  </Text>
                </Pressable>
              )}

              <View style={s.buttonRow}>
                <Pressable
                  accessibilityRole="button"
                  onPress={cancelEdit}
                  disabled={isSaving}
                  style={({ pressed }) => [
                    s.cancelButton,
                    pressed && { opacity: 0.7 },
                  ]}
                >
                  <Text style={s.cancelButtonText}>Cancel</Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  onPress={handleSave}
                  disabled={isSaving}
                  style={({ pressed }) => [
                    s.saveButton,
                    (pressed || isSaving) && { opacity: 0.65 },
                  ]}
                >
                  {isSaving ? (
                    <FightLoader decorative style={s.buttonLoader} />
                  ) : (
                    <Text style={s.saveButtonText}>Save changes</Text>
                  )}
                </Pressable>
              </View>
            </View>
          ) : remaining.length > 0 ? (
            remaining.map((o) => (
              <View key={o.id} style={s.row}>
                <Text style={s.rowText}>{o.label}</Text>
              </View>
            ))
          ) : (
            <Text style={s.emptyNotice}>
              No unpicked options left in this round.
            </Text>
          )}

          {/* Current Round Picks */}
          {!!selected.length && (
            <Text style={s.sectionTitle}>
              {(list.roundNumber ?? 1) > 1
                ? `Round ${list.roundNumber} picks`
                : "Your picks"}
            </Text>
          )}
          {selected.map((o) => (
            <View key={o.id} style={s.row}>
              <Text style={s.rowText}>
                {o.selectedOrder}. {o.label}
              </Text>
              <Text style={s.date}>{fullDate(o.selectedAt)}</Text>
            </View>
          ))}

          {/* 3. Previous Rounds History Archive */}
          {!!list.rounds?.length && (
            <View style={s.historySection}>
              <Text style={s.sectionTitle}>Round history</Text>
              {list.rounds.map((round) => (
                <View key={round.id} style={s.roundCard}>
                  <View style={s.roundCardHeader}>
                    <Text style={s.roundTitle}>Round {round.roundNumber}</Text>
                    <Text style={s.date}>{fullDate(round.completedAt)}</Text>
                  </View>
                  <View style={s.roundPicksList}>
                    {round.picks.map((pick) => (
                      <View key={pick.id} style={s.historyPickRow}>
                        <Text style={s.historyPickOrder}>
                          {pick.selectedOrder}.
                        </Text>
                        <Text style={s.historyPickLabel}>{pick.label}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      <ConfirmModal
        visible={showDeleteModal}
        heading="Delete Choice List"
        bodyText={`Are you sure you want to delete "${list?.title}"? This cannot be undone.`}
        confirmText="Delete"
        confirmColor={c.error}
        loading={isDeleting}
        onConfirm={handleDeleteList}
        onCancel={() => setShowDeleteModal(false)}
      />
    </ProfilePage>
  );
}

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
    card: {
      backgroundColor: c.peachLight,
      borderRadius: 36,
      padding: 24,
      gap: 20,
    },
    header: {
      gap: 8,
    },
    headerTop: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    label: {
      fontFamily: f.medium,
      fontSize: 11,
      letterSpacing: 1.2,
      color: c.muted,
    },
    headingTitle: {
      fontFamily: f.medium,
      fontSize: 26,
      lineHeight: 32,
      color: c.ink,
      letterSpacing: -0.6,
    },
    cardMeta: {
      fontFamily: f.regular,
      fontSize: 14,
      lineHeight: 20,
      color: c.muted,
    },
    headerActions: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    iconButton: {
      width: 40,
      height: 40,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: c.surface,
      borderRadius: 20,
      flexShrink: 0,
    },
    titleInput: {
      fontFamily: f.medium,
      fontSize: 22,
      color: c.ink,
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 16,
      minHeight: 52,
      paddingHorizontal: 16,
      letterSpacing: -0.4,
    },
    buttonRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-end",
      gap: 10,
      marginTop: 4,
    },
    cancelButton: {
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 999,
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.border,
      alignItems: "center",
      justifyContent: "center",
    },
    cancelButtonText: {
      fontFamily: f.medium,
      fontSize: 14,
      color: c.muted,
    },
    saveButton: {
      paddingVertical: 10,
      paddingHorizontal: 22,
      borderRadius: 999,
      backgroundColor: c.ink,
      alignItems: "center",
      justifyContent: "center",
      minWidth: 76,
      minHeight: 40,
    },
    saveButtonText: {
      fontFamily: f.medium,
      fontSize: 14,
      color: c.surface,
    },
    buttonLoader: {
      width: 24,
      height: 24,
    },
    body: {
      fontFamily: f.regular,
      fontSize: 16,
      lineHeight: 24,
      color: c.muted,
    },
    caption: {
      fontFamily: f.regular,
      fontSize: 14,
      lineHeight: 20,
      color: c.muted,
    },
    date: {
      fontFamily: f.regular,
      fontSize: 12,
      color: c.muted,
    },
    sectionTitle: {
      fontFamily: f.medium,
      fontSize: 20,
      lineHeight: 26,
      color: c.ink,
    },
    answer: {
      padding: 22,
      borderRadius: 24,
      backgroundColor: c.yellow,
      gap: 8,
    },
    answerEyebrow: {
      fontFamily: f.medium,
      fontSize: 10,
      letterSpacing: 1.2,
      color: c.muted,
    },
    answerText: {
      fontFamily: f.medium,
      fontSize: 24,
      lineHeight: 30,
      color: c.ink,
      letterSpacing: -0.4,
    },
    answerDate: {
      fontFamily: f.regular,
      fontSize: 13,
      color: c.muted,
    },
    actionSection: {
      gap: 10,
    },
    completedCard: {
      padding: 22,
      borderRadius: 24,
      backgroundColor: c.yellow,
      gap: 14,
    },
    completedTitle: {
      fontFamily: f.medium,
      fontSize: 22,
      lineHeight: 28,
      color: c.ink,
    },
    completedBody: {
      fontFamily: f.regular,
      fontSize: 15,
      lineHeight: 22,
      color: c.muted,
    },
    row: {
      padding: 16,
      borderRadius: 18,
      backgroundColor: c.surface,
      gap: 6,
    },
    rowText: {
      fontFamily: f.regular,
      fontSize: 16,
      lineHeight: 22,
      color: c.ink,
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: 4,
    },
    editBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 16,
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.border,
    },
    editBadgeText: {
      fontFamily: f.medium,
      fontSize: 13,
      color: c.ink,
    },
    optionsEditContainer: {
      gap: 10,
    },
    optionEditRow: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: c.surface,
      borderRadius: 18,
      paddingHorizontal: 14,
      paddingVertical: 4,
      gap: 10,
      borderWidth: 1,
      borderColor: c.border,
    },
    optionIndex: {
      fontFamily: f.medium,
      fontSize: 14,
      color: c.muted,
      width: 24,
    },
    optionInput: {
      flex: 1,
      fontFamily: f.regular,
      fontSize: 16,
      color: c.ink,
      minHeight: 46,
      paddingVertical: 8,
    },
    removeOptionBtn: {
      width: 32,
      height: 32,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 16,
    },
    removeOptionText: {
      fontSize: 22,
      color: c.muted,
      lineHeight: 24,
    },
    addOptionButton: {
      paddingVertical: 14,
      borderRadius: 18,
      borderWidth: 1.5,
      borderStyle: "dashed",
      borderColor: c.border,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: c.surface,
    },
    addOptionButtonText: {
      fontFamily: f.medium,
      fontSize: 15,
      color: c.ink,
    },
    emptyNotice: {
      fontFamily: f.regular,
      fontSize: 14,
      color: c.muted,
      fontStyle: "italic",
    },
    historySection: {
      marginTop: 8,
      gap: 12,
    },
    roundCard: {
      padding: 16,
      borderRadius: 20,
      backgroundColor: c.surface,
      gap: 10,
      borderWidth: 1,
      borderColor: c.border,
    },
    roundCardHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    roundTitle: {
      fontFamily: f.medium,
      fontSize: 16,
      color: c.ink,
    },
    roundPicksList: {
      gap: 6,
    },
    historyPickRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    historyPickOrder: {
      fontFamily: f.medium,
      fontSize: 14,
      color: c.muted,
      width: 20,
    },
    historyPickLabel: {
      fontFamily: f.regular,
      fontSize: 15,
      color: c.ink,
    },
  });
