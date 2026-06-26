import {
  getCurrentTitleLanguage,
  setTitleLanguage as setModuleTitleLanguage,
  TitleLanguage,
} from "@/utils/data";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

interface SettingsContextValue {
  /** Language used for media titles/descriptions app-wide. Defaults to English. */
  titleLanguage: TitleLanguage;
  setTitleLanguage: (lang: TitleLanguage) => void;
  toggleTitleLanguage: () => void;
}

const SettingsContext = createContext<SettingsContextValue>({
  titleLanguage: "english",
  setTitleLanguage: () => undefined,
  toggleTitleLanguage: () => undefined,
});

const LOCAL_STORAGE_KEY = "exotv:settings";

export const SettingsContextProvider: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => {
  // Always start from the English default so the server render and the first
  // client render match (no hydration mismatch). The saved value is applied in
  // an effect after mount.
  const [titleLanguage, setTitleLanguageState] = useState<TitleLanguage>(
    getCurrentTitleLanguage()
  );

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      const saved = raw
        ? (JSON.parse(raw) as { titleLanguage?: TitleLanguage })
        : null;
      if (saved?.titleLanguage && saved.titleLanguage !== titleLanguage) {
        setModuleTitleLanguage(saved.titleLanguage);
        setTitleLanguageState(saved.titleLanguage);
      }
    } catch {
      /* ignore malformed storage */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setTitleLanguage = useCallback((lang: TitleLanguage) => {
    setModuleTitleLanguage(lang); // drives getTitle/getDescription
    setTitleLanguageState(lang);
    try {
      localStorage.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify({ titleLanguage: lang })
      );
    } catch {
      /* ignore */
    }
  }, []);

  const toggleTitleLanguage = useCallback(() => {
    setTitleLanguage(titleLanguage === "english" ? "native" : "english");
  }, [titleLanguage, setTitleLanguage]);

  return (
    <SettingsContext.Provider
      value={{ titleLanguage, setTitleLanguage, toggleTitleLanguage }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
