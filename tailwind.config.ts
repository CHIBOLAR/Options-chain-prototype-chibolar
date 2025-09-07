import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Trading platform specific colors
        nse: {
          DEFAULT: "hsl(var(--nse-primary))",
          foreground: "hsl(var(--nse-primary-foreground))",
        },
        profit: {
          DEFAULT: "hsl(var(--profit))",
          foreground: "hsl(var(--profit-foreground))",
        },
        loss: {
          DEFAULT: "hsl(var(--loss))",
          foreground: "hsl(var(--loss-foreground))",
        },
        call: {
          DEFAULT: "hsl(var(--call-option))",
          light: "hsl(var(--call-option-light))",
        },
        put: {
          DEFAULT: "hsl(var(--put-option))",
          light: "hsl(var(--put-option-light))",
        },
        atm: {
          DEFAULT: "hsl(var(--atm-highlight))",
          light: "hsl(var(--atm-highlight-light))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        "flash-green": {
          "0%": { backgroundColor: "hsl(var(--profit) / 0.2)", boxShadow: "var(--flash-green)" },
          "100%": { backgroundColor: "transparent", boxShadow: "none" },
        },
        "flash-red": {
          "0%": { backgroundColor: "hsl(var(--loss) / 0.2)", boxShadow: "var(--flash-red)" },
          "100%": { backgroundColor: "transparent", boxShadow: "none" },
        },
        "pulse-profit": {
          "0%, 100%": { backgroundColor: "hsl(var(--profit) / 0.1)" },
          "50%": { backgroundColor: "hsl(var(--profit) / 0.2)" },
        },
        "pulse-loss": {
          "0%, 100%": { backgroundColor: "hsl(var(--loss) / 0.1)" },
          "50%": { backgroundColor: "hsl(var(--loss) / 0.2)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "flash-green": "flash-green 0.5s ease-out",
        "flash-red": "flash-red 0.5s ease-out",
        "pulse-profit": "pulse-profit 2s infinite",
        "pulse-loss": "pulse-loss 2s infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
