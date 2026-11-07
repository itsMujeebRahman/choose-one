import { Image } from "expo-image";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";

type Mascot = {
  source: number;
  label: string;
};

const mascots: Mascot[] = [
  {
    source: require("../../../assets/doodleVideo/doctor-confusion-transparent.webp"),
    label: "A doodle doctor walking by and asking: Any confusion?",
  },
  {
    source: require("../../../assets/doodleVideo/mira-transparent.webp"),
    label: "A doodle therapist walking in and asking: What are you choosing between?",
  },
  {
    source: require("../../../assets/doodleVideo/nana-transparent.webp"),
    label: "A doodle grandmother shuffling in and asking: What options are on your mind, dear?",
  },
  {
    source: require("../../../assets/doodleVideo/pip-transparent.webp"),
    label: "A doodle driver parking a little car and asking: Can't decide which way to go?",
  },
  {
    source: require("../../../assets/doodleVideo/sprout-transparent.webp"),
    label: "A doodle jogger slowing down and asking: Which choice keeps you running in circles?",
  },
  {
    source: require("../../../assets/doodleVideo/fern-transparent.webp"),
    label: "A doodle gardener watering a plant and asking: Which decision needs a little care today?",
  },
];

// Each illustration plays once (12s), then the next one walks in.
const PLAY_MS = 12_000;
let currentMascotIndex = 0;

export default function MascotPrompt() {
  const [index, setIndex] = useState(currentMascotIndex);

  useEffect(() => {
    const timer = setInterval(() => {
      const next = (currentMascotIndex + 1) % mascots.length;
      currentMascotIndex = next;
      setIndex(next);
    }, PLAY_MS);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const next = mascots[(index + 1) % mascots.length];
    void Image.loadAsync(next.source).catch(() => {
      /* The animation still loads on demand if preloading fails. */
    });
  }, [index]);

  const mascot = mascots[index];
  return (
    <View pointerEvents="none" style={s.container}>
      <Image
        source={mascot.source}
        contentFit="contain"
        autoplay
        cachePolicy="memory-disk"
        recyclingKey={`mascot-${index}`}
        transition={200}
        accessibilityRole="image"
        accessibilityLabel={mascot.label}
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
