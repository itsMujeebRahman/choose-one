import { FaApple } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { useTheme } from "../../theme/theme";

export default function SocialIcon({
  provider,
}: {
  provider: "google" | "apple";
}) {
  const { colors } = useTheme();
  return provider === "google" ? (
    <FcGoogle size={22} aria-hidden="true" />
  ) : (
    <FaApple size={22} color={colors.ink} aria-hidden="true" />
  );
}
