import Link from "next/link";

export default function HomeButton() {
  return (
    <Link
      href="/welcome"
      className="fixed top-4 left-4 z-50 flex items-center gap-1.5 px-3 py-2 rounded-lg glass-panel border border-line hover:border-signalBright text-xs font-mono text-muted hover:text-paper transition-all"
    >
      ← Home
    </Link>
  );
}