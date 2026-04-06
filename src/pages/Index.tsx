import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Zap, FileText, Users, Headphones, MessageSquare, Globe } from "lucide-react";
import { FeaturedTranscripts } from "@/components/FeaturedTranscripts";
import { useRef, useState, useEffect, useMemo } from "react";
import { getConferences } from "../../services/dataService";
import { getTranscriptMeta, type TranscriptMeta } from "../../services/dataService";
import type { Conference } from "../../types";

const StatBlock = ({ icon: Icon, value, label }: { icon: any; value: string; label: string }) => (
  <div className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card">
    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
      <Icon className="w-5 h-5 text-primary" />
    </div>
    <div>
      <div className="font-display font-bold text-lg">{value}</div>
      <div className="text-xs text-muted-foreground font-mono">{label}</div>
    </div>
  </div>
);

const Index = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 100]);

  const [conferences, setConferences] = useState<Conference[]>([]);
  const [meta, setMeta] = useState<TranscriptMeta | null>(null);

  useEffect(() => {
    getConferences().then(setConferences);
    getTranscriptMeta().then(setMeta);
  }, []);

  const stats = useMemo(() => {
    if (meta) {
      return {
        transcripts: meta.stats.totalTranscripts > 0 ? meta.stats.totalTranscripts.toLocaleString() : "—",
        speakers: meta.stats.totalSpeakers > 0 ? String(meta.stats.totalSpeakers) : "—",
        archives: meta.stats.totalConferences > 0 ? String(meta.stats.totalConferences) : "—",
        topics: meta.stats.totalTopics > 0 ? String(meta.stats.totalTopics) : "—",
      };
    }
    const totalTalks = conferences.reduce((sum, c) => sum + c.talks.length, 0);
    const uniqueSpeakers = new Set(conferences.flatMap((c) => c.talks.map((t) => t.speaker))).size;
    return {
      transcripts: totalTalks > 0 ? totalTalks.toLocaleString() : "—",
      speakers: uniqueSpeakers > 0 ? String(uniqueSpeakers) : "—",
      archives: conferences.length > 0 ? String(conferences.length) : "—",
      topics: "—",
    };
  }, [conferences, meta]);

  const topics = meta?.topics?.slice(0, 10) || [];

  return (
    <div>
      {/* Hero */}
      <section ref={heroRef} className="relative min-h-[85vh] flex items-center overflow-hidden noise-overlay">
        {/* Geometric accent */}
        <div className="absolute -right-32 top-1/4 w-[500px] h-[500px] rounded-full border border-primary/10 opacity-30" />
        <div className="absolute -right-16 top-1/3 w-[300px] h-[300px] rounded-full border border-signal/10 opacity-20" />

        <motion.div style={{ opacity: heroOpacity, y: heroY }} className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 py-20">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="flex items-center gap-2 mb-6"
            >
              <div className="h-px w-12 bg-primary" />
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-primary">Decoding Bitcoin Knowledge</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight mb-6"
            >
              Unlock the
              <br />
              <span className="text-gradient-bitcoin">treasure trove</span>
              <br />
              of technical Bitcoin
              <br />
              transcripts
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-lg text-muted-foreground mb-8 max-w-lg leading-relaxed"
            >
              <span className="font-mono text-primary font-semibold">{stats.transcripts} transcripts</span> growing every day. AI-powered search, multilingual support, and conference archives.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="flex flex-wrap gap-3"
            >
              <Link
                to="/topics"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-display font-semibold text-sm glow-bitcoin hover:scale-[1.02] transition-transform"
              >
                Explore Transcripts
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/conferences"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-border bg-card text-foreground font-display font-semibold text-sm hover:border-primary/30 transition-colors"
              >
                <Zap className="w-4 h-4 text-accent" />
                Conference Archive
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Stats strip */}
      <section className="border-y border-border bg-secondary/30">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatBlock icon={FileText} value={stats.transcripts} label="Transcripts" />
            <StatBlock icon={Users} value={stats.speakers} label="Speakers" />
            <StatBlock icon={Headphones} value={stats.archives} label="Sources" />
            <StatBlock icon={MessageSquare} value={stats.topics} label="Topics" />
          </div>
        </div>
      </section>

      {/* Featured transcripts */}
      <FeaturedTranscripts />

      {/* Topics preview */}
      {topics.length > 0 && (
        <section className="border-t border-border bg-secondary/20">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-16">
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="font-display text-2xl font-bold mb-1">Explore by Topic</h2>
                <p className="text-sm text-muted-foreground">Dive into the Bitcoin technical ecosystem</p>
              </div>
              <Link to="/topics" className="text-sm font-mono text-primary hover:underline flex items-center gap-1">
                All topics <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {topics.map((topic, i) => (
                <motion.div
                  key={topic.slug}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.04 }}
                >
                  <Link
                    to={`/topics#${topic.slug}`}
                    className="group block p-4 rounded-xl border border-border bg-card hover:border-primary/30 transition-all"
                  >
                    <div className="font-display font-semibold text-sm group-hover:text-primary transition-colors mb-1">{topic.name}</div>
                    <div className="font-mono text-xs text-muted-foreground">{topic.count} transcripts</div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Why transcripts */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-px w-8 bg-signal" />
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-signal">Why Transcripts?</span>
            </div>
            <h2 className="font-display text-3xl font-bold mb-4 leading-tight">
              A Historical Archive for Knowledge Preservation
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Bryan Bishop (@kanzure) manually transcribed ~900 transcripts over the years. Bitscribe builds on this foundational work with AI-powered tools to make Bitcoin knowledge searchable and accessible.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Transcripts transform Bitcoin knowledge into searchable, accessible text. They help you find key details quickly, understand complex ideas, and share important content.
            </p>
            <div className="flex gap-3">
              <Link
                to="/about"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-border bg-card text-sm font-medium hover:border-primary/30 transition-colors"
              >
                Learn More <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-2xl border border-border bg-card p-6 scanline">
              <div className="font-mono text-xs text-muted-foreground space-y-2">
                {(meta?.topics?.slice(0, 5) || []).map((topic, i) => (
                  <motion.div
                    key={topic.slug}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.2 }}
                    className="flex items-start gap-2"
                  >
                    <span className="text-primary shrink-0">{'\u25B8'}</span>
                    <span className="leading-relaxed">{topic.name} ({topic.count} transcripts)</span>
                  </motion.div>
                ))}
              </div>
            </div>
            <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-primary/5 border border-primary/10" />
            <div className="absolute -bottom-6 -left-6 w-16 h-16 rounded-full bg-signal/5 border border-signal/10" />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-16 text-center">
          <h2 className="font-display text-2xl font-bold mb-3">Ready to explore?</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Search through {stats.transcripts} transcripts with AI-powered summaries, chat, and audio on every transcript.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link to="/topics" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-display font-semibold text-sm glow-bitcoin">
              Browse Archive <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/conferences" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-border bg-card text-sm font-semibold hover:border-primary/30">
               Conference Archive
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
