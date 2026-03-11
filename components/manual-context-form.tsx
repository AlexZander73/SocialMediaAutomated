import { CATEGORIES, CATEGORY_LABELS } from "@/lib/constants";
import { ContentCategory, ManualInputs } from "@/lib/types";

interface ManualContextFormProps {
  category: ContentCategory;
  manualInputs: ManualInputs;
  onCategoryChange: (category: ContentCategory) => void;
  onManualInputChange: (value: ManualInputs) => void;
}

export function ManualContextForm({ category, manualInputs, onCategoryChange, onManualInputChange }: ManualContextFormProps) {
  return (
    <section className="glass-card p-5 md:p-6">
      <h2 className="section-title">Context Inputs</h2>
      <p className="mt-1 text-sm text-slate-300">These fields feed deterministic templates. They are not AI prompts.</p>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <label className="field-label" htmlFor="category-select">
            Content category
          </label>
          <select
            id="category-select"
            value={category}
            onChange={(event) => onCategoryChange(event.target.value as ContentCategory)}
            className="field-input"
          >
            {CATEGORIES.map((option) => (
              <option key={option} value={option}>
                {CATEGORY_LABELS[option]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="field-label" htmlFor="who-for-input">
            Who is this for? (optional)
          </label>
          <input
            id="who-for-input"
            value={manualInputs.whoIsThisFor}
            onChange={(event) => onManualInputChange({ ...manualInputs, whoIsThisFor: event.target.value })}
            className="field-input"
            placeholder="Team updates, customers, friends, subscribers..."
          />
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <label className="field-label" htmlFor="what-happened-input">
            What happened? (optional)
          </label>
          <textarea
            id="what-happened-input"
            value={manualInputs.whatHappened}
            onChange={(event) => onManualInputChange({ ...manualInputs, whatHappened: event.target.value })}
            className="field-input min-h-[110px]"
            placeholder="Example: Finished the frame build and tested alignment."
          />
        </div>

        <div>
          <label className="field-label" htmlFor="extra-notes-input">
            Extra notes (optional)
          </label>
          <textarea
            id="extra-notes-input"
            value={manualInputs.extraNotes}
            onChange={(event) => onManualInputChange({ ...manualInputs, extraNotes: event.target.value })}
            className="field-input min-h-[110px]"
            placeholder="Add specifics you want included in deterministic templates."
          />
        </div>
      </div>
    </section>
  );
}
