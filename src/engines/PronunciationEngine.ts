
/**
 * Bulela Pronunciation Engine
 * Uses Dynamic Time Warping (DTW) to compare audio sequences.
 */

export interface PronunciationResult {
  score: number;
  frictionPoint: number; // Index where divergence is highest
}

export class PronunciationEngine {
  /**
   * Simple DTW implementation for sequence comparison
   */
  static compare(ref: number[], user: number[]): PronunciationResult {
    const n = ref.length;
    const m = user.length;
    
    if (n === 0 || m === 0) return { score: 0, frictionPoint: 0 };

    // Initialize DTW matrix
    const dtw = Array(n + 1).fill(0).map(() => Array(m + 1).fill(Infinity));
    dtw[0][0] = 0;

    let maxDiff = 0;
    let frictionPoint = 0;

    for (let i = 1; i <= n; i++) {
      for (let j = 1; j <= m; j++) {
        const cost = Math.abs(ref[i - 1] - user[j - 1]);
        dtw[i][j] = cost + Math.min(dtw[i - 1][j], dtw[i][j - 1], dtw[i - 1][j - 1]);
        
        if (cost > maxDiff) {
          maxDiff = cost;
          frictionPoint = i - 1;
        }
      }
    }

    const distance = dtw[n][m];
    // Normalize score: 100 is perfect match, 0 is very different
    // We use a heuristic for normalization based on sequence length
    const maxPossibleDistance = Math.max(n, m) * 1.0; // Assuming normalized features [0,1]
    const score = Math.max(0, Math.min(100, 100 * (1 - distance / (maxPossibleDistance || 1))));

    return {
      score: Math.round(score),
      frictionPoint
    };
  }

  /**
   * Mock feature extraction (in a real app, this would use Web Audio API Analyzer)
   */
  static extractFeatures(audioData: Float32Array): number[] {
    // Simplified: Use energy envelopes as features for the MVP
    const windowSize = 1024;
    const features: number[] = [];
    
    for (let i = 0; i < audioData.length; i += windowSize) {
      let sum = 0;
      const end = Math.min(i + windowSize, audioData.length);
      for (let j = i; j < end; j++) {
        sum += audioData[j] * audioData[j];
      }
      features.push(Math.sqrt(sum / (end - i)));
    }
    
    return features;
  }
}
