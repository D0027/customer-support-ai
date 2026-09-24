import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Head from "next/head";
import { motion, useScroll, useTransform } from "framer-motion";
import ThemeToggle from "../components/ThemeToggle";
import SpotlightCard from "../components/SpotlightCard";
import CountUp from "../components/CountUp";

const AGENTS = [
  { name: "Billing", desc: "Payments, invoices, refunds" },
  { name: "Technical", desc: "Login, bugs, installation" },
  { name: "Product", desc: "Features, pricing, comparisons" },
  { name: "Complaint", desc: "Escalation, resolution" },
  { name: "FAQ", desc: "Policies, general questions" },
];

const STATS = [
  { value: "5", label: "Specialized agents" },
  { value: "<2s", label: "Avg. response time" },
  { value: "24/7", label: "Always available" },
  { value: "8", label: "Knowledge base docs" },
];

const STEPS = [
  { n: "01", title: "Ask anything", desc: "Type your question — billing, technical, product, whatever it is." },
  { n: "02", title: "Smart routing", desc: "Intent detection sends it to one or more specialist agents, in parallel." },
  { n: "03", title: "Grounded answer", desc: "RAG pulls real company docs so the answer is accurate, not guessed." },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function Welcome() {
  const router = useRouter();
  const [activeAgent, setActiveAgent] = useState(0);
  const [typedQuery, setTypedQuery] = useState("");
  const QUERIES = [
  "my payment failed but the premium feature is still locked",
  "what is your refund policy for damaged items",
  "how do I reset my TechMart account password",
  "compare TechBook Pro vs TechBook Studio for gaming",
  "this is really frustrating, my order never arrived",
];
const [queryIndex, setQueryIndex] = useState(0);
const fullQuery = QUERIES[queryIndex];
  const indexRef = useRef(0);
  const { scrollY } = useScroll();
  const bgY = useTransform(scrollY, [0, 800], [0, 200]);
  const bgOpacity = useTransform(scrollY, [0, 400], [1, 0.4]);

  

useEffect(() => {
  let timeoutId;

  const typeLoop = () => {
    if (indexRef.current <= fullQuery.length) {
      setTypedQuery(fullQuery.slice(0, indexRef.current));
      indexRef.current += 1;
      timeoutId = setTimeout(typeLoop, 40);
    } else {
      timeoutId = setTimeout(() => {
        setActiveAgent(-1);
        timeoutId = setTimeout(() => {
          indexRef.current = 0;
          setTypedQuery("");
          setQueryIndex((prev) => (prev + 1) % QUERIES.length);
        }, 1800);
      }, 600);
    }
  };

  typeLoop();
  return () => clearTimeout(timeoutId);
}, [queryIndex]);

  useEffect(() => {
  if (typedQuery === "" || typedQuery !== fullQuery) return;
  const activeIndexes = [queryIndex % AGENTS.length, (queryIndex + 1) % AGENTS.length];
  const timer = setTimeout(() => {
    setActiveAgent(activeIndexes[0]);
    setTimeout(() => setActiveAgent(activeIndexes[1]), 700);
  }, 100);
  return () => clearTimeout(timer);
}, [typedQuery, fullQuery, queryIndex]);

  return (
    <>
      <Head>
        <title>TechMart Support — AI that actually routes to the right specialist</title>
      </Head>
      <main className="min-h-screen bg-graphite text-paper overflow-hidden relative aurora-bg">
        <div className="fixed inset-0 noise-overlay pointer-events-none z-0" />

        {/* Parallax animated mesh background */}
        <motion.div
          style={{ y: bgY, opacity: bgOpacity }}
          className="fixed inset-0 pointer-events-none overflow-hidden z-0"
        >
          <div className="mesh-blob-v2 absolute top-[-15%] right-[-8%] w-[650px] h-[650px] rounded-full bg-signal/20 blur-[150px]" />
          <div className="mesh-blob-v2-slow absolute top-[25%] left-[-15%] w-[550px] h-[550px] rounded-full bg-amber/15 blur-[150px]" />
          <div className="mesh-blob-v2-fast absolute bottom-[-20%] right-[15%] w-[500px] h-[500px] rounded-full bg-signalBright/15 blur-[150px]" />
        </motion.div>

        {/* Nav */}
        <motion.nav
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between px-6 md:px-10 py-6 relative z-20 glass-panel sticky top-0 border-b border-line"
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-signalBright status-pulse shadow-glow" />
            <span className="font-display font-semibold text-sm tracking-tight">TechMart Support</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-muted hover:text-paper transition-colors font-mono">
              sign in
            </Link>
            <Link
              href="/register"
              className="text-sm bg-signal hover:bg-signalBright btn-press transition-all px-4 py-2 rounded-lg font-medium"
            >
              Get started
            </Link>
            <ThemeToggle />
          </div>
        </motion.nav>

        {/* Hero */}
        <section className="relative px-6 md:px-10 pt-16 md:pt-24 pb-16 max-w-6xl mx-auto z-10">
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-line bg-panel/50 mb-6 font-mono text-xs text-muted"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-signalBright" />
            5 specialized agents · RAG-grounded · live routing
          </motion.div>

          <motion.h1
            variants={fadeUp} initial="hidden" animate="visible" custom={1}
            className="font-display text-4xl md:text-7xl font-semibold leading-[1.05] mb-6 max-w-3xl"
          >
            One query.<br />
            <span className="text-signalBright">The right specialist</span>, every time.
          </motion.h1>

          <motion.p
            variants={fadeUp} initial="hidden" animate="visible" custom={2}
            className="text-muted text-base md:text-lg max-w-xl mb-10 leading-relaxed"
          >
            No more bouncing between departments. TechMart's assistant reads intent,
            routes to one or more agents in parallel, and answers from real company
            documentation — not guesses.
          </motion.p>

          <motion.div
            variants={fadeUp} initial="hidden" animate="visible" custom={3}
            className="flex items-center gap-4 mb-16"
          >
            <Link
              href="/register"
              className="bg-signal hover:bg-signalBright btn-press hover-lift transition-all px-6 py-3.5 rounded-lg font-medium text-sm"
            >
              Start a conversation
            </Link>
            <Link
              href="/login"
              className="px-6 py-3.5 rounded-lg font-medium text-sm border border-line hover:border-muted btn-press transition-all"
            >
              Sign in
            </Link>
          </motion.div>

          {/* Live demo panel */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="glass-panel border border-line rounded-panel shadow-panel overflow-hidden"
          >
            <div className="px-5 py-3 border-b border-line flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-danger/60" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber/60" />
              <span className="w-2.5 h-2.5 rounded-full bg-signalBright/60" />
              <span className="font-mono text-xs text-muted ml-2">live routing preview</span>
            </div>

            <div className="p-6">
              <div className="font-mono text-sm text-paper mb-6 min-h-[24px]">
                <span className="text-muted">customer:</span> {typedQuery}
                <span className="inline-block w-1.5 h-4 bg-signalBright ml-0.5 align-middle animate-pulse" />
              </div>

              <div className="flex flex-wrap gap-3">
                {AGENTS.map((agent, i) => {
                  const isCurrentlyActive = activeAgent === i;
                  return (
                    <motion.div
                      key={agent.name}
                      animate={isCurrentlyActive ? { scale: 1.05 } : { scale: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className={`px-4 py-3 rounded-lg border transition-colors duration-500 ${
                        isCurrentlyActive
                          ? "border-signalBright bg-signal/10 shadow-glow-lg"
                          : "border-line bg-graphite/50"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-0.5">
                        <span
                          className={`w-1.5 h-1.5 rounded-full transition-colors ${
                            isCurrentlyActive ? "bg-signalBright" : "bg-muted/40"
                          }`}
                        />
                        <span className="font-mono text-xs font-medium">{agent.name}</span>
                      </div>
                      <p className="text-[11px] text-muted">{agent.desc}</p>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: false, margin: "-50px" }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="flex flex-wrap items-center gap-x-8 gap-y-3 mt-10 text-xs font-mono text-muted"
          >
            <span>Trusted patterns from:</span>
            <span className="text-paper/70">RAG retrieval</span>
            <span className="text-line">/</span>
            <span className="text-paper/70">Multi-agent orchestration</span>
            <span className="text-line">/</span>
            <span className="text-paper/70">Sentiment escalation</span>
          </motion.div>
        </section>

        {/* Stats bar */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: false, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="relative px-6 md:px-10 py-10 max-w-5xl mx-auto z-10 border-y border-line"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="text-center md:text-left"
              >
                <p className="font-display text-3xl md:text-4xl font-semibold text-signalBright">
                  <CountUp value={s.value} />
                </p>
                <p className="text-xs text-muted font-mono mt-1">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* How it works */}
        <section className="relative px-6 md:px-10 py-20 max-w-5xl mx-auto z-10">
          <motion.p
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false }}
            className="font-mono text-xs text-signalBright uppercase tracking-wider mb-3"
          >
            How it works
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ delay: 0.1 }}
            className="font-display text-3xl font-semibold mb-12"
          >
            From question to resolution in three steps
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-8">
            {STEPS.map((s, i) => (
              <motion.div
                key={s.n}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, margin: "-60px" }}
                transition={{ delay: i * 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -6 }}
                className="transition-all"
              >
                <span className="font-display text-5xl font-semibold text-line">{s.n}</span>
                <h3 className="font-display font-semibold text-lg mt-3 mb-2">{s.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Feature grid */}
        <section className="px-6 md:px-10 pb-20 max-w-5xl mx-auto relative z-10">
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { eyebrow: "01", title: "RAG-grounded answers", desc: "Every response is retrieved from real company documentation via FAISS — not hallucinated." },
              { eyebrow: "02", title: "Multi-agent routing", desc: "One query can invoke multiple specialists in parallel, then aggregates into one natural reply." },
              { eyebrow: "03", title: "Sentiment-aware escalation", desc: "Frustrated customers are detected automatically and routed to a human agent with a ticket." },
            ].map((f, i) => (
              <motion.div
                key={f.eyebrow}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, margin: "-60px" }}
                transition={{ delay: i * 0.12, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                
              >
                <SpotlightCard className="bg-panel border border-line rounded-panel p-6 hover:border-signal/40">
                <span className="font-mono text-xs text-signalBright">{f.eyebrow}</span>
                <h3 className="font-display font-semibold text-lg mt-3 mb-2">{f.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{f.desc}</p>
                </SpotlightCard>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA band */}
        <motion.section
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: false, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative px-6 md:px-10 py-20 z-10"
        >
          <div className="max-w-3xl mx-auto text-center glass-panel border border-line rounded-panel p-12">
            <h2 className="font-display text-3xl font-semibold mb-4">Ready to see it in action?</h2>
            <p className="text-muted text-sm mb-8 max-w-md mx-auto">
              Create an account and ask your first question — you'll see the routing happen in real time.
            </p>
            <Link
              href="/register"
              className="inline-block bg-signal hover:bg-signalBright btn-press hover-lift transition-all px-8 py-3.5 rounded-lg font-medium text-sm"
            >
              Get started free
            </Link>
          </div>
        </motion.section>

        {/* Footer */}
        <footer className="relative px-6 md:px-10 py-8 border-t border-line z-10">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
            <span className="font-mono text-xs text-muted">© 2026 TechMart Electronics · Support Console</span>
            <div className="flex items-center gap-4 text-xs text-muted font-mono">
              <span>billing</span><span>·</span><span>technical</span><span>·</span>
              <span>product</span><span>·</span><span>complaint</span><span>·</span><span>faq</span>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}