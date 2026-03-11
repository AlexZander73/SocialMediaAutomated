import { CATEGORY_LABELS } from "@/lib/constants";
import { ContentContext, UploadedMedia } from "@/lib/types";
import { formatBytes, formatDuration, isoToDisplayDate } from "@/lib/utils";

interface DetectedInfoPanelProps {
  context: ContentContext | null;
  media: UploadedMedia[];
  geocodingStatus: "idle" | "loading" | "success" | "failed";
}

function GeocodingStateTag({ status }: { status: DetectedInfoPanelProps["geocodingStatus"] }) {
  if (status === "loading") {
    return <span className="soft-pill">Resolving location...</span>;
  }
  if (status === "success") {
    return <span className="soft-pill">Location resolved</span>;
  }
  if (status === "failed") {
    return <span className="soft-pill">Location fallback: coordinates</span>;
  }
  return <span className="soft-pill">Location lookup optional</span>;
}

export function DetectedInfoPanel({ context, media, geocodingStatus }: DetectedInfoPanelProps) {
  return (
    <section className="glass-card p-5 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="section-title">Detected Info Summary</h2>
        <GeocodingStateTag status={geocodingStatus} />
      </div>

      {!context ? (
        <p className="mt-3 text-sm text-slate-300">Upload supported files to see metadata, summary insights, and generated drafts.</p>
      ) : (
        <>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-white/10 bg-slate-900/70 p-3">
              <p className="text-xs uppercase tracking-wider text-slate-400">File count</p>
              <p className="mt-1 text-lg font-semibold text-white">{context.summary.fileCount}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-slate-900/70 p-3">
              <p className="text-xs uppercase tracking-wider text-slate-400">Media types</p>
              <p className="mt-1 text-sm font-semibold text-white">{context.summary.mediaTypes.join(", ") || "Unknown"}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-slate-900/70 p-3">
              <p className="text-xs uppercase tracking-wider text-slate-400">Date range</p>
              <p className="mt-1 text-sm font-semibold text-white">{context.summary.dateRangeText}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-slate-900/70 p-3">
              <p className="text-xs uppercase tracking-wider text-slate-400">GPS found</p>
              <p className="mt-1 text-sm font-semibold text-white">{context.summary.gpsFound ? "Yes" : "No"}</p>
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-slate-900/70 p-3">
              <p className="text-xs uppercase tracking-wider text-slate-400">Location</p>
              <p className="mt-1 text-sm text-white">{context.summary.locationText}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-slate-900/70 p-3">
              <p className="text-xs uppercase tracking-wider text-slate-400">Category</p>
              <p className="mt-1 text-sm text-white">{CATEGORY_LABELS[context.summary.manualCategory]}</p>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-white/10 bg-slate-900/70 p-3">
            <p className="text-xs uppercase tracking-wider text-slate-400">Resolutions</p>
            <p className="mt-1 text-sm text-white">{context.summary.resolutionSet.join(", ")}</p>
          </div>
        </>
      )}

      {media.length > 0 ? (
        <div className="mt-5 space-y-2">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-300">Per-file metadata</h3>
          {media.map((item) => (
            <div key={item.id} className="rounded-xl border border-white/10 bg-slate-900/60 p-3 text-xs text-slate-200">
              <p className="font-semibold text-white">{item.fileName}</p>
              <p>
                Type: {item.kind} | Size: {formatBytes(item.fileSize)} | Created: {isoToDisplayDate(item.metadata.createdAt)}
              </p>
              <p>
                Resolution: {item.metadata.width && item.metadata.height ? `${item.metadata.width}x${item.metadata.height}` : "Unknown"}
                {item.kind === "video" ? ` | Duration: ${formatDuration(item.metadata.durationSeconds)}` : ""}
              </p>
              <p>
                Camera: {item.metadata.cameraMake || "Unknown"} {item.metadata.cameraModel || ""}
              </p>
              <p>
                GPS: {item.metadata.gps ? `${item.metadata.gps.latitude.toFixed(5)}, ${item.metadata.gps.longitude.toFixed(5)}` : "Not found"}
              </p>
              {item.metadata.parseWarnings.length > 0 ? <p>Warnings: {item.metadata.parseWarnings.join(" | ")}</p> : null}
              {item.unsupportedReason ? <p>Unsupported: {item.unsupportedReason}</p> : null}
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
