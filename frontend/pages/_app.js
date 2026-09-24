import "../styles/globals.css";
import { LanguageProvider } from "../context/LanguageContext";
import { PersonaProvider } from "../context/PersonaContext";
import ErrorBoundary from "../components/ErrorBoundary";

export default function App({ Component, pageProps }) {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <PersonaProvider>
          <Component {...pageProps} />
        </PersonaProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}