import Svg, { Circle, Path } from "react-native-svg";
import { colors } from "../../theme/tokens";

export default function TabIcon({
  name,
  focused,
}: {
  name: "home" | "profile" | "lists";
  focused: boolean;
}) {
  return (
    <Svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      stroke={focused ? colors.ink : colors.muted}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      accessible={false}
    >
      {name === "home" ? (
        <Path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z" />
      ) : name === "lists" ? (
        <Path d="M9 6h12M9 12h12M9 18h12M3 6h1M3 12h1M3 18h1" />
      ) : (
        <>
          <Circle cx={12} cy={8} r={4} />
          <Path d="M4 21v-2a8 8 0 0 1 16 0v2" />
        </>
      )}
    </Svg>
  );
}
