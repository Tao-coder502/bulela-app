
import { GoogleGenAI, Modality } from "@google/genai";

/**
 * Bulela Audio Engine (Phase 9)
 * Handles TTS (unary) and Live Conversations (streaming).
 */

export class AudioService {
  private static outCtx: AudioContext | null = null;

  static getAudioContext() {
    if (!this.outCtx) {
      this.outCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    return this.outCtx;
  }

  /**
   * Manual Base64 Decoding for Raw PCM
   */
  static decodeBase64(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  /**
   * Manual PCM to AudioBuffer Conversion
   */
  static async decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const buffer = ctx.createBuffer(1, dataInt16.length, sampleRate);
    const channelData = buffer.getChannelData(0);
    for (let i = 0; i < dataInt16.length; i++) {
      channelData[i] = dataInt16[i] / 32768.0;
    }
    return buffer;
  }

  /**
   * Gemini 2.5 TTS Integration with Mirror Rule Emphasis
   */
  static async speak(text: string, voice: 'Kore' | 'Zephyr' = 'Kore') {
    const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY || "";
    const ai = new GoogleGenAI({ apiKey });
    const ctx = this.getAudioContext();
    
    // Mirror Rule Emphasis: Wrap prefixes in emphasis markers if detected
    // This is a prompt-level instruction for the TTS model
    const emphasizedText = text.replace(/(Aba-|ba-|Chi-|Li-|Ku-)/g, '[[emphasis]] $1 [[/emphasis]]');
    
    try {
      // Check for ElevenLabs API Key in env
      const elevenLabsKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
      
      if (elevenLabsKey) {
        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'xi-api-key': elevenLabsKey
          },
          body: JSON.stringify({
            text: emphasizedText,
            model_id: 'eleven_monolingual_v1',
            voice_settings: { stability: 0.5, similarity_boost: 0.5 }
          })
        });
        
        if (response.ok) {
          const audioBlob = await response.blob();
          const arrayBuffer = await audioBlob.arrayBuffer();
          const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
          const source = ctx.createBufferSource();
          source.buffer = audioBuffer;
          source.connect(ctx.destination);
          source.start();
          return;
        }
      }

      // Fallback to Gemini TTS
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: `Speak this Bemba phrase with emphasis on the concord prefixes: ${text}` }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voice },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        const audioBytes = this.decodeBase64(base64Audio);
        const audioBuffer = await this.decodeAudioData(audioBytes, ctx, 24000);
        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(ctx.destination);
        source.start();
      }
    } catch (err) {
      console.error("[Bulela Audio] TTS Failed:", err);
    }
  }

  /**
   * Manual Base64 Encoding for Raw PCM (Microphone)
   */
  static encodeBase64(bytes: Uint8Array): string {
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }
}
