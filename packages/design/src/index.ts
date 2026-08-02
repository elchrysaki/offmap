export const colors = {
  paper: '#F5EEDC',
  paperRaised: '#FFF9EC',
  ink: '#111111',
  mutedInk: '#5B574F',
  line: '#24211C',
  blue: '#1268FF',
  orange: '#FF5A24',
  magenta: '#F42AA4',
  violet: '#6E4BFF',
  lime: '#C9F43B',
  teal: '#0E9F8C',
  white: '#FFFFFF',
  danger: '#B42318',
  success: '#117A52',
  focus: '#1268FF',
} as const;

export const fontFamilies = {
  display: 'ArchivoBlack_400Regular',
  body: 'DMSans_400Regular',
  bodyMedium: 'DMSans_500Medium',
  bodyBold: 'DMSans_700Bold',
  handwritten: 'Caveat_600SemiBold',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  hero: 48,
  section: 64,
} as const;

export const radii = {
  small: 8,
  medium: 14,
  large: 22,
  pill: 999,
} as const;

export const typeScale = {
  label: 12,
  body: 16,
  bodyLarge: 18,
  title: 28,
  display: 48,
  displayWide: 72,
} as const;

export const layout = {
  minimumTouchTarget: 44,
  contentMaxWidth: 1180,
  readingMaxWidth: 720,
  webBreakpoint: 820,
} as const;

export const collage = {
  tape: 'rgba(255, 232, 153, 0.78)',
  shadow: 'rgba(17, 17, 17, 0.16)',
  borderWidth: 2,
  subtleRotation: '1.2deg',
} as const;
