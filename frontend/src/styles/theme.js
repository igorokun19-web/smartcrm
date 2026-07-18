/**
 * Design System & Theme Configuration
 * Global color palette, spacing, typography, and semantic tokens
 */

export const colors = {
  // Primary Brand
  primary: {
    50: "#f0f7ff",
    100: "#e0effe",
    200: "#c7e0fd",
    300: "#a4cafe",
    400: "#7bb5fc",
    500: "#4a90e2",
    600: "#3578d1",
    700: "#2563b8",
    800: "#1e4c95",
    900: "#1a3a73",
  },

  // Status Colors
  success: {
    50: "#f0fdf4",
    100: "#dcfce7",
    200: "#bbf7d0",
    300: "#86efac",
    400: "#4ade80",
    500: "#22c55e",
    600: "#16a34a",
    700: "#15803d",
    800: "#166534",
    900: "#145231",
  },

  warning: {
    50: "#fffbeb",
    100: "#fef3c7",
    200: "#fde68a",
    300: "#fcd34d",
    400: "#fbbf24",
    500: "#f59e0b",
    600: "#d97706",
    700: "#b45309",
    800: "#92400e",
    900: "#78350f",
  },

  danger: {
    50: "#fef2f2",
    100: "#fee2e2",
    200: "#fecaca",
    300: "#fca5a5",
    400: "#f87171",
    500: "#ef4444",
    600: "#dc2626",
    700: "#b91c1c",
    800: "#991b1b",
    900: "#7f1d1d",
  },

  info: {
    50: "#eff6ff",
    100: "#dbeafe",
    200: "#bfdbfe",
    300: "#93c5fd",
    400: "#60a5fa",
    500: "#3b82f6",
    600: "#2563eb",
    700: "#1d4ed8",
    800: "#1e40af",
    900: "#1e3a8a",
  },

  // Neutral (Grayscale)
  neutral: {
    0: "#ffffff",
    50: "#f9fafb",
    100: "#f3f4f6",
    200: "#e5e7eb",
    300: "#d1d5db",
    400: "#9ca3af",
    500: "#6b7280",
    600: "#4b5563",
    700: "#374151",
    800: "#1f2937",
    900: "#111827",
  },

  // Semantic
  text: {
    primary: "#111827",
    secondary: "#6b7280",
    tertiary: "#9ca3af",
    inverted: "#ffffff",
  },

  background: {
    primary: "#ffffff",
    secondary: "#f9fafb",
    tertiary: "#f3f4f6",
  },

  border: {
    light: "#e5e7eb",
    medium: "#d1d5db",
    dark: "#9ca3af",
  },

  // Lead Status Colors
  leadStatus: {
    New: "#3b82f6",        // Blue
    Contacted: "#8b5cf6",  // Purple
    Quoted: "#ec4899",     // Pink
    Won: "#10b981",        // Green
    Lost: "#ef4444",       // Red
  },

  // Priority Colors
  priority: {
    High: "#dc2626",       // Red
    Medium: "#f59e0b",     // Amber
    Low: "#10b981",        // Green
  },
};

export const spacing = {
  xs: "0.25rem",   // 4px
  sm: "0.5rem",    // 8px
  md: "1rem",      // 16px
  lg: "1.5rem",    // 24px
  xl: "2rem",      // 32px
  "2xl": "2.5rem", // 40px
  "3xl": "3rem",   // 48px
  "4xl": "4rem",   // 64px
};

export const radius = {
  sm: "0.375rem",  // 6px
  md: "0.5rem",    // 8px
  lg: "0.75rem",   // 12px
  xl: "1rem",      // 16px
  "2xl": "1.5rem", // 24px
  full: "9999px",
};

export const typography = {
  h1: {
    fontSize: "2rem",      // 32px
    fontWeight: "700",
    lineHeight: "2.5rem",  // 40px
    letterSpacing: "-0.02em",
  },
  h2: {
    fontSize: "1.5rem",    // 24px
    fontWeight: "700",
    lineHeight: "2rem",    // 32px
    letterSpacing: "-0.01em",
  },
  h3: {
    fontSize: "1.25rem",   // 20px
    fontWeight: "600",
    lineHeight: "1.75rem", // 28px
  },
  h4: {
    fontSize: "1.125rem",  // 18px
    fontWeight: "600",
    lineHeight: "1.5rem",  // 24px
  },
  body: {
    fontSize: "1rem",      // 16px
    fontWeight: "400",
    lineHeight: "1.5rem",  // 24px
  },
  small: {
    fontSize: "0.875rem",  // 14px
    fontWeight: "400",
    lineHeight: "1.25rem", // 20px
  },
  tiny: {
    fontSize: "0.75rem",   // 12px
    fontWeight: "400",
    lineHeight: "1rem",    // 16px
  },
};

export const shadows = {
  sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
  md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
  lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
  "2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)",
};

export const transitions = {
  fast: "150ms ease-in-out",
  base: "200ms ease-in-out",
  slow: "300ms ease-in-out",
};

export const breakpoints = {
  xs: "320px",
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
};

export const z = {
  hide: "-1",
  base: "0",
  dropdown: "1000",
  sticky: "1020",
  fixed: "1030",
  modal: "1040",
  popover: "1050",
  tooltip: "1060",
};

/**
 * Component-specific style presets
 */
export const components = {
  button: {
    base: "inline-flex items-center justify-center font-semibold rounded-lg transition",
    sizes: {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2 text-base",
      lg: "px-6 py-3 text-lg",
    },
    variants: {
      primary: "bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50",
      secondary: "bg-neutral-100 text-neutral-900 hover:bg-neutral-200 disabled:opacity-50",
      danger: "bg-red-600 text-white hover:bg-red-700 disabled:opacity-50",
      success: "bg-green-600 text-white hover:bg-green-700 disabled:opacity-50",
      outline: "border-2 border-blue-600 text-blue-600 hover:bg-blue-50 disabled:opacity-50",
      ghost: "text-blue-600 hover:bg-blue-50 disabled:opacity-50",
    },
  },

  card: {
    base: "bg-white rounded-xl border border-neutral-200 shadow-sm p-6 transition",
    hover: "hover:shadow-md",
  },

  input: {
    base: "w-full px-4 py-2 rounded-lg border border-neutral-300 bg-white text-neutral-900 placeholder-neutral-400 transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-neutral-100 disabled:opacity-50",
  },

  badge: {
    base: "inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold",
    variants: {
      primary: "bg-blue-100 text-blue-700",
      success: "bg-green-100 text-green-700",
      warning: "bg-yellow-100 text-yellow-700",
      danger: "bg-red-100 text-red-700",
      neutral: "bg-neutral-100 text-neutral-700",
    },
  },

  table: {
    header: "bg-neutral-50 border-b border-neutral-200 font-semibold text-neutral-700",
    row: "border-b border-neutral-200 hover:bg-neutral-50 transition",
    cell: "px-6 py-4 text-neutral-900",
  },

  modal: {
    backdrop: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-modal",
    container: "bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4",
  },
};

export const theme = {
  colors,
  spacing,
  radius,
  typography,
  shadows,
  transitions,
  breakpoints,
  z,
  components,
};

export default theme;
