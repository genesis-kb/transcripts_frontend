import { useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Loader2, ArrowLeft } from "lucide-react";
import { TranscriptCard } from "@/components/TranscriptCard";
import type { Talk, SearchResult } from "../../types";
import { useConferences, useSearch } from "@/hooks/useTranscripts";

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const conferenceFilter = searchParams.get("conference") || "";
  const topicFilter = searchParams.get("topic") || "";
  const speakerFilter = searchParams.get("speaker") || "";
  const hasQuery = query.trim().length >= 2;
  const hasConferenceFilter = conferenceFilter.trim().length > 0;
  const hasTopicFilter = topicFilter.trim().length > 0;
  const hasSpeakerFilter = speakerFilter.trim().length > 0;
  const normalize = (value: string) => value.trim().toLowerCase();

  const { data: conferences = [], isLoading: conferencesLoading } = useConferences(!hasQuery || hasConferenceFilter || hasTopicFilter || hasSpeakerFilter);
  const { data: searchResults, isLoading: searchLoading } = useSearch(query, hasQuery && !hasConferenceFilter && !hasTopicFilter && !hasSpeakerFilter);

  const conferenceCards = useMemo(
    () => conferences.flatMap((conf) =>
      conf.talks.map((talk) => ({
        talk,
        conferenceName: talk.conference || conf.name,
      }))
    ),
    [conferences]
  );

  // Filter by exact conference name when ?conference= param is present
  const filteredByConference = useMemo(
    () => hasConferenceFilter
      ? conferenceCards.filter(({ conferenceName }) =>
          normalize(conferenceName) === normalize(conferenceFilter)
        )
      : conferenceCards,
    [conferenceCards, conferenceFilter, hasConferenceFilter]
  );

  // Filter by exact tag/topic match when ?topic= param is present
  const filteredByTopic = useMemo(
    () => hasTopicFilter
      ? filteredByConference.filter(({ talk }) =>
          Array.isArray(talk.topics) && talk.topics.some((topic) => normalize(topic) === normalize(topicFilter))
        )
      : filteredByConference,
    [filteredByConference, hasTopicFilter, topicFilter]
  );

  // Filter by exact speaker when ?speaker= param is present
  const filteredBySpeaker = useMemo(
    () => hasSpeakerFilter
      ? filteredByTopic.filter(({ talk }) =>
          Array.isArray(talk.speakers)
            ? talk.speakers.some((speaker) => normalize(speaker) === normalize(speakerFilter))
            : normalize(talk.speaker).split(',').map((speaker) => speaker.trim()).includes(normalize(speakerFilter))
        )
      : filteredByTopic,
    [filteredByTopic, hasSpeakerFilter, speakerFilter]
  );

  const searchCards = useMemo(
    () => (searchResults?.data ?? []).map((result) => ({
      talk: mapSearchResultToTalk(result),
      conferenceName: result.conference || result.channel_name || result.loc || "",
    })),
    [searchResults]
  );

  const cards = hasConferenceFilter || hasTopicFilter || hasSpeakerFilter ? filteredBySpeaker : hasQuery ? searchCards : conferenceCards;
  const loading = hasConferenceFilter || hasTopicFilter || hasSpeakerFilter ? conferencesLoading : hasQuery ? searchLoading : conferencesLoading;

  function mapSearchResultToTalk(result: SearchResult): Talk {
    const speaker = Array.isArray(result.speakers)
      ? result.speakers.join(", ")
      : result.speakers || "Unknown Speaker";

    return {
      id: result.id,
      title: result.title,
      speaker,
      duration: "N/A",
      date: result.event_date,
      transcript: result.headline_content || result.snippet || result.summary || "",
      summary: result.summary || result.headline_content || result.snippet || null,
      speakers: Array.isArray(result.speakers)
        ? result.speakers
        : typeof result.speakers === "string" && result.speakers.trim().length > 0
          ? [result.speakers.trim()]
          : [],
      tags: [...(result.tags || []), ...(result.categories || [])].filter(Boolean),
      transcriptBy: "BitScribe",
    };
  }

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
            {hasConferenceFilter
              ? conferenceFilter
              : hasTopicFilter
                ? `Topic: ${topicFilter}`
                : hasSpeakerFilter
                  ? `Speaker: ${speakerFilter}`
                : hasQuery
                  ? `Results for "${query}"`
                  : "All Transcripts"}
          </h1>
        </div>
        <p className="text-muted-foreground">
          {loading ? "Searching..." : `${cards.length} transcript${cards.length !== 1 ? "s" : ""} found`}
        </p>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 py-16 justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">Loading transcripts...</span>
        </div>
      ) : cards.length === 0 ? (
        <div className="text-center py-16">
          <Search className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">No transcripts match "{hasConferenceFilter ? conferenceFilter : hasTopicFilter ? topicFilter : hasSpeakerFilter ? speakerFilter : query}"</p>
          <Link
            to="/conferences"
            className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Browse all conferences
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
          {cards.map(({ talk, conferenceName }, i) => (
            <TranscriptCard
              key={talk.id}
              talk={talk}
              conferenceName={conferenceName}
              index={i}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchResults;
