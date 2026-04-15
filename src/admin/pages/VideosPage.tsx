import { Video } from "lucide-react";

export default function VideosPage() {
  return (
    <div className="p-6 max-w-4xl">
      <h1 className="text-lg font-semibold mb-4">Videos</h1>
      <div className="border border-border rounded-lg bg-card p-6">
        <div className="flex items-center gap-2 mb-2 text-primary">
          <Video className="w-4 h-4" />
          <span className="text-sm font-medium">Video management</span>
        </div>
        <p className="text-sm text-muted-foreground">
          This section is wired and ready for video-level admin tools.
        </p>
      </div>
    </div>
  );
}
