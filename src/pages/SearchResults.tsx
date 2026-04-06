import { useEffect, useState, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Loader2, ArrowLeft } from "lucide-react";
import { getConferences, flattenTalks } from "../../services/dataService";
import { TranscriptCard } from "@/components/TranscriptCard";
import type { Conference, Talk } from "../../types";

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [conferences, setConferences] = useState<Conference[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getConferences().then((data) => {
      setConferences(data);
      setLoading(false);
    });
  }, []);

  const allTalks = useMemo(() => flattenTalks(conferences), [conferences]);

  const filtered = useMemo(() => {
    if (!query) return allTalks;
    const q = query.toLowerCase();
    return allTalks.filter((talk) => {
      const t = talk as Talk & { _conferenceName?: string; conference?: string };
      return (
        t.title?.toLowerCase().includes(q) ||
        t.speaker?.toLowerCase().includes(q) ||
        t.tags?.some((tag) => tag.toLowerCase().includes(q)) ||
        t.summary?.toLowerCase().includes(q) ||
        t._conferenceName?.toLowerCase().includes(q) ||
        t.conference?.toLowerCase().includes(q)
      );
    });
  }, [allTalks, query]);

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-2 text-sm text-muted-foreground font-mono mb-6">
        <Link to="/" className="hover:text-foreground">Home</Link>
        <span>/</span>
        <span className="text-primary">Search</span>
      </div>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Search className="w-6 h-6 text-primary" />
          <h1 className="font-display text-3xl font-bold">
            {query ? `Results for "${query}"` : "All Transcripts"}
          </h1>
        </div>
        <p className="text-muted-foreground">
          {loading ? "Searching..." : `${filtered.length} transcript${filtered.length !== 1 ? "s" : ""} found`}
        </p>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 py-16 justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">Loading transcripts...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Search className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">No transcripts match "{query}"</p>
          <Link
            to="/conferences"
            className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Browse all conferences
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((talk, i) => (
            <TranscriptCard
              key={talk.id}
              talk={talk}
              conferenceName={(talk as any)._conferenceName}
              index={i}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchResults;
