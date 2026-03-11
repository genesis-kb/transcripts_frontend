import { Link } from "react-router-dom";
import { Calendar, Mic, Tag } from "lucide-react";
import { motion } from "framer-motion";
import type { Talk } from "../../types";
import { stripMarkdown } from "./MarkdownRenderer";
import { formatDate } from "@/lib/utils";

export const TranscriptCard = ({ talk, conferenceName, index = 0 }: { talk: Talk; conferenceName?: string; index?: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
    >
      <Link
        to={`/transcript/${talk.id}`}
        className="group block p-5 rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
      >
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono mb-2">
          {conferenceName && <span>{conferenceName}</span>}
          <span className="ml-auto flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatDate(talk.date)}
          </span>
        </div>

        <h3 className="font-display font-semibold text-foreground group-hover:text-primary transition-colors mb-2 leading-tight line-clamp-2">
          {talk.title}
        </h3>

        <div className="flex items-center gap-3 mb-3">
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Mic className="w-3 h-3" />
            {talk.speaker}
          </span>
        </div>

        {talk.summary && (
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-3">
            {stripMarkdown(talk.summary)}
          </p>
        )}

        <div className="flex items-center gap-1.5 flex-wrap">
          {talk.tags?.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-secondary text-xs font-mono text-muted-foreground"
            >
              <Tag className="w-2.5 h-2.5" />
              {tag}
            </span>
          ))}
          {(talk.tags?.length ?? 0) > 4 && (
            <span className="text-xs text-muted-foreground font-mono">+{talk.tags!.length - 4}</span>
          )}
        </div>
      </Link>
    </motion.div>
  );
};
