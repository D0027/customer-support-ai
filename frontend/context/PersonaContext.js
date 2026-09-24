import { createContext, useContext, useEffect, useState, useCallback } from "react";

const PersonaContext = createContext(null);

export function PersonaProvider({ children }) {
  const [personaName, setPersonaName] = useState("TechMart Support");

  useEffect(() => {
    const saved = localStorage.getItem("persona_name");
    if (saved) setPersonaName(saved);
  }, []);

  const updatePersonaName = useCallback((name) => {
    const trimmed = name.trim() || "TechMart Support";
    setPersonaName(trimmed);
    localStorage.setItem("persona_name", trimmed);
  }, []);

  const resetPersonaName = useCallback(() => {
    setPersonaName("TechMart Support");
    localStorage.removeItem("persona_name");
  }, []);

  return (
    <PersonaContext.Provider value={{ personaName, updatePersonaName, resetPersonaName }}>
      {children}
    </PersonaContext.Provider>
  );
}

export function usePersona() {
  const ctx = useContext(PersonaContext);
  if (!ctx) throw new Error("usePersona must be used within PersonaProvider");
  return ctx;
}