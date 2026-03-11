import { useMemo, useState } from "react";
import { DraftCard } from "@/components/draft-card";
import { DraftLength, DraftOutput } from "@/lib/types";

interface DraftsPanelProps {
  drafts: DraftOutput[];
  draftLength: DraftLength;
  onDraftLengthChange: (length: DraftLength) => void;
  onEditDraft: (key: DraftOutput["key"], value: string) => void;
  onResetDraft: (key: DraftOutput["key"]) => void;
  onCopyDraft: (key: DraftOutput["key"]) => Promise<void>;
  onExportJson: () => void;
  onExportText: () => void;
}

export function DraftsPanel({
  drafts,
  draftLength,
  onDraftLengthChange,
  onEditDraft,
  onResetDraft,
  onCopyDraft,
  onExportJson,
  onExportText
}: DraftsPanelProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const grouped = useMemo(
    () => ({
      platform: drafts.filter((draft) => draft.platform !== "generic"),
      generic: drafts.filter((draft) => draft.platform === "generic")
    }),
    [drafts]
  );

  return (
    <section className="glass-card p-5 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="section-title">Generated Drafts</h2>
        <div className="flex flex-wrap gap-2">
          {(["short", "medium", "long"] as DraftLength[]).map((length) => (
            <button
              type="button"
              key={length}
              onClick={() => onDraftLengthChange(length)}
              className={`btn px-2 py-1 text-xs capitalize ${draftLength === length ? "bg-tide text-white" : "bg-slate-800 text-slate-200"}`}
            >
              {length === "long" ? "Longer" : length}
            </button>
          ))}
        </div>
      </div>

      {drafts.length === 0 ? (
        <p className="mt-3 text-sm text-slate-300">Drafts will appear here after metadata extraction and context setup.</p>
      ) : (
        <>
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" className="btn-ghost" onClick={onExportText}>
              Export as Text
            </button>
            <button type="button" className="btn-ghost" onClick={onExportJson}>
              Export as JSON
            </button>
          </div>

          <div className="mt-4 space-y-5">
            {grouped.platform.length > 0 ? (
              <div>
                <h3 className="mb-2 text-xs uppercase tracking-[0.2em] text-slate-300">Platform outputs</h3>
                <div className="grid gap-3 md:grid-cols-2">
                  {grouped.platform.map((draft) => (
                    <DraftCard
                      key={draft.key}
                      draft={draft}
                      onChange={(value) => onEditDraft(draft.key, value)}
                      onReset={() => onResetDraft(draft.key)}
                      onCopy={async () => {
                        await onCopyDraft(draft.key);
                        setCopiedKey(draft.key);
                        setTimeout(() => setCopiedKey((current) => (current === draft.key ? null : current)), 1000);
                      }}
                      copied={copiedKey === draft.key}
                    />
                  ))}
                </div>
              </div>
            ) : null}

            {grouped.generic.length > 0 ? (
              <div>
                <h3 className="mb-2 text-xs uppercase tracking-[0.2em] text-slate-300">Cross-platform outputs</h3>
                <div className="grid gap-3 md:grid-cols-2">
                  {grouped.generic.map((draft) => (
                    <DraftCard
                      key={draft.key}
                      draft={draft}
                      onChange={(value) => onEditDraft(draft.key, value)}
                      onReset={() => onResetDraft(draft.key)}
                      onCopy={async () => {
                        await onCopyDraft(draft.key);
                        setCopiedKey(draft.key);
                        setTimeout(() => setCopiedKey((current) => (current === draft.key ? null : current)), 1000);
                      }}
                      copied={copiedKey === draft.key}
                    />
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </>
      )}
    </section>
  );
}
