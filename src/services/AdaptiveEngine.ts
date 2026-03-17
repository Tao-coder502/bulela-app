import { GoogleGenAI, Type } from "@google/genai";
import { AdaptiveInput, AdaptiveResponse } from "../types";

/**
 * BULELA ADAPTIVE ENGINE
 * Orchestrates the relationship between User Sentiment and Pedagogical Content (Nyanja Tonality & Grammar).
 */
export class AdaptiveEngine {
  private static ROLE = `
    You are the Bulela Universal Linguistic Engine. You are language-agnostic and orchestrate the relationship between User Sentiment and any target language's structural DNA (Tonality, Grammar, Noun Classes).
  `;

  private static ADAPTIVE_LOGIC = `
    ## THE UNIVERSAL ADAPTIVE LOGIC
    - If FRUSTRATED + [Linguistic Error]: Do NOT re-test the specific error. Pivot to a "Context-First" explanation using the cultural theme of the target language. Use a warm, supportive tone.
    - If CONFUSED + [Structural Error]: Break the linguistic rule down into a 3-word "Micro-Task." 
    - If POSITIVE + SUCCESS: Trigger a "Dolo" challenge. Increase difficulty immediately to maintain flow state.
    - TONAL RULE: If the target language has tonality, every word in the 'personalized_feedback' must include Tone Metadata (H for High, L for Low) in the response.
  `;

  static async generateFeedback(input: AdaptiveInput): Promise<AdaptiveResponse> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Target Language: ${input.language}. Rules: ${JSON.stringify(input.language_rules)}. Input: ${JSON.stringify(input)}`,
        config: {
          systemInstruction: `${this.ROLE}\n${this.ADAPTIVE_LOGIC}`,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              personalized_feedback: { 
                type: Type.STRING,
                description: "Feedback in the target language addressing the user's specific emotion"
              },
              english_translation: { type: Type.STRING },
              ui_action: { 
                type: Type.STRING,
                description: "CHANGE_COLOR | SHOW_HINT | SIMPLIFY_TASK | NONE"
              },
              tone_map: { 
                type: Type.STRING, 
                description: "Phonetic tone map if applicable (e.g., H/L markers)"
              },
              next_step_difficulty: { 
                type: Type.STRING,
                description: "EASY | MEDIUM | HARD"
              }
            },
            required: [
              "personalized_feedback", 
              "english_translation", 
              "ui_action", 
              "tone_map", 
              "next_step_difficulty"
            ]
          }
        }
      });

      const jsonStr = response.text?.trim();
      if (!jsonStr) throw new Error("Adaptive Engine: Empty response");

      return JSON.parse(jsonStr) as AdaptiveResponse;
    } catch (error) {
      console.error("[Bulela Adaptive Engine] Failed:", error);
      // Fallback
      return {
        personalized_feedback: "Mwayi, tiyeni tiyese kachiwiri.",
        english_translation: "Friend, let's try again.",
        ui_action: "SHOW_HINT",
        tone_map: "Mwa-yi(H)",
        next_step_difficulty: "EASY"
      };
    }
  }
}
