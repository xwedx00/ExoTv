import en from "@/locales/en.json";
import React from "react";

/**
 * English-only i18n shim. Replaces next-i18next after the app was made
 * single-language. Keeps every former `useTranslation()/t()` and
 * `appWithTranslation` call-site working, backed by the bundled English
 * dictionary in `src/locales/en.json` (one object per former namespace).
 */
type Namespaced = Record<string, Record<string, string>>;
const dict = en as unknown as Namespaced;

function interpolate(str: string, opts?: Record<string, unknown>): string {
  if (!opts) return str;
  return str.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key: string) =>
    opts[key] != null ? String(opts[key]) : ""
  );
}

export function useTranslation(ns: string | string[] = "common") {
  const namespace = Array.isArray(ns) ? ns[0] : ns;
  const t = (key: string, opts?: Record<string, unknown>): string => {
    // Support namespace-prefixed keys like "common:search" — strip the "ns:"
    // prefix and resolve against that namespace (next-i18next syntax).
    const sep = key.indexOf(":");
    const keyNs = sep === -1 ? namespace : key.slice(0, sep);
    const realKey = sep === -1 ? key : key.slice(sep + 1);
    const value =
      dict[keyNs]?.[realKey] ??
      dict[namespace]?.[realKey] ??
      dict.common?.[realKey] ??
      realKey;
    return interpolate(value, opts);
  };
  const i18n = { language: "en", changeLanguage: async () => undefined };
  // react-i18next's return works as BOTH an array `[t, i18n]` and an object
  // `{ t, i18n }`; mirror that so either destructuring style compiles + runs.
  const result: any = [t, i18n];
  result.t = t;
  result.i18n = i18n;
  return result as [typeof t, typeof i18n] & { t: typeof t; i18n: typeof i18n };
}

/** no-op: app is English-only, so the HOC just passes the App through. */
export const appWithTranslation = <P,>(App: P): P => App;

/** no-op: there are no server-side translations to load anymore. */
export const serverSideTranslations = async () => ({});

export const Trans: React.FC<{
  i18nKey?: string;
  children?: React.ReactNode;
}> = ({ i18nKey, children }) => <>{children ?? i18nKey ?? null}</>;

export default useTranslation;
