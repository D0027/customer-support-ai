import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Head from "next/head";
import { resetPassword } from "../services/api";

export default function ResetPassword() {
  const router = useRouter();
  const { token } = router.query;
  const [password, setPassword] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await resetPassword(token, password);
      setDone(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch (err) {
      setError(err?.response?.data?.detail || "This reset link is invalid or expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Set new password — TechMart Support</title>
      </Head>
      <main className="min-h-screen bg-graphite grid-texture flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-panel border border-line rounded-panel shadow-panel p-7">
          {done ? (
            <>
              <div className="text-2xl mb-3">✓</div>
              <h1 className="font-display text-xl font-semibold text-paper mb-2">Password updated</h1>
              <p className="text-sm text-muted">Redirecting you to sign in…</p>
            </>
          ) : (
            <form onSubmit={submit}>
              <h1 className="font-display text-xl font-semibold text-paper mb-1">Set new password</h1>
              <p className="text-sm text-muted mb-6">Choose a new password for your account</p>

              {error && (
                <div className="mb-5 px-3 py-2.5 rounded-lg bg-danger/10 border border-danger/30 text-danger text-xs font-mono">
                  {error}
                </div>
              )}

              <label className="block text-xs font-mono uppercase tracking-wider text-muted mb-2">New password</label>
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
                disabled={loading || !token}
                className="w-full py-3 rounded-lg bg-signal hover:bg-signalBright text-paper font-medium text-sm transition-colors disabled:opacity-50"
              >
                {loading ? "Updating…" : "Update password"}
              </button>

              <p className="text-xs text-muted mt-6 text-center">
                <Link href="/login" className="text-signalBright font-medium hover:underline">
                  Back to sign in
                </Link>
              </p>
            </form>
          )}
        </div>
      </main>
    </>
  );
}