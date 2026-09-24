import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Head from "next/head";
import { registerUser } from "../services/api";
import ThemeToggle from "../components/ThemeToggle";
import HomeButton from "../components/HomeButton";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await registerUser(name, email, password);
      localStorage.setItem("access_token", data.access_token);
      router.push("/");
    } catch (err) {
      setError(err?.response?.data?.detail || "Registration failed. Try a different email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Create account — TechMart Support</title>
      </Head>
      <main className="min-h-screen bg-graphite grid-texture flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-amber/10 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-signal/10 blur-3xl" />

        <div className="w-full max-w-sm relative">
          <div className="absolute top-4 right-4">
            <ThemeToggle />
          </div>
          <div className="flex items-center gap-2 mb-8 justify-center">
            <span className="w-2 h-2 rounded-full bg-amber status-pulse" />
            <span className="font-mono text-xs tracking-widest text-muted uppercase">TechMart Support · Console</span>
          </div>

          <form onSubmit={submit} className="bg-panel border border-line rounded-panel shadow-panel p-7">
            <h1 className="font-display text-2xl font-semibold text-paper mb-1">Create account</h1>
            <p className="text-sm text-muted mb-6">Set up your support console access</p>

            {error && (
              <div className="mb-5 px-3 py-2.5 rounded-lg bg-danger/10 border border-danger/30 text-danger text-xs font-mono">
                {error}
              </div>
            )}

            <label className="block text-xs font-mono uppercase tracking-wider text-muted mb-2">Full name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full mb-4 px-3.5 py-2.5 rounded-lg bg-graphite border border-line text-paper text-sm outline-none focus:border-signalBright focus:shadow-glow transition-all"
              required
            />

            <label className="block text-xs font-mono uppercase tracking-wider text-muted mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mb-4 px-3.5 py-2.5 rounded-lg bg-graphite border border-line text-paper text-sm outline-none focus:border-signalBright focus:shadow-glow transition-all"
              required
            />

            <label className="block text-xs font-mono uppercase tracking-wider text-muted mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              className="w-full mb-6 px-3.5 py-2.5 rounded-lg bg-graphite border border-line text-paper text-sm outline-none focus:border-signalBright focus:shadow-glow transition-all"
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-amber hover:brightness-110 text-graphite font-semibold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-graphite/30 border-t-graphite rounded-full animate-spin" />
                  Creating account
                </>
              ) : (
                "Create account"
              )}
            </button>

            <p className="text-xs text-muted mt-6 text-center">
              Already have an account? <Link href="/login" className="text-signalBright font-medium hover:underline">Sign in</Link>
            </p>
          </form>
        </div>
      </main>
      <HomeButton />
    </>
  );
}