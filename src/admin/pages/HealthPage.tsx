import { useEffect, useState } from "react";
import { api, HealthResponse } from "../api";
import { Loader2, CheckCircle, XCircle, RefreshCw } from "lucide-react";

export default function HealthPage() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetch = () => {
    setLoading(true);
    setError(false);
    api.getHealth()
      .then(setHealth)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, []);

  const databaseStatus = health?.database?.status || health?.services?.database?.status;
  const databaseLatency = health?.database?.latency || health?.services?.database?.latency;

  const memoryRssMb = (() => {
    if (!health?.memory) return null;
    if (typeof health.memory.rss === "number") return health.memory.rss / 1024 / 1024;
    if (typeof health.memory.total === "number" && health.memory.unit === "MB") return health.memory.total;
    return null;
  })();

  const memoryHeapUsedMb = (() => {
    if (!health?.memory) return null;
    if (typeof health.memory.heapUsed === "number") return health.memory.heapUsed / 1024 / 1024;
    if (typeof health.memory.used === "number" && health.memory.unit === "MB") return health.memory.used;
    return null;
  })();

  const memoryHeapTotalMb = (() => {
    if (!health?.memory) return null;
    if (typeof health.memory.heapTotal === "number") return health.memory.heapTotal / 1024 / 1024;
    if (typeof health.memory.total === "number" && health.memory.unit === "MB") return health.memory.total;
    return null;
  })();

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-semibold">Health Monitor</h1>
        <button onClick={fetch} className="p-2 rounded-md hover:bg-secondary transition-colors text-muted-foreground">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Loader2 className="w-4 h-4 animate-spin" /> Checking...
        </div>
      ) : error ? (
        <div className="border border-destructive/30 rounded-lg bg-destructive/5 p-6 text-center">
          <XCircle className="w-8 h-8 text-destructive mx-auto mb-2" />
          <p className="text-sm font-medium text-destructive">Backend unreachable</p>
          <p className="text-xs text-muted-foreground mt-1">Could not connect to the API server.</p>
        </div>
      ) : health ? (
        <div className="space-y-4">
          <StatusCard
            label="API Server"
            ok={health.status === "ok" || health.status === "healthy"}
            detail={`Uptime: ${Math.floor(health.uptime / 60)}m`}
          />
          <StatusCard
            label="Database"
            ok={databaseStatus === "connected" || databaseStatus === "ok" || databaseStatus === "healthy"}
            detail={databaseLatency ? `Latency: ${databaseLatency}ms` : undefined}
          />
          {health.memory && (memoryRssMb !== null || memoryHeapUsedMb !== null || memoryHeapTotalMb !== null) && (
            <div className="border border-border rounded-lg bg-card p-4">
              <p className="text-xs font-medium text-muted-foreground mb-2">Memory Usage</p>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">RSS</p>
                  <p className="font-mono">{memoryRssMb !== null ? `${memoryRssMb.toFixed(1)} MB` : "-"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Heap Used</p>
                  <p className="font-mono">{memoryHeapUsedMb !== null ? `${memoryHeapUsedMb.toFixed(1)} MB` : "-"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Heap Total</p>
                  <p className="font-mono">{memoryHeapTotalMb !== null ? `${memoryHeapTotalMb.toFixed(1)} MB` : "-"}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

function StatusCard({ label, ok, detail }: { label: string; ok: boolean; detail?: string }) {
  return (
    <div className="flex items-center gap-3 border border-border rounded-lg bg-card p-4">
      {ok ? (
        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
      ) : (
        <XCircle className="w-5 h-5 text-destructive flex-shrink-0" />
      )}
      <div>
        <p className="text-sm font-medium">{label}</p>
        {detail && <p className="text-xs text-muted-foreground">{detail}</p>}
      </div>
      <span className={`ml-auto text-xs font-mono px-2 py-0.5 rounded-full ${
        ok ? "bg-green-500/10 text-green-600" : "bg-destructive/10 text-destructive"
      }`}>
        {ok ? "healthy" : "down"}
      </span>
    </div>
  );
}
