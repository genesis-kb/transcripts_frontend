import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Search, Brain, Shield, Zap, Library } from "lucide-react";

const pillars = [
  { icon: BookOpen, title: "Comprehensive Archive", desc: "Thousands of transcripts from Bitcoin conferences, podcasts, and technical presentations — the largest curated Bitcoin knowledge base available." },
  { icon: Search, title: "Intelligent Search", desc: "Find exactly what you need across the entire archive. Search by topic, speaker, conference, or concept to surface relevant knowledge instantly." },
  { icon: Brain, title: "AI-Powered Insights", desc: "Ask questions and get grounded answers drawn directly from real Bitcoin discussions. Our RAG chat retrieves source material so you can verify every claim." },
  { icon: Shield, title: "Verified & Accurate", desc: "Every transcript goes through AI generation and quality checks, ensuring technical accuracy and faithfulness to the original source." },
  { icon: Zap, title: "Always Growing", desc: "New conferences, podcasts, and talks are continuously indexed and transcribed, keeping the knowledge base current with the latest Bitcoin developments." },
  { icon: Library, title: "Open & Accessible", desc: "All transcripts are freely available. Whether you're a beginner or a protocol developer, the archive is built to serve every level of understanding." },
];

const stats = [
  { value: "6,000+", label: "Transcripts" },
  { value: "500+", label: "Speakers" },
  { value: "100+", label: "Conferences" },
  { value: "10+", label: "Years of History" },
];

const About = () => {
  return (
    <div>
      {/* Hero section */}
      <section className="relative py-20 border-b border-border bg-secondary/30 overflow-hidden">
        <div className="absolute inset-0 scanline pointer-events-none" />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-primary font-mono text-xs uppercase tracking-[0.2em] mb-6"
          >
            The Bitcoin Knowledge Source
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="font-display text-4xl sm:text-5xl font-bold mb-4"
          >
            Every Bitcoin Idea,<br />Preserved & Searchable
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto"
          >
            Bitscribe is the definitive open archive of Bitcoin technical knowledge — capturing the wisdom, debates, and breakthroughs from over a decade of conferences, podcasts, and presentations. Search, read, and learn from the minds building Bitcoin.
          </motion.p>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-b border-border bg-card">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-border">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="py-8 text-center"
              >
                <div className="font-display text-2xl sm:text-3xl font-bold text-primary">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why this exists */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-px w-8 bg-primary" />
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-primary">Why This Matters</span>
            </div>
            <h2 className="font-display text-3xl font-bold mb-4">Bitcoin Knowledge Shouldn't Be Locked in Videos</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Some of the most important ideas in Bitcoin — scaling debates, protocol improvements, security models, Lightning design decisions — were first discussed in conference talks and podcasts. But audio and video are hard to search, reference, and build on.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Bitscribe turns spoken knowledge into structured, searchable text. Every transcript is indexed by speaker, topic, and conference — making it easy to trace how ideas evolved over time.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Whether you're researching a BIP, studying Lightning Network design, or learning about Bitcoin's history, this archive puts the primary sources at your fingertips.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-8">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                  <span className="font-mono text-sm text-primary font-bold">01</span>
                </div>
                <div>
                  <h3 className="font-display font-semibold mb-1">Discover Sources</h3>
                  <p className="text-sm text-muted-foreground">Bitcoin conferences, podcasts, and technical talks are continuously identified and indexed from across the ecosystem.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                  <span className="font-mono text-sm text-primary font-bold">02</span>
                </div>
                <div>
                  <h3 className="font-display font-semibold mb-1">Transcribe & Structure</h3>
                  <p className="text-sm text-muted-foreground">AI generates timestamped transcripts with speaker detection, then adds tags, summaries, and chapter markers.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                  <span className="font-mono text-sm text-primary font-bold">03</span>
                </div>
                <div>
                  <h3 className="font-display font-semibold mb-1">Search & Learn</h3>
                  <p className="text-sm text-muted-foreground">Browse by topic, speaker, or conference. Ask AI questions grounded in real transcripts. Explore a decade of Bitcoin thinking.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="border-t border-border bg-secondary/20">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-16">
          <h2 className="font-display text-2xl font-bold mb-2 text-center">Your Bitcoin Knowledge Toolkit</h2>
          <p className="text-muted-foreground text-center mb-10">Everything you need to explore, understand, and build on Bitcoin's technical foundations</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pillars.map((pillar, i) => (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="p-6 rounded-xl border border-border bg-card"
              >
                <pillar.icon className="w-8 h-8 text-primary mb-3" />
                <h3 className="font-display font-semibold mb-2">{pillar.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{pillar.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 py-16 text-center">
        <h2 className="font-display text-2xl font-bold mb-3">Start Exploring Bitcoin Knowledge</h2>
        <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
          Dive into the archive, ask questions with AI chat, or help grow the knowledge base by reviewing transcripts and earning sats.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link
            to="/categories"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-display font-semibold text-sm glow-bitcoin"
          >
            Browse the Archive <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/chat"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-border bg-card text-sm font-semibold hover:border-primary/30"
          >
            Ask AI a Question
          </Link>
        </div>
      </section>
    </div>
  );
};

export default About;
