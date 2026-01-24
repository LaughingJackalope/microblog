import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {// Foundation
        canvas: "var(--canvas)",
        surface: "var(--surface)",
        ink: {
          DEFAULT: "var(--ink)",
          muted: "var(--ink-muted)",
          whisper: "var(--ink-whisper)",
        },

        // Brand colors (full scale)
        primary: {
          50: "var(--primary-50)",
          100: "var(--primary-100)",
          200: "var(--primary-200)",
          300: "var(--primary-300)",
          400: "var(--primary-400)",
          500: "var(--primary-500)",
          600: "var(--primary-600)",
          700: "var(--primary-700)",
          800: "var(--primary-800)",
          900: "var(--primary-900)",
        },
        accent: {
          50: "var(--accent-50)",
          100: "var(--accent-100)",
          200: "var(--accent-200)",
          300: "var(--accent-300)",
          400: "var(--accent-400)",
          500: "var(--accent-500)",
          600: "var(--accent-600)",
          700: "var(--accent-700)",
          800: "var(--accent-800)",
          900: "var(--accent-900)",
        },
        success: {
          50: "var(--success-50)",
          100: "var(--success-100)",
          400: "var(--success-400)",
          500: "var(--success-500)",
          600: "var(--success-600)",
          700: "var(--success-700)",
        },
        warning: {
          50: "var(--warning-50)",
          100: "var(--warning-100)",
          400: "var(--warning-400)",
          500: "var(--warning-500)",
          600: "var(--warning-600)",
          700: "var(--warning-700)",
        },
        danger: {
          50: "var(--danger-50)",
          100: "var(--danger-100)",
          400: "var(--danger-400)",
          500: "var(--danger-500)",
          600: "var(--danger-600)",
          700: "var(--danger-700)",
        },
        info: {
          50: "var(--info-50)",
          100: "var(--info-100)",
          400: "var(--info-400)",
          500: "var(--info-500)",
          600: "var(--info-600)",
          700: "var(--info-700)",
        },

        // Semantic shortcuts
        action: {
          DEFAULT: "var(--action)",
          hover: "var(--action-hover)",
          muted: "var(--action-muted)",
        },
        highlight: {
          DEFAULT: "var(--highlight)",
          hover: "var(--highlight-hover)",
          subtle: "var(--highlight-subtle)",
        },

        // Borders
        border: {
          DEFAULT: "var(--border)",
          muted: "var(--border-muted)",
          emphasis: "var(--border-emphasis)",
        },
      },

      spacing: {
        tight: "var(--space-tight)",
        snug: "var(--space-snug)",
        comfortable: "var(--space-comfortable)",
        relaxed: "var(--space-relaxed)",
        spacious: "var(--space-spacious)",
        luxurious: "var(--space-luxurious)",
      },

      borderRadius: {
        tight: "var(--radius-tight)",
        comfortable: "var(--radius-comfortable)",
        relaxed: "var(--radius-relaxed)",
        round: "var(--radius-round)",
      },

      boxShadow: {
        subtle: "var(--shadow-subtle)",
        soft: "var(--shadow-soft)",
        medium: "var(--shadow-medium)",
        lifted: "var(--shadow-lifted)",
        floating: "var(--shadow-floating)",
      },

      fontSize: {
        display: ["var(--text-display)", { lineHeight: "var(--text-display-line)" }],
        h1: ["var(--text-h1)", { lineHeight: "var(--text-h1-line)" }],
        h2: ["var(--text-h2)", { lineHeight: "var(--text-h2-line)" }],
        h3: ["var(--text-h3)", { lineHeight: "var(--text-h3-line)" }],
        h4: ["var(--text-h4)", { lineHeight: "var(--text-h4-line)" }],
        "body-lg": ["var(--text-body-lg)", { lineHeight: "var(--text-body-lg-line)" }],
        body: ["var(--text-body)", { lineHeight: "var(--text-body-line)" }],
        "body-sm": ["var(--text-body-sm)", { lineHeight: "var(--text-body-sm-line)" }],
        caption: ["var(--text-caption)", { lineHeight: "var(--text-caption-line)" }],
      },

      fontWeight: {
        normal: "var(--weight-normal)",
        medium: "var(--weight-medium)",
        semibold: "var(--weight-semibold)",
        bold: "var(--weight-bold)",
        black: "var(--weight-black)",
      },

      transitionDuration: {
        fast: "var(--motion-fast)",
        base: "var(--motion-base)",
        slow: "var(--motion-slow)",
        slower: "var(--motion-slower)",
      },

      transitionTimingFunction: {
        "in-out": "var(--ease-in-out)",
        out: "var(--ease-out)",
        in: "var(--ease-in)",
        bounce: "var(--ease-bounce)",
      },

      zIndex: {
        base: "var(--z-base)",
        dropdown: "var(--z-dropdown)",
        sticky: "var(--z-sticky)",
        fixed: "var(--z-fixed)",
        "modal-backdrop": "var(--z-modal-backdrop)",
        modal: "var(--z-modal)",
        popover: "var(--z-popover)",
        tooltip: "var(--z-tooltip)",
      },
    },
  },
  plugins: [],
} satisfies Config;
