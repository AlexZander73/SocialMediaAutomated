interface AppHeaderProps {
  onOpenSettings: () => void;
  onRestoreSession: () => void;
  hasRestorableSession: boolean;
  onLoadExample: () => void;
}

export function AppHeader({ onOpenSettings, onRestoreSession, hasRestorableSession, onLoadExample }: AppHeaderProps) {
  return (
    <header className="glass-card relative overflow-hidden p-6 md:p-8">
      <div className="absolute -right-10 top-6 h-28 w-28 rounded-full bg-ember/20 blur-2xl" aria-hidden />
      <div className="absolute -left-16 bottom-2 h-24 w-24 rounded-full bg-tide/20 blur-2xl" aria-hidden />

      <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="max-w-3xl animate-fade-up">
          <p className="mb-3 inline-flex items-center rounded-full border border-tide/40 bg-tide/20 px-3 py-1 text-xs uppercase tracking-[0.2em] text-teal-100">
            Local-first MVP
          </p>
          <h1 className="font-display text-3xl text-white sm:text-4xl">Social Post Helper</h1>
          <p className="mt-3 max-w-2xl text-sm text-slate-200 sm:text-base">
            Upload photos and video, extract metadata, and generate editable social post drafts with deterministic rules only.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={onOpenSettings} className="btn-primary">
            Preferences
          </button>
          <button type="button" onClick={onLoadExample} className="btn-ghost">
            Load Example
          </button>
          <button type="button" onClick={onRestoreSession} disabled={!hasRestorableSession} className="btn-ghost disabled:opacity-40">
            Reopen Last Session
          </button>
        </div>
      </div>
    </header>
  );
}
