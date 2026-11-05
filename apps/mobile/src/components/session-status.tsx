import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../theme/tokens';

export default function SessionStatus({ retry }: { retry?: () => void }) {
  return (
    <View style={styles.page}>
      {retry ? <>
        <Pressable accessibilityRole="button" onPress={retry} style={styles.button}>
          <Text style={styles.buttonText}>Try again</Text>
        </Pressable>
      </> : <ActivityIndicator accessibilityLabel="Checking your session" color={colors.ink} />}
    </View>
  );
}
const styles = StyleSheet.create({
  page: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background, padding: 24, gap: 20 },
  button: { backgroundColor: colors.ink, borderRadius: 999, paddingHorizontal: 24, paddingVertical: 16 },
  buttonText: { fontFamily: fonts.medium, color: colors.surface, fontSize: 15 },
});
