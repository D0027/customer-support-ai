import { useLanguage } from "../context/LanguageContext";

export default function LanguageToggle() {
  const { lang, toggleLang } = useLanguage();

  return (
    <button
      onClick={toggleLang}
      className="px-2.5 h-8 rounded-lg border border-line hover:border-signalBright transition-colors text-xs font-mono text-muted hover:text-paper"
      title="Toggle language"
    >
      {lang === "en" ? "EN" : "हि"}
    </button>
  );
}