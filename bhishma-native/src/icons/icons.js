import Svg, { Path } from 'react-native-svg';
export const FlashIcon = ({ color = '#007AFF', size = 24 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M7 2v11h3v9l7-12h-4l4-8z"
      fill={color}
    />
  </Svg>
);

// Simple Home and Control Icons using SVG
export const HomeIcon = ({ color = '#007AFF', size = 24 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 10.5V21a1 1 0 001 1h5v-6h4v6h5a1 1 0 001-1V10.5a1 1 0 00-.293-.707l-8-8a1 1 0 00-1.414 0l-8 8A1 1 0 003 10.5z"
      fill={color}
    />
  </Svg>
);

export const ControlIcon = ({ color = '#007AFF', size = 24 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M4 13h16v-2H4v2zm0 5h10v-2H4v2zm0-10h7V6H4v2z"
      fill={color}
    />
  </Svg>
);


