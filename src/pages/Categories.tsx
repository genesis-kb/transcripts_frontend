import { CategorySidebar } from "@/components/CategorySidebar";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { getTranscriptMeta, type TranscriptMeta } from "../../services/dataService";

const Categories = () => {
  const [topics, setTopics] = useState<TranscriptMeta["topics"]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTranscriptMeta().then((meta) => {
      setTopics(meta.topics);
      setLoading(false);
    });
  }, []);

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-2 text-sm text-muted-foreground font-mono mb-6">
        <Link to="/" className="hover:text-foreground">Home</Link>
        <span>/</span>
        <span className="text-primary">Categories</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <CategorySidebar />

        <div className="flex-1 min-w-0">
          <h1 className="font-display text-3xl font-bold mb-2">Categories</h1>
          <p className="text-muted-foreground mb-8">Explore topics from transcribed Bitcoin technical content.</p>

          {loading ? (
            <div className="flex items-center gap-2 py-8">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">Loading categories...</span>
            </div>
          ) : topics.length === 0 ? (
            <p className="text-muted-foreground">No categories found.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {topics.map((topic, i) => (
                <motion.div
                  key={topic.slug}
                  id={topic.slug}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.02 }}
                >
                  <Link
                    to={`/search?q=${encodeURIComponent(topic.name)}`}
                    className="block p-4 rounded-lg border border-border bg-card hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer"
                  >
                    <div className="font-display font-semibold text-sm mb-1">{topic.name}</div>
                    <div className="font-mono text-xs text-muted-foreground">{topic.count} transcripts</div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Categories;
