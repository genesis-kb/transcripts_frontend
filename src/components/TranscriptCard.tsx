import { Link } from "react-router-dom";
import { Calendar, Mic, Tag } from "lucide-react";
import { motion } from "framer-motion";
import type { Talk } from "../../types";
import { stripMarkdown } from "./MarkdownRenderer";
import { formatDate } from "@/lib/utils";
import { BookmarkButton } from "./BookmarkButton";

export const TranscriptCard = ({ talk, conferenceName, index = 0 }: { talk: Talk; conferenceName?: string; index?: number }) => {
  return (
    <motion.div
      className="relative h-full"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
    >
      <Link
        to={`/transcript/${talk.id}`}
        className="group block p-5 rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 h-full min-h-[248px] flex flex-col"
      >
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono mb-2 pr-8">
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

        <div className="min-h-[2.75rem] mb-3">
          {talk.summary && (
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
              {stripMarkdown(talk.summary)}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1.5 flex-wrap mt-auto">
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

      <div className="absolute top-2 right-2 z-10">
        <BookmarkButton
          transcript={{
            id: talk.id,
            title: talk.title,
            speakers: talk.speaker,
            event_date: talk.date,
            loc: conferenceName || "Unknown",
          }}
          size="sm"
        />
      </div>
    </motion.div>
  );
};
