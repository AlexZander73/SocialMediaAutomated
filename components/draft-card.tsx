import { DraftOutput } from "@/lib/types";

interface DraftCardProps {
  draft: DraftOutput;
  onChange: (value: string) => void;
  onCopy: () => void;
  onReset: () => void;
  copied: boolean;
}

export function DraftCard({ draft, onChange, onCopy, onReset, copied }: DraftCardProps) {
  return (
    <article className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-white">{draft.label}</h3>
          {draft.description ? <p className="mt-1 text-xs text-slate-300">{draft.description}</p> : null}
        </div>
        <span className="soft-pill capitalize">{draft.platform}</span>
      </div>

      <textarea
        className="field-input mt-3 min-h-[120px] resize-y font-mono text-xs"
        value={draft.current}
        onChange={(event) => onChange(event.target.value)}
      />

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-slate-300">{draft.current.length} chars</p>
        <div className="flex gap-2">
          <button type="button" className="btn-ghost text-xs" onClick={onReset}>
            Reset to generated
          </button>
          <button type="button" className="btn-primary text-xs" onClick={onCopy}>
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>
    </article>
  );
}
