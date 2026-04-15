import { useEffect, useMemo, useState } from "react";
import { api, getErrorMessage, Transcript } from "../api";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface EditTranscriptModalProps {
  id: string;
  onClose: () => void;
  onSaved: () => void;
}

export function EditTranscriptModal({ id, onClose, onSaved }: EditTranscriptModalProps) {
  const isPersistedStatus = (value: Transcript["status"]): value is "pending" | "processing" | "done" =>
    value === "pending" || value === "processing" || value === "done";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [record, setRecord] = useState<Transcript | null>(null);
  const [title, setTitle] = useState("");
  const [conference, setConference] = useState("");
  const [location, setLocation] = useState("");
  const [channelName, setChannelName] = useState("");
  const [speakersCsv, setSpeakersCsv] = useState("");
  const [tagsCsv, setTagsCsv] = useState("");
  const [categoriesCsv, setCategoriesCsv] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [durationSeconds, setDurationSeconds] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [status, setStatus] = useState<Transcript["status"]>("unknown");
  const [summary, setSummary] = useState("");
  const [correctedText, setCorrectedText] = useState("");
  const [rawText, setRawText] = useState("");

  const initialSnapshot = useMemo(
    () => JSON.stringify({
      title,
      conference,
      location,
      channelName,
      speakersCsv,
      tagsCsv,
      categoriesCsv,
      mediaUrl,
      durationSeconds,
      eventDate,
      status,
      summary,
      correctedText,
      rawText,
    }),
    [
      title,
      conference,
      location,
      channelName,
      speakersCsv,
      tagsCsv,
      categoriesCsv,
      mediaUrl,
      durationSeconds,
      eventDate,
      status,
      summary,
      correctedText,
      rawText,
    ],
  );

  const [originalSnapshot, setOriginalSnapshot] = useState("");

  useEffect(() => {
    let mounted = true;

    api.getTranscriptById(id).then((current) => {
      if (!mounted) return;
      if (!current) {
        toast.error("Transcript not found");
        onClose();
        return;
      }

      setRecord(current);
      setTitle(current.title || "");
      setConference(current.conference || "");
      setLocation(current.loc || "");
      setChannelName(current.channel_name || "");
      setSpeakersCsv(Array.isArray(current.speakers) ? current.speakers.join(", ") : "");
      setTagsCsv(Array.isArray(current.tags) ? current.tags.join(", ") : "");
      setCategoriesCsv(Array.isArray(current.categories) ? current.categories.join(", ") : "");
      setMediaUrl(current.media_url || "");
      setDurationSeconds(
        typeof current.duration_seconds === "number" ? String(current.duration_seconds) : "",
      );
      setEventDate(current.event_date ? current.event_date.slice(0, 10) : "");
      setStatus(current.status || "unknown");
      setSummary(current.summary || "");
      setCorrectedText(current.corrected_text || "");
      setRawText(current.raw_text || "");
      setOriginalSnapshot(
        JSON.stringify({
          title: current.title || "",
          conference: current.conference || "",
          location: current.loc || "",
          channelName: current.channel_name || "",
          speakersCsv: Array.isArray(current.speakers) ? current.speakers.join(", ") : "",
          tagsCsv: Array.isArray(current.tags) ? current.tags.join(", ") : "",
          categoriesCsv: Array.isArray(current.categories) ? current.categories.join(", ") : "",
          mediaUrl: current.media_url || "",
          durationSeconds:
            typeof current.duration_seconds === "number" ? String(current.duration_seconds) : "",
          eventDate: current.event_date ? current.event_date.slice(0, 10) : "",
          status: current.status || "unknown",
          summary: current.summary || "",
          correctedText: current.corrected_text || "",
          rawText: current.raw_text || "",
        }),
      );
    }).catch((error) => {
      toast.error(getErrorMessage(error, "Failed to load transcript"));
      onClose();
    }).finally(() => {
      if (mounted) setLoading(false);
    });

    return () => {
      mounted = false;
    };
  }, [id, onClose]);

  const isDirty = originalSnapshot !== initialSnapshot;

  const parseCsv = (value: string): string[] =>
    value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

  const handleSave = async () => {
    if (!record) return;

    setSaving(true);
    try {
      await api.updateTranscript(record.id, {
        title: title.trim(),
        conference: conference.trim(),
        loc: location.trim(),
        channel_name: channelName.trim(),
        speakers: parseCsv(speakersCsv),
        tags: parseCsv(tagsCsv),
        categories: parseCsv(categoriesCsv),
        media_url: mediaUrl.trim() || undefined,
        duration_seconds: durationSeconds.trim() ? Number(durationSeconds) : undefined,
        event_date: eventDate || undefined,
        status: isPersistedStatus(status) ? status : undefined,
        summary: summary.trim() || undefined,
        corrected_text: correctedText.trim() || undefined,
        raw_text: rawText.trim() || undefined,
      });
      toast.success("Transcript updated");
      onSaved();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to update transcript"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit transcript</DialogTitle>
          <DialogDescription>Update full transcript content and metadata fields.</DialogDescription>
        </DialogHeader>

        {loading ? (
          <p className="text-sm text-muted-foreground">Loading transcript...</p>
        ) : (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Title</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Conference</label>
              <Input value={conference} onChange={(e) => setConference(e.target.value)} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Location</label>
                <Input value={location} onChange={(e) => setLocation(e.target.value)} />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Channel name</label>
                <Input value={channelName} onChange={(e) => setChannelName(e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Speakers (comma-separated)</label>
                <Input value={speakersCsv} onChange={(e) => setSpeakersCsv(e.target.value)} />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Tags (comma-separated)</label>
                <Input value={tagsCsv} onChange={(e) => setTagsCsv(e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Categories (comma-separated)</label>
                <Input value={categoriesCsv} onChange={(e) => setCategoriesCsv(e.target.value)} />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Media URL</label>
                <Input value={mediaUrl} onChange={(e) => setMediaUrl(e.target.value)} />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Duration (seconds)</label>
              <Input
                type="number"
                min={0}
                value={durationSeconds}
                onChange={(e) => setDurationSeconds(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Event date</label>
                <Input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as Transcript["status"])}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <option value="unknown">Unknown</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="done">Done</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Summary</label>
              <Textarea value={summary} onChange={(e) => setSummary(e.target.value)} rows={4} />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Corrected transcript</label>
              <Textarea value={correctedText} onChange={(e) => setCorrectedText(e.target.value)} rows={8} />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Raw transcript</label>
              <Textarea value={rawText} onChange={(e) => setRawText(e.target.value)} rows={8} />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={loading || saving || !isDirty || !title.trim()}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
