import { useState } from "react";
import Link from "next/link";
import Head from "next/head";
import { forgotPassword } from "../services/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await forgotPassword(email);
      setSent(true);
    } catch (err) {
      setSent(true); // still show success to avoid leaking account existence
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Reset password — TechMart Support</title>
      </Head>
      <main className="min-h-screen bg-graphite grid-texture flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-panel border border-line rounded-panel shadow-panel p-7">
          {sent ? (
            <>
              <div className="text-2xl mb-3">📧</div>
              <h1 className="font-display text-xl font-semibold text-paper mb-2">Check your email</h1>
              <p className="text-sm text-muted mb-6">
                If an account exists for {email}, we've sent a password reset link. It expires in 30 minutes.
              </p>
              <Link href="/login" className="text-signalBright text-sm font-medium hover:underline">
                Back to sign in
              </Link>
            </>
          ) : (
            <form onSubmit={submit}>
              <h1 className="font-display text-xl font-semibold text-paper mb-1">Reset password</h1>
              <p className="text-sm text-muted mb-6">Enter your email and we'll send you a reset link</p>

              <label className="block text-xs font-mono uppercase tracking-wider text-muted mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full mb-6 px-3.5 py-2.5 rounded-lg bg-graphite border border-line text-paper text-sm outline-none focus:border-signalBright focus:shadow-glow transition-all"
                required
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg bg-signal hover:bg-signalBright text-paper font-medium text-sm transition-colors disabled:opacity-50"
              >
                {loading ? "Sending…" : "Send reset link"}
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