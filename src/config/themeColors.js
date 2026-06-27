/**
 * Centralized theme color configuration for consistent theming across components.
 * Supports red (A+), blue (Security+), and purple (Visualizations) themes.
 * Can be extended with additional themes (orange, green, etc.) for future certifications.
 */

export const themeColors = {
  red: {
    // Backgrounds
    bgActive: 'bg-red-500/10',
    bgHover: 'bg-white/[0.05]',

    // Borders
    border: 'border-white/10',
    borderActive: 'border-red-500',
    borderHover: 'border-white/30',
    hoverBorder: 'hover:border-red-500',

    // Text colors
    text: 'text-red-400',
    textMuted: 'text-red-400/80',
    textHover: 'hover:text-red-400',

    // Indicators
    pulse: 'bg-red-400',

    // Icon box (for PageHeader compatibility)
    iconBg: 'bg-red-500/20',
    iconBorder: 'border-red-500/50'
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
  },

  purple: {
    // Backgrounds
    bgActive: 'bg-purple-500/10',
    bgHover: 'bg-white/[0.05]',

    // Borders
    border: 'border-white/10',
    borderActive: 'border-purple-500',
    borderHover: 'border-white/30',
    hoverBorder: 'hover:border-purple-500',

    // Text colors
    text: 'text-purple-400',
    textMuted: 'text-purple-400/80',
    textHover: 'hover:text-purple-400',

    // Indicators
    pulse: 'bg-purple-400',

    // Icon box (for PageHeader compatibility)
    iconBg: 'bg-purple-500/20',
    iconBorder: 'border-purple-500/50'
  },

  orange: {
    // Backgrounds
    bgActive: 'bg-orange-500/10',
    bgHover: 'bg-white/[0.05]',

    // Borders
    border: 'border-white/10',
    borderActive: 'border-orange-500',
    borderHover: 'border-white/30',
    hoverBorder: 'hover:border-orange-500',

    // Text colors
    text: 'text-orange-400',
    textMuted: 'text-orange-400/80',
    textHover: 'hover:text-orange-400',

    // Indicators
    pulse: 'bg-orange-400',

    // Icon box (for PageHeader compatibility)
    iconBg: 'bg-orange-500/20',
    iconBorder: 'border-orange-500/50'
  },

  cyan: {
    bgActive: 'bg-cyan-500/10',
    bgHover: 'bg-white/[0.05]',
    border: 'border-white/10',
    borderActive: 'border-cyan-500',
    borderHover: 'border-white/30',
    hoverBorder: 'hover:border-cyan-500',
    text: 'text-cyan-400',
    textMuted: 'text-cyan-400/80',
    textHover: 'hover:text-cyan-400',
    pulse: 'bg-cyan-400',
    iconBg: 'bg-cyan-500/20',
    iconBorder: 'border-cyan-500/50',
  },

  amber: {
    bgActive: 'bg-amber-500/10',
    bgHover: 'bg-white/[0.05]',
    border: 'border-white/10',
    borderActive: 'border-amber-500',
    borderHover: 'border-white/30',
    hoverBorder: 'hover:border-amber-500',
    text: 'text-amber-400',
    textMuted: 'text-amber-400/80',
    textHover: 'hover:text-amber-400',
    pulse: 'bg-amber-400',
    iconBg: 'bg-amber-500/20',
    iconBorder: 'border-amber-500/50',
  },

  green: {
    bgActive: 'bg-emerald-500/10',
    bgHover: 'bg-white/[0.05]',
    border: 'border-white/10',
    borderActive: 'border-emerald-500',
    borderHover: 'border-white/30',
    hoverBorder: 'hover:border-emerald-500',
    text: 'text-emerald-400',
    textMuted: 'text-emerald-400/80',
    textHover: 'hover:text-emerald-400',
    pulse: 'bg-emerald-400',
    iconBg: 'bg-emerald-500/20',
    iconBorder: 'border-emerald-500/50',
  },

  slate: {
    bgActive: 'bg-slate-500/10',
    bgHover: 'bg-white/[0.05]',
    border: 'border-white/10',
    borderActive: 'border-slate-400',
    borderHover: 'border-white/30',
    hoverBorder: 'hover:border-slate-400',
    text: 'text-slate-300',
    textMuted: 'text-slate-300/80',
    textHover: 'hover:text-slate-200',
    pulse: 'bg-slate-300',
    iconBg: 'bg-slate-500/20',
    iconBorder: 'border-slate-400/50',
  },
};
