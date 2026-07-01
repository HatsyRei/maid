import AsyncStorage from "@react-native-async-storage/async-storage";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

function normalizeString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const v = value.trim();
  return v.length ? v : undefined;
}

function useSyncedString(
  options: { key: string, defaultValue: string }
): [string | undefined, Dispatch<SetStateAction<string | undefined>>] {
  const { key, defaultValue } = options;

  const [value, setValue] = useState<string | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const stored = await AsyncStorage.getItem(key);
        if (cancelled) return;
        setValue(normalizeString(stored) ?? defaultValue);
      } catch (e) {
        console.error(`Error loading ${key}:`, e);
        if (!cancelled) {
          setValue(defaultValue);
        }
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [key, defaultValue]);

  useEffect(() => {
    if (value === undefined) {
      return;
    }

    const persist = async () => {
      try {
        if (value && value !== defaultValue) {
          await AsyncStorage.setItem(key, value);
        } else {
          await AsyncStorage.removeItem(key);
        }
      } catch (e) {
        console.error(`Error saving ${key}:`, e);
      }
    };

    persist();
  }, [value, key, defaultValue]);

  return [value, setValue];
}

export default useSyncedString;
