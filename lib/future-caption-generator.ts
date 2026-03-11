import { ContentContext, UserPreferences } from "@/lib/types";

export interface FutureCaptionGenerator {
  /**
   * TODO (future LLM integration): Use richer image/video understanding and rewrite drafts.
   */
  generateEnhancedDrafts(context: ContentContext, preferences: UserPreferences): Promise<Record<string, string>>;
}

/**
 * Placeholder for future AI-powered generation. Keeping this interface isolated makes upgrades low-risk.
 */
export class NoopFutureCaptionGenerator implements FutureCaptionGenerator {
  async generateEnhancedDrafts(): Promise<Record<string, string>> {
    return {};
  }
}
