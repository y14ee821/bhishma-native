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

export const AutoIcon = ({ color = '#007AFF', size = 24 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {/* Half Moon (left side) */}
    <Path
      d="M9 2C7.05 2.05 5.19 2.86 3.67 4.32 2.15 5.78 1.03 7.77 1 10c.03 2.22 1.15 4.22 2.67 5.67 1.52 1.45 3.38 2.27 5.33 2.32v-1.5c-1.45-.05-2.79-.69-3.74-1.83C4.31 14.37 3.5 12.24 3.5 10s.81-4.37 2.16-5.83C6.51 3.03 7.85 2.39 9.3 2.34V2z"
      fill={color}
    />
    {/* Half Sun (right side) */}
    <Path
      d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"
      fill={color}
    />
    {/* Sun rays */}
    <Path
      d="M12 0h1v3h-1V0zM12 21h1v3h-1v-3zM23 12v-1h-3v1h3zM4 12v-1H1v1h3zM20.49 3.51l-.71-.71-2.12 2.12.71.71 2.12-2.12zM6.34 17.66l-.71-.71-2.12 2.12.71.71 2.12-2.12zM20.49 20.49l-2.12-2.12.71-.71 2.12 2.12-.71.71zM6.34 6.34L4.22 4.22l.71-.71 2.12 2.12-.71.71z"
      fill={color}
    />
  </Svg>
);


