import { useCallback, useEffect, useState } from "react";

type Theme = "light" | "dark";

function systemTheme(): Theme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = document.documentElement.dataset.theme;
    return stored === "light" || stored === "dark" ? stored : systemTheme();
  });

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    function onChange() {
      if (!document.documentElement.dataset.theme) setTheme(systemTheme());
    }
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  const toggle = useCallback(() => {
    setTheme((current) => {
      const next: Theme = current === "dark" ? "light" : "dark";
      document.documentElement.dataset.theme = next;
      try {
        window.localStorage.setItem("notes:theme", next);
      } catch {
        return next;
      }
      return next;
    });
  }, []);

  return { theme, toggle };
}
