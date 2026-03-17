export type LearnerState = 'FLOW' | 'FRICTION' | 'BOREDOM' | 'FRUSTRATED';
export type UIAction = 'ADVANCE_LEVEL' | 'SHOW_HINT' | 'CULTURAL_RIDDLE' | 'SIMPLIFIED_EXPLANATION';

export class SentimentService {
  async analyze(behaviorData: any, textInput?: string, token?: string) {
    // 1. Primary: Rule-based Behavioral Heuristics (Deterministic, Fast, Offline-capable)
    let sentiment: LearnerState = 'FLOW';

    const { errorCount, attempts, wrongStreak, durationMs } = behaviorData;

    if (wrongStreak > 2 || errorCount > 3) {
      sentiment = 'FRICTION';
    }
    
    if (wrongStreak > 4) {
      sentiment = 'FRUSTRATED';
    }

    if (durationMs > 60000 && attempts < 2) {
      sentiment = 'BOREDOM';
    }

    // 2. Secondary: AI-powered Text Sentiment (Optional, for Tutor Conversations)
    if (textInput && token) {
      const HF_API_URL = "https://api-inference.huggingface.co/models/cardiffnlp/twitter-xlm-roberta-base-sentiment";
      
      try {
        const hfResponse = await fetch(HF_API_URL, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ inputs: textInput }),
        });

        if (hfResponse.ok) {
          const result = await hfResponse.json();
          const topResult = result[0]?.sort((a: any, b: any) => b.score - a.score)[0];
          
          if (topResult?.label === 'LABEL_0' && topResult.score > 0.7) {
            if (sentiment === 'FLOW') sentiment = 'FRICTION';
          }
        }
      } catch (e) {
        console.error("[Sentiment] HF API failed, staying with behavioral rules", e);
      }
    }

    // 3. Map to UI Actions
    let recommendedAction: UIAction = 'ADVANCE_LEVEL';
    switch (sentiment) {
      case 'FLOW':
        recommendedAction = 'ADVANCE_LEVEL'; // harder challenge
        break;
      case 'BOREDOM':
        recommendedAction = 'CULTURAL_RIDDLE';
        break;
      case 'FRUSTRATED':
        recommendedAction = 'SIMPLIFIED_EXPLANATION';
        break;
      case 'FRICTION':
        recommendedAction = 'SHOW_HINT';
        break;
    }

    return {
      state: sentiment,
      recommendedAction
    };
  }
}
