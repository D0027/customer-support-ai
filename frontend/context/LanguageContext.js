import { createContext, useContext, useEffect, useState, useCallback } from "react";

export const TRANSLATIONS = {
  en: {
    signIn: "Sign in", createAccount: "Create account", noAccount: "No account?",
    haveAccount: "Already have an account?", register: "Create one", fullName: "Full name",
    email: "Email", password: "Password", signingIn: "Signing in", creatingAccount: "Creating account",
    welcomeConsole: "TechMart Support · Console", accessConsole: "Access your support console",
    setupAccess: "Set up your support console access", newConversation: "+ New conversation",
    recent: "Recent", noConversations: "No conversations yet",
    askPlaceholder: "Describe your issue — billing, technical, product…",
    askAboutImage: "Ask something about this image…", listening: "Listening…", send: "Send",
    logout: "logout", wasHelpful: "Was this helpful?",
    emptyChat: "Ask about an order, a bill, a bug, or anything else — I'll route it to the right specialist.",
    startConversation: "Start a conversation", getStarted: "Get started", oneQuery: "One query.",
    rightSpecialist: "The right specialist", everyTime: ", every time.",
  },
  hi: {
    signIn: "साइन इन करें", createAccount: "खाता बनाएं", noAccount: "खाता नहीं है?",
    haveAccount: "पहले से खाता है?", register: "बनाएं", fullName: "पूरा नाम",
    email: "ईमेल", password: "पासवर्ड", signingIn: "साइन इन हो रहा है", creatingAccount: "खाता बन रहा है",
    welcomeConsole: "टेकमार्ट सपोर्ट · कंसोल", accessConsole: "अपने सपोर्ट कंसोल में जाएं",
    setupAccess: "अपना सपोर्ट कंसोल एक्सेस सेट करें", newConversation: "+ नई बातचीत",
    recent: "हाल की", noConversations: "अभी तक कोई बातचीत नहीं",
    askPlaceholder: "अपनी समस्या बताएं — बिलिंग, तकनीकी, उत्पाद…",
    askAboutImage: "इस इमेज के बारे में कुछ पूछें…", listening: "सुन रहा है…", send: "भेजें",
    logout: "लॉगआउट", wasHelpful: "क्या यह मददगार था?",
    emptyChat: "किसी ऑर्डर, बिल, बग या किसी और चीज़ के बारे में पूछें — मैं सही विशेषज्ञ को भेज दूंगा।",
    startConversation: "बातचीत शुरू करें", getStarted: "शुरू करें", oneQuery: "एक सवाल।",
    rightSpecialist: "सही विशेषज्ञ", everyTime: ", हर बार।",
  },
};

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState("en");

  useEffect(() => {
    const saved = localStorage.getItem("lang") || "en";
    setLang(saved);
  }, []);

  const toggleLang = useCallback(() => {
    setLang((prev) => {
      const next = prev === "en" ? "hi" : "en";
      localStorage.setItem("lang", next);
      return next;
    });
  }, []);

  const t = useCallback((key) => TRANSLATIONS[lang]?.[key] || TRANSLATIONS.en[key] || key, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}