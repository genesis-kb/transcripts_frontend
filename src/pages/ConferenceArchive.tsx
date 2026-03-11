import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { MapPin, Calendar, FileText, ChevronRight, ChevronDown, Users, Loader2 } from "lucide-react";
import { getConferences } from "../../services/dataService";
import type { Conference } from "../../types";
import { formatDate } from "@/lib/utils";

const ConferenceArchive = () => {
  const [conferences, setConferences] = useState<Conference[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedConfs, setExpandedConfs] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getConferences();
        if (!cancelled) {
          setConferences(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError("Failed to load conferences");
          console.error("Error fetching conferences:", err);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchData();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-2 text-sm text-muted-foreground font-mono mb-6">
        <Link to="/" className="hover:text-foreground">Home</Link>
        <span>/</span>
        <span className="text-primary">Conference Archive</span>
      </div>

      <h1 className="font-display text-3xl font-bold mb-2">Conference Proceedings</h1>
      <p className="text-muted-foreground mb-10 max-w-2xl">
        Structured session-wise breakdown of Bitcoin conferences, including key highlights, important discussions, and organized summaries.
      </p>

      {loading && (
        <div className="flex items-center justify-center gap-3 py-20">
          <Loader2 className="w-5 h-5 text-primary animate-spin" />
          <span className="text-sm text-muted-foreground font-mono">Loading conferences...</span>
        </div>
      )}

      {!loading && error && (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-sm font-mono">{error}</p>
        </div>
      )}

      {!loading && !error && conferences.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-sm font-mono">
            No conferences available. Please ensure the backend is running.
          </p>
        </div>
      )}

      <div className="space-y-8">
        {conferences.map((conf, i) => (
          <motion.div
            key={conf.id}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className="rounded-2xl border border-border bg-card overflow-hidden"
          >
            {/* Conference header */}
            <div className="p-6 border-b border-border">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-display text-xl font-bold mb-1">{conf.name}</h2>
                  <p className="text-sm text-muted-foreground">{conf.talks.length} session{conf.talks.length !== 1 ? "s" : ""} available</p>
                </div>
                <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground shrink-0">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {conf.year}</span>
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {conf.location}</span>
                  <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> {conf.talks.length}</span>
                </div>
              </div>
            </div>

            {/* Sessions list */}
            <div className="divide-y divide-border">
              {(expandedConfs.has(conf.id) ? conf.talks : conf.talks.slice(0, 5)).map((talk) => (
                <Link
                  key={talk.id}
                  to={`/transcript/${talk.id}`}
                  className="flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm group-hover:text-primary transition-colors truncate">{talk.title}</div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {talk.speaker}</span>
                      {talk.date && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(talk.date)}
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                </Link>
              ))}
              {conf.talks.length > 5 && !expandedConfs.has(conf.id) && (
                <button
                  onClick={() => setExpandedConfs((prev) => new Set(prev).add(conf.id))}
                  className="w-full p-4 text-center text-sm text-primary font-mono hover:bg-secondary/50 transition-colors flex items-center justify-center gap-1.5"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                  Show {conf.talks.length - 5} more session{conf.talks.length - 5 !== 1 ? "s" : ""}
                </button>
              )}
              {conf.talks.length === 0 && (
                <div className="p-4 text-center text-sm text-muted-foreground font-mono">
                  Sessions coming soon...
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ConferenceArchive;
