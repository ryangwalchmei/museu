import { createContext, useContext, useState, type ReactNode } from "react";

interface ThemeContextValue {
  light: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) throw new Error("useTheme must be used within ThemeProvider.");

  return context;
}

export default function ThemeProvider({ children }: { children: ReactNode }) {
  const [light, setLight] = useState(true);

  return (
    <ThemeContext.Provider
      value={{ light, toggleTheme: () => setLight((current) => !current) }}
    >
      {children}
    </ThemeContext.Provider>
  );
}
