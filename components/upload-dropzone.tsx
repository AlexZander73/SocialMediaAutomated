import { useRef, useState } from "react";
import { UploadedMedia } from "@/lib/types";
import { formatBytes, formatDuration, isoToDisplayDate } from "@/lib/utils";

interface UploadDropzoneProps {
  media: UploadedMedia[];
  warnings: string[];
  onFilesSelected: (files: File[]) => void;
  onRemoveMedia: (id: string) => void;
  onClearAll: () => void;
  isProcessing: boolean;
}

export function UploadDropzone({ media, warnings, onFilesSelected, onRemoveMedia, onClearAll, isProcessing }: UploadDropzoneProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handlePickFiles = () => {
    fileInputRef.current?.click();
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const dropped = Array.from(event.dataTransfer.files || []);
    if (dropped.length > 0) {
      onFilesSelected(dropped);
    }
  };

  return (
    <section className="glass-card p-5 md:p-6">
      <div
        className={`rounded-2xl border-2 border-dashed p-6 text-center transition md:p-10 ${
          isDragging ? "border-tide bg-tide/10" : "border-slate-500/50 bg-slate-900/30"
        }`}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <p className="font-display text-2xl text-white">Drop media here</p>
        <p className="mx-auto mt-2 max-w-xl text-sm text-slate-300">
          JPG, JPEG, PNG, HEIC, MP4, and MOV are supported for this MVP. Upload one or more photos and up to one video.
        </p>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          <button type="button" className="btn-primary" onClick={handlePickFiles}>
            Choose Files
          </button>
          {media.length > 0 ? (
            <button type="button" className="btn-danger" onClick={onClearAll}>
              Clear Uploads
            </button>
          ) : null}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          multiple
          accept=".jpg,.jpeg,.png,.heic,.heif,.mp4,.mov,image/jpeg,image/png,image/heic,image/heif,video/mp4,video/quicktime"
          onChange={(event) => {
            const selected = Array.from(event.target.files || []);
            if (selected.length > 0) {
              onFilesSelected(selected);
            }
            event.currentTarget.value = "";
          }}
        />
      </div>

      {isProcessing ? <p className="mt-3 text-sm text-slate-300">Processing files and extracting metadata...</p> : null}

      {warnings.length > 0 ? (
        <div className="mt-4 space-y-2 rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-100">
          {warnings.map((warning, index) => (
            <p key={`${warning}-${index}`}>- {warning}</p>
          ))}
        </div>
      ) : null}

      {media.length > 0 ? (
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {media.map((item) => (
            <article key={item.id} className="rounded-xl border border-white/10 bg-slate-900/70 p-3">
              {item.kind === "image" && item.previewUrl ? (
                <div className="mb-3 overflow-hidden rounded-lg border border-slate-700/70 bg-slate-800">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.previewUrl}
                    alt={item.fileName}
                    className="h-36 w-full object-cover"
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                    }}
                  />
                </div>
              ) : (
                <div className="mb-3 rounded-lg border border-slate-700/70 bg-slate-800/70 px-3 py-5 text-center text-xs uppercase tracking-wider text-slate-300">
                  {item.kind === "video" ? "Video metadata mode" : "Unsupported preview"}
                </div>
              )}

              <p className="truncate text-sm font-semibold text-white">{item.fileName}</p>
              <p className="text-xs text-slate-300">{item.fileType || item.metadata.extension || "Unknown type"}</p>
              <p className="mt-1 text-xs text-slate-400">{formatBytes(item.fileSize)}</p>
              <p className="text-xs text-slate-400">Date: {isoToDisplayDate(item.metadata.createdAt)}</p>
              <p className="text-xs text-slate-400">
                {item.metadata.width && item.metadata.height ? `${item.metadata.width}x${item.metadata.height}` : "Resolution unknown"}
              </p>
              {item.kind === "video" ? <p className="text-xs text-slate-400">Duration: {formatDuration(item.metadata.durationSeconds)}</p> : null}

              <button type="button" className="btn-ghost mt-3 w-full text-xs" onClick={() => onRemoveMedia(item.id)}>
                Remove
              </button>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}
