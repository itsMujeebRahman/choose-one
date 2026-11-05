import Svg, { Path } from 'react-native-svg';
import { colors } from '../theme/tokens';
import { socialIcons } from './social-icon-data';

export default function SocialIcon({ provider }: { provider: 'google' | 'apple' }) {
  const icon = socialIcons[provider];
  return <Svg width={22} height={22} viewBox={icon.viewBox} fill={colors.ink} accessible={false}>
    {icon.paths.map((path, index) => <Path key={index} {...path} />)}
  </Svg>;
}
