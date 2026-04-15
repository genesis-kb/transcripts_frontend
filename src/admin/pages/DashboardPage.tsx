import { useEffect, useState } from "react";
import { api, getErrorMessage, Transcript } from "../api";
import { FileText, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function DashboardPage() {
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, withKnownStatus: 0, unknownStatus: 0 });

  useEffect(() => {
    api.getTranscripts(1, 100)
      .then((res) => {
        const all = res.transcripts || [];
        setTranscripts(all);
        const known = all.filter((t) => t.status === "pending" || t.status === "processing" || t.status === "done").length;
        setStats({
          total: res.total || all.length,
          withKnownStatus: known,
          unknownStatus: all.length - known,
        });
      })
      .catch((error) => {
        toast.error(getErrorMessage(error, "Failed to load dashboard data"));
      })
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    { label: "Total Transcripts", value: stats.total, icon: FileText, color: "text-primary" },
    { label: "With Known Status", value: stats.withKnownStatus, icon: Loader2, color: "text-blue-500" },
    { label: "Unknown Status", value: stats.unknownStatus, icon: AlertCircle, color: "text-muted-foreground" },
  ];

  const recent = [...transcripts]
    .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
    .slice(0, 8);

  return (
    <div className="p-6 max-w-5xl">
      <h1 className="text-lg font-semibold mb-6">Dashboard</h1>

      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading...
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            {statCards.map((s) => (
              <div key={s.label} className="border border-border rounded-lg bg-card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <s.icon className={`w-4 h-4 ${s.color}`} />
                  <span className="text-xs text-muted-foreground">{s.label}</span>
                </div>
                <span className="text-2xl font-semibold">{s.value}</span>
              </div>
            ))}
          </div>

          <h2 className="text-sm font-medium text-muted-foreground mb-3">Recent Activity</h2>
          <div className="border border-border rounded-lg bg-card divide-y divide-border">
            {recent.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">No transcripts yet.</p>
            ) : (
              recent.map((t) => (
                <div key={t.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-sm font-medium">{t.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {t.conference || "No conference"} · {t.speakers?.join(", ") || "No speakers"}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-mono ${
                      t.status === "done"
                        ? "bg-green-500/10 text-green-600"
                        : t.status === "processing"
                        ? "bg-blue-500/10 text-blue-600"
                        : t.status === "pending"
                        ? "bg-yellow-500/10 text-yellow-600"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {t.status || "unknown"}
                  </span>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
