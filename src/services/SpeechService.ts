
import { PronunciationEngine } from '../engines/PronunciationEngine';

export interface SpeechResult {
  text: string;
  score?: number;
  frictionPoint?: number;
  isOffline: boolean;
}

export class SpeechService {
  private static worker: Worker | null = null;

  static init() {
    if (!this.worker) {
      this.worker = new Worker(new URL('../workers/audio.worker.ts', import.meta.url), {
        type: 'module'
      });
    }
  }

  static async processSpeech(
    audioBlob: Blob, 
    tier: 'free' | 'pro', 
    referenceAudio?: Float32Array
  ): Promise<SpeechResult> {
    const isOnline = navigator.onLine;
    
    if (tier === 'pro' && isOnline) {
      return this.processCloudSTT(audioBlob);
    } else {
      return this.processLocalSTT(audioBlob, referenceAudio);
    }
  }

  private static async processCloudSTT(audioBlob: Blob): Promise<SpeechResult> {
    const formData = new FormData();
    formData.append('audio', audioBlob);

    try {
      const response = await fetch('/api/stt', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Cloud STT failed (${response.status}): ${text || response.statusText}`);
      }
      
      const text = await response.text();
      
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error(`Cloud STT returned non-JSON response: ${text.substring(0, 100)}`);
      }

      if (!text) throw new Error("Empty response from Cloud STT");
      const data = JSON.parse(text);
      return {
        text: data.text,
        score: data.score,
        isOffline: false
      };
    } catch (error) {
      console.warn("Cloud STT failed, falling back to local", error);
      return this.processLocalSTT(audioBlob);
    }
  }

  private static async processLocalSTT(audioBlob: Blob, referenceAudio?: Float32Array): Promise<SpeechResult> {
    this.init();
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        const arrayBuffer = reader.result as ArrayBuffer;
        const audioContext = new AudioContext();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        const channelData = audioBuffer.getChannelData(0);

        this.worker!.onmessage = (e) => {
          if (e.data.status === 'result') {
            let score, frictionPoint;
            
            if (referenceAudio) {
              const userFeatures = PronunciationEngine.extractFeatures(channelData);
              const refFeatures = PronunciationEngine.extractFeatures(referenceAudio);
              const comparison = PronunciationEngine.compare(refFeatures, userFeatures);
              score = comparison.score;
              frictionPoint = comparison.frictionPoint;
            }

            resolve({
              text: e.data.text,
              score,
              frictionPoint,
              isOffline: true
            });
          } else if (e.data.status === 'error') {
            reject(new Error(e.data.error));
          }
        };

        this.worker!.postMessage({
          type: 'transcribe',
          audio: channelData.buffer,
          sampleRate: audioBuffer.sampleRate
        }, [channelData.buffer]);
      };
      reader.readAsArrayBuffer(audioBlob);
    });
  }
}
