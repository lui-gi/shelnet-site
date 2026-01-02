/**
 * Centralized theme color configuration for consistent theming across components.
 * Supports green (A+) and blue (Security+) themes.
 * Can be extended with additional themes (purple, orange, red, etc.) for future certifications.
 */

export const themeColors = {
  green: {
    // Backgrounds
    bgActive: 'bg-green-500/10',
    bgHover: 'bg-white/[0.05]',

    // Borders
    border: 'border-white/10',
    borderActive: 'border-green-500',
    borderHover: 'border-white/30',
    hoverBorder: 'hover:border-green-500',

    // Text colors
    text: 'text-green-400',
    textMuted: 'text-green-400/80',
    textHover: 'hover:text-green-400',

    // Indicators
    pulse: 'bg-green-400',

    // Icon box (for PageHeader compatibility)
    iconBg: 'bg-green-500/20',
    iconBorder: 'border-green-500/50'
  },

  blue: {
    // Backgrounds
    bgActive: 'bg-blue-500/10',
    bgHover: 'bg-white/[0.05]',

    // Borders
    border: 'border-white/10',
    borderActive: 'border-blue-500',
    borderHover: 'border-white/30',
    hoverBorder: 'hover:border-blue-500',

    // Text colors
    text: 'text-blue-400',
    textMuted: 'text-blue-400/80',
    textHover: 'hover:text-blue-400',

    // Indicators
    pulse: 'bg-blue-400',

    // Icon box (for PageHeader compatibility)
    iconBg: 'bg-blue-500/20',
    iconBorder: 'border-blue-500/50'
  }
};
