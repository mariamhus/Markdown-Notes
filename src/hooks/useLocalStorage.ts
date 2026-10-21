import { useEffect, useState } from "react";

export function useLocalStorage<T>(key: string, initialValue: T, isValid: (value: unknown) => value is T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = window.localStorage.getItem(key);
      const parsed: unknown = stored === null ? null : JSON.parse(stored);
      return isValid(parsed) ? parsed : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      return;
    }
  }, [key, value]);

  return [value, setValue] as const;
}
