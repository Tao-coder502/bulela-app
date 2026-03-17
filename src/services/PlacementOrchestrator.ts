import { PlacementMission, PlacementStep, PlacementResult, ProficiencyPath } from "../types";

/**
 * BULELA PLACEMENT ORCHESTRATOR
 * Generates a 3-step "Placement Mission" to determine initial proficiency.
 */
export class PlacementOrchestrator {
  static generateMission(): PlacementMission {
    const steps: PlacementStep[] = [
      {
        id: "step_1_hook",
        task: "Choose the correct response to 'Muli bwanji?'",
        options: ["Ndili bwino", "Zikomo", "Muli bwanji"],
        correctAnswer: "Ndili bwino",
        onWrongPath: "MWAYI",
        onRightContinue: true
      },
      {
        id: "step_2_ulemu",
        task: "How do you greet an elder you just met? (Ulemu/Respect Test)",
        options: ["Muli bwanji", "Muli bwanji amama/atate", "Bwanji"],
        correctAnswer: "Muli bwanji amama/atate",
        onWrongPath: "CHIKONDI",
        onRightContinue: true
      },
      {
        id: "step_3_tonal",
        task: "Identify the meaning of 'Mtengo' in the phrase 'Gula mtengo'.",
        options: ["Tree", "Price", "Forest"],
        correctAnswer: "Price",
        onWrongPath: "CHIKONDI", // If they get here but fail, they are still better than MWAYI but not DOLO
        onRightContinue: false // This is the final step
      }
    ];

    return { steps };
  }

  /**
   * Bulela Placement Logic Handler
   * Evaluates the mission results to determine final proficiency path.
   */
  static getInitialTier(results: PlacementResult[]): ProficiencyPath {
    const step1 = results.find(r => r.id === 'step_1_hook');
    const step2 = results.find(r => r.id === 'step_2_ulemu');
    const step3 = results.find(r => r.id === 'step_3_tonal');

    // 1. The "Mwayi" Exit: Failed the basic greeting
    if (!step1?.isCorrect) return 'MWAYI';

    // 2. The "Chikondi" Path: Got greetings right, but missed Ulemu or Tone
    if (!step2?.isCorrect || !step3?.isCorrect) return 'CHIKONDI';

    // 3. The "Dolo" Ascension: 3/3 Correct
    return 'DOLO';
  }

  /**
   * Legacy compatibility method
   */
  static evaluateResults(results: boolean[]): ProficiencyPath {
    const placementResults: PlacementResult[] = [
      { id: 'step_1_hook', isCorrect: results[0] || false },
      { id: 'step_2_ulemu', isCorrect: results[1] || false },
      { id: 'step_3_tonal', isCorrect: results[2] || false }
    ];
    return this.getInitialTier(placementResults);
  }
}
