import { CategorySidebar } from "@/components/CategorySidebar";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Radio, Loader2, FileText } from "lucide-react";
import { useMeta } from "@/hooks/useTranscripts";

const Types = () => {
  const { data: meta, isLoading } = useMeta();
  const tags = meta?.tags ?? [];

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-2 text-sm text-muted-foreground font-mono mb-6">
        <Link to="/" className="hover:text-foreground">Home</Link>
        <span>/</span>
        <span className="text-primary">Tags</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <CategorySidebar />

        <div className="flex-1 min-w-0">
          <h1 className="font-display text-3xl font-bold mb-2">Tags</h1>
          <p className="text-muted-foreground mb-8">Browse transcripts by tag.</p>

          {isLoading ? (
            <div className="flex items-center gap-2 py-8">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">Loading tags...</span>
            </div>
          ) : tags.length === 0 ? (
            <p className="text-muted-foreground">No tags found.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
              {tags.map((tag, i) => (
                <Link
                  key={tag.name}
                  to={`/search?q=${encodeURIComponent(tag.name)}`}
                  className="block h-full"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.02 }}
                    className="p-4 rounded-xl border border-border bg-card hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer h-full min-h-[108px]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Radio className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-display font-semibold text-sm">{tag.name}</div>
                        <div className="font-mono text-xs text-muted-foreground">{tag.count} transcripts</div>
                      </div>
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

export default Types;
