
import { TutorContext, BulelaResponse, AdaptiveInput, SentimentScore, ErrorType, UserLevel, PlacementMission } from "./types";
import { ErrorLibrary } from "./services/ErrorLibrary";
import { AdaptiveEngine } from "./services/AdaptiveEngine";
import { PlacementOrchestrator } from "./services/PlacementOrchestrator";

/**
 * AI TUTOR ORCHESTRATOR
 * Features: Usage Gating (SaaS), Adaptive Personality, Offline Fallback, Placement Missions.
 */
export async function generateBulelaResponse(context: TutorContext, isPro: boolean, currentAiUsage: number, token: string | null): Promise<BulelaResponse | null> {
  // Offline Fallback
  if (!navigator.onLine) {
    const err = ErrorLibrary.get(0);
    return {
      tutor_hint: err.persona,
      proverb_in_nyanja: "Amano mabulano.",
      concord_rule_id: "offline_fallback"
    };
  }

  // Server-side AI Tutor Call
  try {
    const response = await fetch('/api/ai/tutor', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ 
        userId: context.learnerId,
        context: {
          ...context,
          learnerTier: context.learnerTier,
          masteryGaps: context.masteryGaps,
          lastInput: context.lastInput
        }
      })
    });

    if (!response.ok) {
      const err = ErrorLibrary.get(response.status);
      return {
        tutor_hint: err.persona,
        proverb_in_nyanja: "",
        concord_rule_id: "api_error",
        isLocked: response.status === 429 || response.status === 403
      };
    }

    const data = await response.json();
    
    // The server returns { text, isLocked, engine }
    // We map it to BulelaResponse
    return {
      tutor_hint: data.text,
      proverb_in_nyanja: "", // Proverb is now part of the text if Gemma included it
      concord_rule_id: "ai_response",
      isLocked: data.isLocked,
      engine: data.engine
    };
  } catch (error) {
    console.error("[Bulela] AI Tutor API Failed:", error);
    return {
      tutor_hint: "My child, my memory fades like the afternoon sun. Focus on matching your prefixes.",
      proverb_in_nyanja: "Chala chimodzi sichiswa nsabwe.",
      concord_rule_id: "fallback_generic"
    };
  }
}

function mapSentiment(state: string): SentimentScore {
  if (state === 'FLOW') return 'Positive';
  if (state === 'FRICTION') return 'Confused';
  if (state === 'FRUSTRATED') return 'Frustrated';
  return 'Neutral';
}

function mapErrorType(mistakes: string[]): ErrorType {
  if (mistakes.length === 0) return 'Success';
  const last = mistakes[mistakes.length - 1].toLowerCase();
  if (last.includes('tone')) return 'Tone';
  if (last.includes('vocabulary')) return 'Vocabulary';
  return 'Grammar';
}

/**
 * Generates the initial placement mission for new users.
 */
export function getPlacementMission(): PlacementMission {
  return PlacementOrchestrator.generateMission();
}
