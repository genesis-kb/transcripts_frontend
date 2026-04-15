import { useEffect, useState, useCallback } from "react";
import { api, getErrorMessage, Transcript } from "../api";
import { Loader2, Pencil, Trash2, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { EditTranscriptModal } from "../components/EditTranscriptModal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function TranscriptsPage() {
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = useCallback(() => {
    setLoading(true);
    api.getTranscripts(page, 20, undefined, search || undefined)
      .then((res) => {
        setTranscripts(res.transcripts || []);
        setTotalPages(res.pages || 1);
      })
      .catch((error) => toast.error(getErrorMessage(error, "Failed to load transcripts")))
      .finally(() => setLoading(false));
  }, [page, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDelete = async () => {
    if (!deletingId) return;
    setDeleting(true);
    try {
      await api.deleteTranscript(deletingId);
      toast.success("Transcript deleted");
      setDeletingId(null);
      fetchData();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to delete"));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-lg font-semibold mb-4">Transcripts</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-muted-foreground" />
          <input
            placeholder="Search by title..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-8 pr-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Table */}
      <div className="border border-border rounded-lg bg-card overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium hidden md:table-cell">Conference</th>
              <th className="px-4 py-3 font-medium hidden lg:table-cell">Speakers</th>
              <th className="px-4 py-3 font-medium hidden md:table-cell">Date</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium w-24">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin inline mr-2" />Loading...
                </td>
              </tr>
            ) : transcripts.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  No transcripts found.
                </td>
              </tr>
            ) : (
              transcripts.map((t) => (
                <tr key={t.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium max-w-[250px] truncate">{t.title}</td>
                  <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">{t.conference || "—"}</td>
                  <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground truncate max-w-[200px]">
                    {t.speakers?.join(", ") || "—"}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">
                    {t.event_date ? new Date(t.event_date).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {(() => {
                      const statusClass =
                        t.status === "done"
                          ? "bg-green-500/10 text-green-600"
                          : t.status === "processing"
                          ? "bg-blue-500/10 text-blue-600"
                          : t.status === "pending"
                          ? "bg-yellow-500/10 text-yellow-600"
                          : "bg-muted text-muted-foreground";

                      const statusLabel = t.status === "unknown" ? "unknown" : t.status || "unknown";

                      return (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-mono ${statusClass}`}>
                          {statusLabel}
                        </span>
                      );
                    })()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => setEditingId(t.id)} className="p-1.5 rounded hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setDeletingId(t.id)} className="p-1.5 rounded hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
            className="p-1.5 rounded hover:bg-secondary disabled:opacity-30 transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className="p-1.5 rounded hover:bg-secondary disabled:opacity-30 transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Edit Modal */}
      {editingId && (
        <EditTranscriptModal
          id={editingId}
          onClose={() => setEditingId(null)}
          onSaved={() => { setEditingId(null); fetchData(); }}
        />
      )}

      {/* Delete Confirmation */}
      <Dialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete transcript?</DialogTitle>
            <DialogDescription>This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
