import { CategorySidebar } from "@/components/CategorySidebar";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Mic, Tag, Loader2 } from "lucide-react";
import { getTranscriptMeta, type TranscriptMeta } from "../../services/dataService";

const Speakers = () => {
  const [speakers, setSpeakers] = useState<TranscriptMeta["speakers"]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTranscriptMeta().then((meta) => {
      setSpeakers(meta.speakers);
      setLoading(false);
    });
  }, []);

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-2 text-sm text-muted-foreground font-mono mb-6">
        <Link to="/" className="hover:text-foreground">Home</Link>
        <span>/</span>
        <span className="text-primary">Speakers</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <CategorySidebar />

        <div className="flex-1 min-w-0">
          <h1 className="font-display text-3xl font-bold mb-2">Speakers</h1>
          <p className="text-muted-foreground mb-8">Bitcoin developers, researchers, and educators who have contributed transcripts.</p>

          {loading ? (
            <div className="flex items-center gap-2 py-8">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">Loading speakers...</span>
            </div>
          ) : speakers.length === 0 ? (
            <p className="text-muted-foreground">No speakers found.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-stretch">
              {speakers.map((speaker, i) => (
                <Link
                  key={speaker.slug}
                  to={`/search?q=${encodeURIComponent(speaker.name)}`}
                  className="flex"
                >
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.04 }}
                  className="p-5 rounded-xl border border-border bg-card hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer h-full w-full"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Mic className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-display font-semibold">{speaker.name}</div>
                      <div className="font-mono text-xs text-muted-foreground">{speaker.transcriptCount} transcripts</div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {speaker.topics.slice(0, 4).map((topic) => (
                      <span key={topic} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-secondary text-xs font-mono text-muted-foreground">
                        <Tag className="w-2.5 h-2.5" /> {topic}
                      </span>
                    ))}
                  </div>
                </motion.div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Speakers;
