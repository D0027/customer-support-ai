import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { getMe, updateMe } from "../services/api";
import { useLanguage } from "../context/LanguageContext";
import ThemeToggle from "../components/ThemeToggle";
import HomeButton from "../components/HomeButton";

export default function Profile() {
  const router = useRouter();
  const { t } = useLanguage();
  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.replace("/login");
      return;
    }
    getMe()
      .then((data) => {
        setUser(data);
        setName(data.name);
      })
      .catch(() => router.replace("/login"));
  }, [router]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await updateMe(name);
      setUser(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      // fail silently
    } finally {
      setSaving(false);
    }
  };

  const initials = (name || "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (!user) {
    return (
      <main className="min-h-screen bg-graphite flex items-center justify-center">
        <p className="text-muted text-sm font-mono">Loading…</p>
      </main>
    );
  }

  return (
    <>
      <Head>
        <title>Profile — TechMart Support</title>
      </Head>
      <main className="min-h-screen bg-graphite grid-texture flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => router.push("/")}
              className="text-xs text-muted hover:text-paper transition-colors font-mono"
            >
              ← back to chat
            </button>
            <ThemeToggle />
          </div>

          <div className="bg-panel border border-line rounded-panel shadow-panel p-6">
            <div className="flex flex-col items-center mb-6">
              <div className="w-16 h-16 rounded-full bg-signal/20 border border-signal/40 flex items-center justify-center text-xl font-display font-semibold text-signalBright mb-3">
                {initials}
              </div>
              <p className="text-xs text-muted font-mono">{user.email}</p>
            </div>

            <form onSubmit={handleSave}>
              <label className="block text-xs font-mono uppercase tracking-wider text-muted mb-2">
                Full name
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full mb-4 px-3.5 py-2.5 rounded-lg bg-graphite border border-line text-paper text-sm outline-none focus:border-signalBright focus:shadow-glow transition-all"
                required
              />

              <label className="block text-xs font-mono uppercase tracking-wider text-muted mb-2">
                Member since
              </label>
              <p className="text-sm text-paper mb-6 font-mono">
                {new Date(user.created_at).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>

              <button
                type="submit"
                disabled={saving || name === user.name}
                className="w-full py-3 rounded-lg bg-signal hover:bg-signalBright text-paper font-medium text-sm transition-colors disabled:opacity-40"
              >
                {saving ? "Saving…" : saved ? "✓ Saved" : "Save changes"}
              </button>
            </form>
          </div>
        </div>
      </main>
      <HomeButton />
    </>
  );
}