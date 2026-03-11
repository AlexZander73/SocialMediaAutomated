import { DEFAULT_PREFERENCES, TONE_LABELS } from "@/lib/constants";
import { DraftLength, LocationFormat, SpellingStyle, ToneStyle, UserPreferences } from "@/lib/types";

interface SettingsDrawerProps {
  open: boolean;
  preferences: UserPreferences;
  onClose: () => void;
  onUpdate: (next: UserPreferences) => void;
}

const locationLabels: Record<LocationFormat, string> = {
  full: "Full place name",
  "city-region": "City / region only",
  coordinates: "Coordinates only",
  hidden: "Hidden"
};

const draftLengthLabels: Record<DraftLength, string> = {
  short: "Short",
  medium: "Medium",
  long: "Longer"
};

const spellingLabels: Record<SpellingStyle, string> = {
  us: "US English",
  uk: "UK English"
};

export function SettingsDrawer({ open, preferences, onClose, onUpdate }: SettingsDrawerProps) {
  return (
    <>
      {open ? <button type="button" className="fixed inset-0 z-30 bg-slate-950/70" aria-label="Close settings" onClick={onClose} /> : null}
      <aside
        className={`fixed right-0 top-0 z-40 h-full w-full max-w-md transform border-l border-white/10 bg-slate-950/95 p-6 shadow-2xl transition ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between">
          <h2 className="section-title">Preferences</h2>
          <button type="button" onClick={onClose} className="btn-ghost px-2 py-1 text-xs">
            Close
          </button>
        </div>

        <div className="mt-5 space-y-4 overflow-y-auto pb-12">
          <div>
            <p className="field-label">Tone style</p>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(TONE_LABELS) as ToneStyle[]).map((tone) => (
                <button
                  key={tone}
                  type="button"
                  onClick={() => onUpdate({ ...preferences, tone })}
                  className={`btn ${preferences.tone === tone ? "bg-tide text-white" : "bg-slate-800 text-slate-200"}`}
                >
                  {TONE_LABELS[tone]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="field-label">Default platforms</p>
            <div className="space-y-2 rounded-xl border border-slate-700/70 bg-slate-900/70 p-3">
              {(["instagram", "facebook", "youtube"] as const).map((platform) => (
                <label key={platform} className="flex items-center gap-2 text-sm text-slate-200">
                  <input
                    type="checkbox"
                    checked={preferences.platforms[platform]}
                    onChange={(event) =>
                      onUpdate({
                        ...preferences,
                        platforms: {
                          ...preferences.platforms,
                          [platform]: event.target.checked
                        }
                      })
                    }
                  />
                  <span className="capitalize">{platform}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="field-label" htmlFor="hashtag-count">
              Preferred hashtag count ({preferences.hashtagCount})
            </label>
            <input
              id="hashtag-count"
              type="range"
              min={1}
              max={20}
              value={preferences.hashtagCount}
              onChange={(event) => onUpdate({ ...preferences, hashtagCount: Number(event.target.value) })}
              className="w-full"
            />
          </div>

          <div>
            <label className="field-label" htmlFor="location-format">
              Location formatting
            </label>
            <select
              id="location-format"
              value={preferences.locationFormat}
              onChange={(event) => onUpdate({ ...preferences, locationFormat: event.target.value as LocationFormat })}
              className="field-input"
            >
              {(Object.keys(locationLabels) as LocationFormat[]).map((option) => (
                <option key={option} value={option}>
                  {locationLabels[option]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="field-label" htmlFor="draft-length-default">
              Default draft length
            </label>
            <select
              id="draft-length-default"
              value={preferences.draftLength}
              onChange={(event) => onUpdate({ ...preferences, draftLength: event.target.value as DraftLength })}
              className="field-input"
            >
              {(Object.keys(draftLengthLabels) as DraftLength[]).map((option) => (
                <option key={option} value={option}>
                  {draftLengthLabels[option]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="field-label" htmlFor="spelling-style">
              Spelling style
            </label>
            <select
              id="spelling-style"
              value={preferences.spelling}
              onChange={(event) => onUpdate({ ...preferences, spelling: event.target.value as SpellingStyle })}
              className="field-input"
            >
              {(Object.keys(spellingLabels) as SpellingStyle[]).map((option) => (
                <option key={option} value={option}>
                  {spellingLabels[option]}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2 rounded-xl border border-slate-700/70 bg-slate-900/70 p-3">
            <label className="flex items-center gap-2 text-sm text-slate-200">
              <input
                type="checkbox"
                checked={preferences.includeDates}
                onChange={(event) => onUpdate({ ...preferences, includeDates: event.target.checked })}
              />
              Include dates in drafts
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-200">
              <input
                type="checkbox"
                checked={preferences.includeEmojis}
                onChange={(event) => onUpdate({ ...preferences, includeEmojis: event.target.checked })}
              />
              Include emojis
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-200">
              <input
                type="checkbox"
                checked={preferences.enableReverseGeocoding}
                onChange={(event) => onUpdate({ ...preferences, enableReverseGeocoding: event.target.checked })}
              />
              Enable free reverse geocoding
            </label>
          </div>

          <button type="button" className="btn-ghost w-full" onClick={() => onUpdate(DEFAULT_PREFERENCES)}>
            Reset to defaults
          </button>
        </div>
      </aside>
    </>
  );
}
