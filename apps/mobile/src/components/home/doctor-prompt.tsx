import { Image } from "expo-image";
import { StyleSheet, View } from "react-native";

const doctorConfusion = require("../../../assets/doodleVideo/doctor-confusion-transparent.webp");

export default function DoctorPrompt() {
  return (
    <View pointerEvents="none" style={s.container}>
      <Image
        source={doctorConfusion}
        contentFit="contain"
        autoplay
        transition={200}
        accessibilityRole="image"
        accessibilityLabel="A doodle doctor walking by and asking: Any confusion?"
        style={s.image}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    width: "100%",
    maxWidth: 500,
    alignSelf: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  image: { width: "100%", aspectRatio: 16 / 9 },
});
