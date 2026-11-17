/**
 * Brand color tokens extracted from mobile reference screens (E1 - E41, Option A/B)
 */
export const colors = {
  // Brand Amber Accents (Action buttons, primary interactive highlights)
  amber: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B', // Primary action button (Sign In, Check In confirm)
    600: '#D97706',
    700: '#B45309',
  },

  // Deep Navy & Slate Neutrals (Backgrounds, headers, cards)
  navy: {
    900: '#0B192C', // App splash and dark background
    800: '#1E293B', // Dark surfaces
    700: '#334155', // Muted text
    600: '#475569',
    500: '#64748B', // Secondary metadata
    100: '#F1F5F9', // Card surface light
    50: '#F8FAFC',  // Screen background light
  },

  // Status indicators
  status: {
    pending: '#F59E0B',
    checkedIn: '#10B981',
    checkedOut: '#64748B',
    error: '#EF4444',
  },

  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
} as const;
