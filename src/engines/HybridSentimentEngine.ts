
import { SentimentEngine, LearnerState, LearnerMetrics } from './SentimentEngine';
import { mockSentimentInference } from '../utils/mockInference';
// @ts-ignore - Vite handles ?worker imports
// import SentimentWorker from '../workers/sentiment.worker?worker';

export interface BlendedSentiment {
  state: LearnerState;
  score: number;
  nlpLabel: string;
  nlpScore: number;
}

export class HybridSentimentEngine {
  private worker: Worker | null = null;
  private onReadyCallbacks: (() => void)[] = [];
  private onResultCallback: ((res: BlendedSentiment) => void) | null = null;
  public isReady = false;
  private useFallback = false;
  private useMock = true;

  constructor() {
    if (this.useMock) {
      this.initMock();
    } else {
      // this.initWorker(); // Disabled for UI polish
      this.isReady = true;
      this.triggerReady();
    }
  }

  private initMock() {
    console.log("[Bulela AI] Initializing MOCK Sentiment Engine for UI polish...");
    // Simulate loading delay
    setTimeout(() => {
      this.isReady = true;
      this.triggerReady();
    }, 1000);
  }

  private initWorker() {
    // Disabled
  }

  private activateFallback() {
    console.warn("[Bulela AI] Falling back to Deterministic Sentiment Engine (Layer 1 only). AI Worker blocked or failed.");
    this.useFallback = true;
    this.isReady = true; // Mark as ready so the UI stops showing loaders
    this.triggerReady();
  }

  private triggerReady() {
    this.onReadyCallbacks.forEach(cb => cb());
    this.onReadyCallbacks = [];
  }

  onReady(cb: () => void) {
    if (this.isReady) {
      cb();
    } else {
      this.onReadyCallbacks.push(cb);
    }
  }

  /**
   * Layer 2 Logic: Blending
   */
  async analyze(metrics: LearnerMetrics, textInput: string, callback: (res: BlendedSentiment) => void) {
    if (this.useMock) {
      // Show 'AI is thinking' state by delaying the response
      const mockRes = await mockSentimentInference(textInput);
      const nlp = mockRes.results[0];
      const deterministic = SentimentEngine.calculateSentiment(metrics);
      
      let finalState = deterministic.state;
      let finalScore = deterministic.score;

      if (nlp.label === 'negative' && nlp.score > 0.7 && finalState === 'FLOW') {
        finalState = 'FRICTION';
        finalScore = 0.5;
      }

      callback({
        state: finalState,
        score: finalScore,
        nlpLabel: nlp.label,
        nlpScore: nlp.score
      });
      return;
    }

    if (this.useFallback || !this.worker) {
      const deterministic = SentimentEngine.calculateSentiment(metrics);
      return callback({
        state: deterministic.state,
        score: deterministic.score,
        nlpLabel: 'fallback_active',
        nlpScore: 0
      });
    }

    this.onResultCallback = (res) => {
      const deterministic = SentimentEngine.calculateSentiment(metrics);
      let finalState = deterministic.state;
      let finalScore = deterministic.score;

      // Proactive Friction Detection via NLP
      if (res.nlpLabel === 'negative' && res.nlpScore > 0.7 && finalState === 'FLOW') {
        finalState = 'FRICTION';
        finalScore = 0.5;
      }

      callback({
        ...res,
        state: finalState,
        score: finalScore
      });
    };

    this.worker.postMessage({ type: 'classify', text: textInput });
  }
}

export const hybridEngine = new HybridSentimentEngine();
