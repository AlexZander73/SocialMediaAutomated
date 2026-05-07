"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AppHeader } from "@/components/app-header";
import { DetectedInfoPanel } from "@/components/detected-info-panel";
import { DraftsPanel } from "@/components/drafts-panel";
import { ManualContextForm } from "@/components/manual-context-form";
import { SettingsDrawer } from "@/components/settings-drawer";
import { UploadDropzone } from "@/components/upload-dropzone";
import { DEFAULT_PREFERENCES } from "@/lib/constants";
import { buildContentContext } from "@/lib/content-context";
import { generateDraftOutputs } from "@/lib/draft-generator";
import { coordinatesOnlyLocation, reverseGeocodeCoordinates } from "@/lib/geocoding";
import { extractMediaFromFile } from "@/lib/metadata-extractor";
import { exampleSeedMedia, exampleSeedPreferences } from "@/lib/mock-seed";
import { clearLastSession, loadLastSession, loadPreferences, saveLastSession, savePreferences } from "@/lib/storage";
import {
  ContentCategory,
  ContentContext,
  DraftOutput,
  ManualInputs,
  SavedSession,
  UploadedMedia,
  UserPreferences
} from "@/lib/types";
import { dedupe, isoToDisplayDate, uniqueId } from "@/lib/utils";

const INACTIVITY_PAUSE_MS = 5 * 60 * 1000;
const PAUSE_WARNING = "App paused after 5 minutes of inactivity to reduce memory usage.";

const EMPTY_MANUAL_INPUTS: ManualInputs = {
  whatHappened: "",
  whoIsThisFor: "",
  extraNotes: ""
};

function revokePreviewUrls(media: UploadedMedia[]): void {
  for (const item of media) {
    if (item.previewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(item.previewUrl);
    }
  }
}

function mergeDraftsWithEdits(previous: DraftOutput[], generated: DraftOutput[]): DraftOutput[] {
  return generated.map((draft) => {
    const existing = previous.find((candidate) => candidate.key === draft.key);
    if (!existing) {
      return draft;
    }

    const wasEdited = existing.current !== existing.generated;
    if (!wasEdited) {
      return draft;
    }

    return {
      ...draft,
      current: existing.current
    };
  });
}

function sanitizeMediaForStorage(media: UploadedMedia[]): UploadedMedia[] {
  return media.map((item) => ({
    ...item,
    previewUrl: undefined
  }));
}

function createSessionPayload(context: ContentContext, drafts: DraftOutput[], preferences: UserPreferences): SavedSession {
  return {
    savedAt: new Date().toISOString(),
    context: {
      ...context,
      media: sanitizeMediaForStorage(context.media)
    },
    drafts,
    preferences
  };
}

function downloadFile(filename: string, content: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function cloneSeedMedia(): UploadedMedia[] {
  return exampleSeedMedia.map((item) => ({
    ...item,
    id: uniqueId("seed"),
    metadata: {
      ...item.metadata,
      parseWarnings: [...item.metadata.parseWarnings],
      gps: item.metadata.gps ? { ...item.metadata.gps } : undefined
    }
  }));
}

function withoutPreviews(media: UploadedMedia[]): UploadedMedia[] {
  return media.map((item) => (item.previewUrl?.startsWith("blob:") ? { ...item, previewUrl: undefined } : item));
}

export default function HomePage() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [geocodingStatus, setGeocodingStatus] = useState<"idle" | "loading" | "success" | "failed">("idle");
  const [isPaused, setIsPaused] = useState(false);

  const [media, setMedia] = useState<UploadedMedia[]>([]);
  const [category, setCategory] = useState<ContentCategory>("personal-update");
  const [manualInputs, setManualInputs] = useState<ManualInputs>(EMPTY_MANUAL_INPUTS);
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);

  const [context, setContext] = useState<ContentContext | null>(null);
  const [drafts, setDrafts] = useState<DraftOutput[]>([]);
  const [lastSession, setLastSession] = useState<SavedSession | null>(null);

  const draftsRef = useRef<DraftOutput[]>([]);
  const mediaRef = useRef<UploadedMedia[]>([]);
  const pauseTimerRef = useRef<number | null>(null);
  const isPausedRef = useRef(false);
  const schedulePauseRef = useRef<() => void>(() => {});
  const resumeFromPauseRef = useRef<() => void>(() => {});

  useEffect(() => {
    draftsRef.current = drafts;
  }, [drafts]);

  useEffect(() => {
    mediaRef.current = media;
  }, [media]);

  useEffect(() => {
    const storedPreferences = loadPreferences();
    const storedSession = loadLastSession();
    setPreferences(storedPreferences);
    setLastSession(storedSession);
  }, []);

  useEffect(() => {
    savePreferences(preferences);
  }, [preferences]);

  useEffect(() => {
    return () => {
      revokePreviewUrls(mediaRef.current);
    };
  }, []);

  const clearPauseTimer = () => {
    if (pauseTimerRef.current !== null) {
      window.clearTimeout(pauseTimerRef.current);
      pauseTimerRef.current = null;
    }
  };

  const schedulePause = () => {
    clearPauseTimer();
    if (isPausedRef.current || typeof document === "undefined") {
      return;
    }
    pauseTimerRef.current = window.setTimeout(() => {
      if (document.hidden || !document.hasFocus()) {
        setIsPaused((current) => {
          if (current) {
            return current;
          }
          return true;
        });

        isPausedRef.current = true;
        setIsProcessing(false);
        revokePreviewUrls(mediaRef.current);
        setMedia((existing) => withoutPreviews(existing));
        setGeocodingStatus("idle");
        appendWarnings([PAUSE_WARNING]);
      }
    }, INACTIVITY_PAUSE_MS);
  };

  const resumeFromPause = () => {
    clearPauseTimer();
    if (!isPausedRef.current) {
      return;
    }
    isPausedRef.current = false;
    setIsPaused(false);
    appendWarnings(["Resumed after inactivity pause."]);
  };

  schedulePauseRef.current = schedulePause;
  resumeFromPauseRef.current = resumeFromPause;

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    const handleVisibility = () => {
      if (document.hidden) {
        schedulePauseRef.current();
        return;
      }

      clearPauseTimer();
      if (isPausedRef.current) {
        resumeFromPauseRef.current();
      }
    };

    const handleBlur = () => {
      schedulePauseRef.current();
    };

    const handleFocus = () => {
      clearPauseTimer();
      if (isPausedRef.current) {
        resumeFromPauseRef.current();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);

    if (document.hidden || !document.hasFocus()) {
      schedulePauseRef.current();
    }

    return () => {
      clearPauseTimer();
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  const supportedMedia = useMemo(() => media.filter((item) => item.kind !== "unsupported"), [media]);

  const appendWarnings = (nextWarnings: string[]): void => {
    if (nextWarnings.length === 0) {
      return;
    }

    setWarnings((existing) => dedupe([...existing, ...nextWarnings]));
  };

  const handleFilesSelected = async (selectedFiles: File[]): Promise<void> => {
    if (isPaused) {
      appendWarnings(["App is currently paused. Click Resume to allow uploads."]);
      return;
    }

    if (selectedFiles.length === 0) {
      return;
    }

    setIsProcessing(true);

    try {
      const nextMedia: UploadedMedia[] = [];
      const nextWarnings: string[] = [];
      let pausedDuringExtraction = false;

      let currentVideoCount = mediaRef.current.filter((item) => item.kind === "video").length;

      for (const file of selectedFiles) {
        const extracted = await extractMediaFromFile(file);

        if (isPausedRef.current) {
          if (extracted.previewUrl?.startsWith("blob:")) {
            URL.revokeObjectURL(extracted.previewUrl);
          }
          pausedDuringExtraction = true;
          break;
        }

        if (extracted.kind === "video" && currentVideoCount >= 1) {
          if (extracted.previewUrl?.startsWith("blob:")) {
            URL.revokeObjectURL(extracted.previewUrl);
          }
          nextWarnings.push(`Skipped ${file.name}: only one video is supported per session in this MVP.`);
          continue;
        }

        if (extracted.kind === "video") {
          currentVideoCount += 1;
        }

        if (extracted.kind === "unsupported") {
          nextWarnings.push(`${file.name}: unsupported format.`);
        }

        if (extracted.metadata.parseWarnings.length > 0) {
          nextWarnings.push(`${file.name}: ${extracted.metadata.parseWarnings.join(" ")}`);
        }

        nextMedia.push(extracted);
      }

      if (pausedDuringExtraction || isPausedRef.current) {
        revokePreviewUrls(nextMedia);
        appendWarnings([
          ...nextWarnings,
          "Upload processing paused before completion. Resume the app and reselect those files if you still want them loaded."
        ]);
        return;
      }

      if (nextMedia.length > 0) {
        setMedia((existing) => [...existing, ...nextMedia]);
      }

      appendWarnings(nextWarnings);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveMedia = (id: string): void => {
    setMedia((existing) => {
      const target = existing.find((item) => item.id === id);
      if (target?.previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return existing.filter((item) => item.id !== id);
    });
  };

  const handleClearAll = (): void => {
    revokePreviewUrls(mediaRef.current);
    setMedia([]);
    setDrafts([]);
    setContext(null);
    setWarnings([]);
    setGeocodingStatus("idle");
  };

  useEffect(() => {
    let cancelled = false;

    const buildAndGenerate = async () => {
      if (isPaused) {
        return;
      }

      if (supportedMedia.length === 0) {
        setContext(null);
        setDrafts([]);
        setGeocodingStatus("idle");
        return;
      }

      const firstGps = supportedMedia.find((item) => Boolean(item.metadata.gps))?.metadata.gps;
      let resolvedLocation = undefined;

      if (firstGps) {
        if (preferences.enableReverseGeocoding) {
          setGeocodingStatus("loading");
          try {
            resolvedLocation = await reverseGeocodeCoordinates(firstGps);
            if (!cancelled && !isPausedRef.current) {
              setGeocodingStatus("success");
            }
          } catch {
            resolvedLocation = coordinatesOnlyLocation(firstGps);
            if (!cancelled && !isPausedRef.current) {
              setGeocodingStatus("failed");
              appendWarnings(["Reverse geocoding failed. Falling back to coordinates."]);
            }
          }
        } else {
          resolvedLocation = coordinatesOnlyLocation(firstGps);
          setGeocodingStatus("idle");
        }
      } else {
        setGeocodingStatus("idle");
      }

      if (cancelled) {
        return;
      }

      if (isPausedRef.current) {
        return;
      }

      const nextContext = buildContentContext({
        media: supportedMedia,
        category,
        manual: manualInputs,
        primaryLocation: resolvedLocation,
        locationFormat: preferences.locationFormat,
        spelling: preferences.spelling
      });

      const generatedDrafts = generateDraftOutputs(nextContext, preferences);
      const mergedDrafts = mergeDraftsWithEdits(draftsRef.current, generatedDrafts);

      setContext(nextContext);
      setDrafts(mergedDrafts);

      const session = createSessionPayload(nextContext, mergedDrafts, preferences);
      saveLastSession(session);
      setLastSession(session);

      // TODO: Future AI upgrade hook can call FutureCaptionGenerator here after deterministic drafts are generated.
    };

    buildAndGenerate();

    return () => {
      cancelled = true;
    };
  }, [supportedMedia, category, manualInputs, preferences, isPaused]);

  const handleEditDraft = (key: DraftOutput["key"], value: string): void => {
    setDrafts((existing) => existing.map((draft) => (draft.key === key ? { ...draft, current: value } : draft)));
  };

  const handleResetDraft = (key: DraftOutput["key"]): void => {
    setDrafts((existing) =>
      existing.map((draft) =>
        draft.key === key
          ? {
              ...draft,
              current: draft.generated
            }
          : draft
      )
    );
  };

  const handleCopyDraft = async (key: DraftOutput["key"]): Promise<void> => {
    const target = draftsRef.current.find((draft) => draft.key === key);
    if (!target) {
      return;
    }

    try {
      await navigator.clipboard.writeText(target.current);
    } catch {
      const fallback = document.createElement("textarea");
      fallback.value = target.current;
      document.body.appendChild(fallback);
      fallback.select();
      document.execCommand("copy");
      fallback.remove();
    }
  };

  const handleExportJson = (): void => {
    if (!context || drafts.length === 0) {
      return;
    }

    const payload = {
      exportedAt: new Date().toISOString(),
      context,
      drafts,
      preferences
    };

    downloadFile("social-post-helper-drafts.json", JSON.stringify(payload, null, 2), "application/json");
  };

  const handleExportText = (): void => {
    if (drafts.length === 0) {
      return;
    }

    const sections = drafts.map((draft) => `${draft.label}\n${draft.current}`);
    const content = sections.join("\n\n------------------------------\n\n");
    downloadFile("social-post-helper-drafts.txt", content, "text/plain");
  };

  const handleRestoreSession = (): void => {
    if (isPaused) {
      resumeFromPause();
    }

    if (!lastSession) {
      return;
    }

    revokePreviewUrls(mediaRef.current);
    setMedia(
      lastSession.context.media.map((item) => ({
        ...item,
        id: uniqueId("restored"),
        previewUrl: undefined
      }))
    );
    setCategory(lastSession.context.category);
    setManualInputs(lastSession.context.manual);
    setPreferences(lastSession.preferences);
    appendWarnings([
      `Restored session from ${isoToDisplayDate(lastSession.savedAt, lastSession.preferences.spelling)}. Original file blobs are not reattached.`
    ]);
  };

  const handleLoadExample = (): void => {
    if (isPaused) {
      resumeFromPause();
    }
    revokePreviewUrls(mediaRef.current);
    setMedia(cloneSeedMedia());
    setCategory("project-progress");
    setManualInputs({
      whatHappened: "Bench prototype iteration and alignment test.",
      whoIsThisFor: "Builder community",
      extraNotes: "Testing a stronger support brace before final assembly."
    });
    setPreferences(exampleSeedPreferences);
    appendWarnings(["Loaded local example session. Upload your own media to replace this data."]);
  };

  const handleDraftLengthChange = (draftLength: UserPreferences["draftLength"]): void => {
    setPreferences((existing) => ({ ...existing, draftLength }));
  };

  const clearStoredSession = (): void => {
    clearLastSession();
    setLastSession(null);
    appendWarnings(["Saved session snapshot cleared from localStorage."]);
  };

  return (
    <main className="mx-auto w-full max-w-7xl px-4 pb-14 pt-6 sm:px-6 lg:px-8">
      <div className="space-y-5">
        <AppHeader
          onOpenSettings={() => setSettingsOpen(true)}
          onRestoreSession={handleRestoreSession}
          hasRestorableSession={Boolean(lastSession)}
          onLoadExample={handleLoadExample}
        />

        <section className="glass-card flex flex-wrap items-center justify-between gap-3 p-4 text-sm text-slate-200">
          <p>
            This MVP is deterministic and non-AI: no LLMs, no cloud vision, and no paid APIs. Drafts are generated from metadata,
            heuristics, and template rules.
          </p>
          <button type="button" className="btn-ghost text-xs" onClick={clearStoredSession}>
            Clear Saved Snapshot
          </button>
        </section>

        {isPaused ? (
          <section className="glass-card flex flex-wrap items-center justify-between gap-3 p-4 text-sm text-amber-100">
            <p>App is paused due to 5 minutes of inactivity. Draft generation is currently stopped and previews were released.</p>
            <button type="button" className="btn-primary" onClick={resumeFromPause}>
              Resume
            </button>
          </section>
        ) : null}

        <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
          <UploadDropzone
            media={media}
            warnings={warnings}
            onFilesSelected={handleFilesSelected}
            onRemoveMedia={handleRemoveMedia}
            onClearAll={handleClearAll}
            isProcessing={isProcessing}
            isPaused={isPaused}
          />
          <ManualContextForm
            category={category}
            manualInputs={manualInputs}
            onCategoryChange={setCategory}
            onManualInputChange={setManualInputs}
          />
        </div>

        <DetectedInfoPanel context={context} media={media} geocodingStatus={geocodingStatus} />

        <DraftsPanel
          drafts={drafts}
          draftLength={preferences.draftLength}
          onDraftLengthChange={handleDraftLengthChange}
          onEditDraft={handleEditDraft}
          onResetDraft={handleResetDraft}
          onCopyDraft={handleCopyDraft}
          onExportJson={handleExportJson}
          onExportText={handleExportText}
        />
      </div>

      <SettingsDrawer
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        preferences={preferences}
        onUpdate={setPreferences}
      />
    </main>
  );
}
