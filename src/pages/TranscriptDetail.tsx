import { useParams, Link } from "react-router-dom";
import { useEffect, useState, useMemo, useRef } from "react";

import { Calendar, Mic, Tag, Download, Copy, FileText, MessageSquare, Headphones, Loader2, RefreshCw, ChevronDown, ChevronUp, ScrollText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { TranscriptChat } from "@/components/TranscriptChat";
import { TranscriptAudio } from "@/components/TranscriptAudio";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { BookmarkButton } from "@/components/BookmarkButton";
import { HighlightToolbar } from "@/components/HighlightToolbar";
import { useBookmarks } from "@/hooks/useBookmarks";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";
import { getTranscriptById } from "../../services/dataService";
import { generateSummary } from "../../services/geminiService";
import type { RawTranscript } from "../../types";

type TabType = "summary" | "transcript" | "chat" | "audio";

const TranscriptDetail = () => {
  const { id } = useParams();
  const [transcript, setTranscript] = useState<RawTranscript | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState(false);
  const [showFullTranscript, setShowFullTranscript] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("summary");

  const transcriptRef = useRef<HTMLDivElement>(null);
  const { getHighlightsForTranscript } = useBookmarks();

  useEffect(() => {
    let cancelled = false;

    const fetchTranscript = async () => {
      if (!id) return;
      setLoading(true);
      setFetchError(null);
      try {
        const data = await getTranscriptById(id);
        if (!cancelled) {
          setTranscript(data);
        }
      } catch (error) {
        console.error("Error fetching transcript:", error);
        if (!cancelled) {
          setFetchError("Failed to load transcript. Please check your connection and try again.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchTranscript();
    return () => { cancelled = true; };
  }, [id]);

  // Auto-generate AI summary when transcript loads
  useEffect(() => {
    let cancelled = false;

    const fetchSummary = async () => {
      if (!transcript) return;
      const transcriptText = transcript.corrected_text || transcript.raw_text || "";
      if (transcript.summary) {
        setAiSummary(transcript.summary);
        return;
      }
      if (transcriptText.length < 100) return;

      setSummaryLoading(true);
      try {
        const summary = await generateSummary(transcriptText, transcript.id);
        if (!cancelled) {
          setAiSummary(summary);
          setSummaryError(false);
        }
      } catch (error) {
        console.error("Error generating summary:", error);
        if (!cancelled) {
          setSummaryError(true);
        }
      } finally {
        if (!cancelled) {
          setSummaryLoading(false);
        }
      }
    };

    fetchSummary();
    return () => { cancelled = true; };
  }, [transcript]);

  // All hooks MUST be called before any early returns (Rules of Hooks)
  const speakersList = useMemo(() => {
    if (!transcript) return [];
    if (Array.isArray(transcript.speakers)) return transcript.speakers;
    if (typeof transcript.speakers === "string") return transcript.speakers.split(",").map((s) => s.trim());
    return [];
  }, [transcript]);

  const tags = useMemo(() => {
    if (!transcript) return [];
    return transcript.tags?.length ? transcript.tags : transcript.categories || [];
  }, [transcript]);

  const transcriptBody = useMemo(() => {
    if (!transcript) return "";
    return transcript.corrected_text || transcript.raw_text || "";
  }, [transcript]);

  const displayDate = transcript?.event_date || "";

  const location = useMemo(() => {
    if (!transcript?.loc) return "";
    return transcript.loc.split(/[-_]/).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  }, [transcript]);

  // Parse transcript into paragraphs (group consecutive non-empty lines)
  const transcriptParagraphs = useMemo(() => {
    if (!transcriptBody) return [];
    const lines = transcriptBody.split("\n");
    const paragraphs: { text: string; startLine: number }[] = [];
    let current: string[] = [];
    let paraIndex = 1;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line === "") {
        if (current.length > 0) {
          paragraphs.push({ text: current.join(" "), startLine: paraIndex++ });
          current = [];
        }
      } else {
        current.push(line);
      }
    }
    if (current.length > 0) {
      paragraphs.push({ text: current.join(" "), startLine: paraIndex });
    }
    return paragraphs;
  }, [transcriptBody]);

  if (loading) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-16 text-center">
        <div className="flex items-center justify-center gap-3">
          <Loader2 className="w-5 h-5 text-primary animate-spin" />
          <span className="text-sm text-muted-foreground font-mono">Loading transcript...</span>
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-16 text-center">
        <h1 className="font-display text-2xl font-bold mb-2">Unable to load transcript</h1>
        <p className="text-sm text-muted-foreground mb-4">{fetchError}</p>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:scale-[1.02] transition-transform"
        >
          <RefreshCw className="w-4 h-4" /> Retry
        </button>
      </div>
    );
  }

  if (!transcript) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-16 text-center">
        <h1 className="font-display text-2xl font-bold mb-2">Transcript not found</h1>
        <p className="text-sm text-muted-foreground mb-4">The transcript you're looking for doesn't exist or has been removed.</p>
        <Link to="/conferences" className="text-primary font-mono text-sm hover:underline">Back to conferences</Link>
      </div>
    );
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast("Link copied to clipboard!");
  };

  const handleDownload = () => {
    const content = `# ${transcript.title}\n\nSpeakers: ${speakersList.join(", ")}\nDate: ${displayDate}\nLocation: ${location}\n\n## Summary\n${aiSummary || "No summary available"}\n\n## Transcript\n${transcriptBody}`;
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${transcript.title.replace(/[^a-zA-Z0-9]/g, "_")}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast("Downloading transcript as Markdown");
  };

  const handleRetrySummary = () => {
    setSummaryError(false);
    setSummaryLoading(true);
    const text = transcript.corrected_text || transcript.raw_text || "";
    generateSummary(text, transcript.id)
      .then((s) => { setAiSummary(s); setSummaryError(false); })
      .catch(() => setSummaryError(true))
      .finally(() => setSummaryLoading(false));
  };

  const INITIAL_PARAGRAPHS = 20;
  const visibleParagraphs = showFullTranscript
    ? transcriptParagraphs
    : transcriptParagraphs.slice(0, INITIAL_PARAGRAPHS);
  const hasMoreParagraphs = transcriptParagraphs.length > INITIAL_PARAGRAPHS;
  const transcriptHighlights = id ? getHighlightsForTranscript(id) : [];

  const tabs: { id: TabType; label: string; icon: typeof FileText }[] = [
    { id: "summary", label: "Summary", icon: FileText },
    { id: "transcript", label: "Transcript", icon: ScrollText },
    { id: "chat", label: "Chat", icon: MessageSquare },
    { id: "audio", label: "Audio", icon: Headphones },
  ];

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground font-mono mb-6 flex-wrap">
        <Link to="/" className="hover:text-foreground">Home</Link>
        <span>/</span>
        <Link to="/conferences" className="hover:text-foreground">{location}</Link>
        <span>/</span>
        <span className="text-primary truncate">{transcript.title}</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main content */}
        <article className="flex-1 min-w-0">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono mb-3">
                <span className="px-2 py-0.5 rounded bg-primary/10 text-primary uppercase">transcript</span>
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(displayDate, { day: "numeric", month: "long", year: "numeric" })}</span>
              </div>

              <h1 className="font-display text-3xl sm:text-4xl font-bold leading-tight mb-4">{transcript.title}</h1>

              <div className="flex items-center gap-4 mb-4 flex-wrap">
                {speakersList.map((speaker) => (
                  <span key={speaker} className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Mic className="w-4 h-4 text-primary" />
                    {speaker}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-2 flex-wrap mb-4">
                {tags.slice(0, 8).map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-secondary text-xs font-mono text-muted-foreground">
                    <Tag className="w-3 h-3" /> {tag}
                  </span>
                ))}
                {tags.length > 8 && (
                  <span className="text-xs text-muted-foreground font-mono">+{tags.length - 8} more</span>
                )}
              </div>

              {/* Action bar */}
              <div className="flex items-center gap-2 p-3 rounded-lg border border-border bg-card relative flex-wrap">
                {transcript && (
                  <BookmarkButton
                    transcript={{
                      id: transcript.id,
                      title: transcript.title,
                      speakers: Array.isArray(transcript.speakers)
                        ? transcript.speakers.join(", ")
                        : transcript.speakers,
                      event_date: transcript.event_date,
                      loc: location || "Unknown",
                    }}
                    size="md"
                    showLabel
                  />
                )}
                <button
                  onClick={handleShare}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" /> Share
                </button>
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                >
                  <Download className="w-3.5 h-3.5" /> Download
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-secondary mb-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <AnimatePresence mode="wait">
              {activeTab === "summary" && (
                <motion.div key="summary" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                  {/* Summary */}
                  <div className="p-5 rounded-xl border border-primary/20 bg-primary/5">
                    <h3 className="font-mono text-xs uppercase tracking-widest text-primary mb-2">AI Summary</h3>
                    {summaryLoading ? (
                      <div className="flex items-center gap-2 py-4">
                        <Loader2 className="w-4 h-4 text-primary animate-spin" />
                        <span className="text-sm text-muted-foreground">Generating AI summary...</span>
                      </div>
                    ) : summaryError ? (
                      <div className="flex items-center gap-3 py-4">
                        <p className="text-sm text-muted-foreground">Failed to generate summary.</p>
                        <button onClick={handleRetrySummary} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:scale-[1.02] transition-transform">
                          <RefreshCw className="w-3 h-3" /> Retry
                        </button>
                      </div>
                    ) : aiSummary ? (
                      <MarkdownRenderer content={aiSummary} />
                    ) : (
                      <p className="text-sm text-muted-foreground">No summary available for this transcript.</p>
                    )}
                  </div>
                </motion.div>

              )}

              {activeTab === "transcript" && (
                <motion.div key="transcript" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                  {/* Transcript viewer */}
                  <div ref={transcriptRef} className="relative rounded-xl border border-border bg-card overflow-hidden">
                    {/* Transcript header bar */}
                    <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-secondary/50">
                      <div className="flex items-center gap-3">
                        <ScrollText className="w-4 h-4 text-primary" />
                        <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Full Transcript</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground font-mono">
                        {speakersList.length > 0 && (
                          <span className="flex items-center gap-1.5">
                            <Mic className="w-3 h-3" />
                            {speakersList.join(", ")}
                          </span>
                        )}
                        <span>{transcriptParagraphs.length} paragraphs</span>
                      </div>
                    </div>

                    {/* Transcript body */}
                    <div className="divide-y divide-border/50">
                      {visibleParagraphs.map((para, idx) => (
                        (() => {
                          const hasMatchingHighlight = transcriptHighlights.some((highlight) =>
                            highlight.text.endsWith("...")
                              ? para.text.includes(highlight.text.slice(0, -3))
                              : para.text.includes(highlight.text)
                          );

                          return (
                        <div
                          key={para.startLine}
                          className={`flex gap-0 ${
                            idx % 2 === 0 ? "bg-card" : "bg-secondary/20"
                          } ${
                            hasMatchingHighlight
                              ? "bg-primary/10 ring-1 ring-primary/20"
                              : ""
                          } hover:bg-primary/5 transition-colors group`}
                        >
                          {/* Line number gutter */}
                          <div className="flex-shrink-0 w-12 sm:w-14 py-4 pr-2 text-right font-mono text-[11px] text-muted-foreground/40 group-hover:text-muted-foreground/70 select-none border-r border-border/30">
                            {para.startLine}
                          </div>
                          {/* Paragraph text */}
                          <div className="flex-1 py-4 px-4 sm:px-5">
                            <p className={`text-sm sm:text-[15px] leading-relaxed text-foreground/90 font-[system-ui,_-apple-system,_'Segoe_UI',_sans-serif] ${
                              hasMatchingHighlight ? "underline decoration-primary/40 decoration-2 underline-offset-4" : ""
                            }`}>
                              {para.text}
                            </p>
                          </div>
                        </div>
                          );
                        })()
                      ))}
                    </div>

                    {/* Show more/less */}
                    {hasMoreParagraphs && (
                      <div className={`border-t border-border ${
                        !showFullTranscript ? "relative" : ""
                      }`}>
                        {!showFullTranscript && (
                          <div className="absolute -top-16 left-0 right-0 h-16 bg-gradient-to-t from-card to-transparent pointer-events-none" />
                        )}
                        <div className="flex justify-center py-4 bg-secondary/30">
                          <button
                            onClick={() => setShowFullTranscript(!showFullTranscript)}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-border bg-card text-sm font-mono text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors shadow-sm"
                          >
                            {showFullTranscript ? (
                              <><ChevronUp className="w-4 h-4" /> Show less</>
                            ) : (
                              <><ChevronDown className="w-4 h-4" /> Show all {transcriptParagraphs.length} paragraphs</>
                            )}
                          </button>
                        </div>
                      </div>
                    )}

                    {transcript && id && (
                      <HighlightToolbar
                        containerRef={transcriptRef}
                        transcriptId={id}
                        transcriptTitle={transcript.title}
                      />
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === "chat" && (
                <motion.div key="chat" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                  <TranscriptChat transcript={transcript} />
                </motion.div>
              )}

              {activeTab === "audio" && (
                <motion.div key="audio" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                  <TranscriptAudio transcript={transcript} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </article>

        {/* Right sidebar */}
        <aside className="w-full lg:w-72 shrink-0">
          <div className="sticky top-20 space-y-6">
            {/* Speakers */}
            <div className="p-5 rounded-xl border border-border bg-card">
              <h3 className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-3">Speakers</h3>
              <div className="space-y-2">
                {speakersList.map((s) => (
                  <div key={s} className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                      <Mic className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <span className="text-sm">{s}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Source info */}
            <div className="p-5 rounded-xl border border-border bg-card">
              <h3 className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-3">Source</h3>
              <div className="text-sm text-muted-foreground space-y-1">
                <div><span className="text-foreground font-medium">{location || "Unknown"}</span></div>
                <div className="font-mono text-xs">{formatDate(displayDate, { day: "numeric", month: "long", year: "numeric" })}</div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default TranscriptDetail;
