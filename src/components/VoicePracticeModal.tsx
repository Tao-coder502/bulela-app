
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { useBulelaStore } from '../store/useBulelaStore';
import { AudioService } from '../services/AudioService';
import UpgradeModal from './UpgradeModal';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialTopic: string;
}

import BulelaMascot from './BulelaMascot';

const VoicePracticeModal: React.FC<Props> = ({ isOpen, onClose, initialTopic }) => {
  const { user, isPro, incrementAiUsage } = useBulelaStore();
  const [status, setStatus] = useState<'idle' | 'connecting' | 'listening' | 'speaking' | 'error'>('idle');
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  
  const [targetSentence, setTargetSentence] = useState<string>('');
  const [userTranscription, setUserTranscription] = useState<string>('');
  const [feedback, setFeedback] = useState<string>('');
  const [isRecording, setIsRecording] = useState(false);

  const recognitionRef = useRef<any>(null);

  // Gatekeeping
  const canUseVoice = isPro || (user?.role === 'teacher') || (user?.role === 'moe_admin');

  useEffect(() => {
    if (isOpen && canUseVoice) {
      generateTargetSentence();
    }
  }, [isOpen]);

  const generateTargetSentence = async () => {
    setStatus('connecting');
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-preview',
        contents: `Generate a simple Bemba sentence for a beginner to practice pronunciation. Topic: ${initialTopic}. Return only the sentence.`,
      });
      const sentence = response.text?.trim() || 'Abantu basuma.';
      setTargetSentence(sentence);
      setStatus('speaking');
      await AudioService.speak(sentence);
      setStatus('idle');
    } catch (err) {
      console.error("Failed to generate sentence:", err);
      setStatus('error');
    }
  };

  const startRecording = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US'; // Bemba isn't usually supported, so we'll use English and let Gemini handle the phonetic mess
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsRecording(true);
      setStatus('listening');
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setUserTranscription(transcript);
      analyzePronunciation(transcript);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsRecording(false);
      setStatus('error');
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setUserTranscription(transcript);
      analyzePronunciation(transcript);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsRecording(false);
      setStatus('error');
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const analyzePronunciation = async (transcript: string) => {
    setStatus('connecting');
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-preview',
        contents: `
          Target Bemba Sentence: "${targetSentence}"
          User's Phonetic Transcription (from Speech-to-Text): "${transcript}"
          
          Compare the two. Provide feedback on the user's "Bantu Rhythm" and pronunciation. 
          Be encouraging like Bulela (a wise guide). 
          If it's close, praise them. If not, explain how the prefixes should flow.
          Keep it to 2 sentences.
        `,
      });
      const feedbackText = response.text?.trim() || 'Good effort, my child.';
      setFeedback(feedbackText);
      setStatus('speaking');
      await AudioService.speak(feedbackText);
      setStatus('idle');
      incrementAiUsage();
    } catch (err) {
      console.error("Analysis failed:", err);
      setStatus('error');
    }
  };

  if (!isOpen) return null;

  if (!canUseVoice) {
    return (
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-silk/60 backdrop-blur-md animate-in fade-in">
        <div className="bg-white w-full max-w-md rounded-[3rem] p-8 text-center border-4 border-copper shadow-2xl">
           <span className="text-6xl mb-4 block">🤐</span>
           <h2 className="text-2xl font-black text-charcoal uppercase italic mb-2">Voice Locked</h2>
           <p className="text-charcoal/40 font-bold mb-6 text-sm italic">"A silent drum makes no music." — Upgrade to Pro to talk with Bulela.</p>
           <div className="flex flex-col gap-3">
             <button onClick={() => setIsPricingOpen(true)} className="w-full py-4 bg-copper text-white font-black rounded-2xl shadow-lg hover:scale-105 active:scale-95 transition-all">UPGRADE TO PRO</button>
             <button onClick={onClose} className="text-xs font-black text-charcoal/40 uppercase tracking-widest py-2">Maybe later</button>
           </div>
           <UpgradeModal isOpen={isPricingOpen} onClose={() => setIsPricingOpen(false)} />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-silk/80 backdrop-blur-xl animate-in zoom-in duration-300">
      <div className="bg-white w-full max-w-xl rounded-[4rem] overflow-hidden shadow-2xl border-4 border-copper relative p-12 text-center flex flex-col items-center">
        
        <button onClick={onClose} className="absolute top-8 right-8 text-charcoal/20 hover:text-copper transition-colors">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <div className="mb-8">
           <div className="relative">
             <div className={`w-32 h-32 bg-silk rounded-full flex items-center justify-center border-4 border-copper shadow-xl relative z-10 transition-transform ${status === 'speaking' ? 'scale-110' : ''} overflow-hidden`}>
               <BulelaMascot mood={status === 'speaking' ? 'celebrate' : 'float'} className="w-24 h-24" />
             </div>
             {status === 'listening' && (
               <div className="absolute inset-0 bg-copper/20 rounded-full animate-ping scale-150"></div>
             )}
             {status === 'speaking' && (
               <div className="absolute inset-0 flex items-center justify-center">
                 <div className="w-40 h-40 border-4 border-success rounded-full animate-spin border-t-transparent opacity-30"></div>
               </div>
             )}
           </div>
        </div>

        <div className="space-y-2 mb-10">
          <h2 className="text-3xl font-black text-charcoal italic uppercase tracking-tighter">
            Conversation with <span className="text-copper">Bulela</span>
          </h2>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-charcoal/40">Topic: {initialTopic}</p>
        </div>

        <div className="w-full bg-silk rounded-3xl p-8 border-2 border-copper/10 flex flex-col items-center gap-6 min-h-[220px] justify-center">
          {status === 'connecting' && <p className="text-copper font-bold animate-pulse">Summoning Bulela's spirit...</p>}
          
          {targetSentence && status !== 'connecting' && (
            <div className="space-y-4 w-full">
              <div className="bg-white p-6 rounded-2xl border border-copper/10 shadow-sm">
                <p className="text-[10px] font-black text-charcoal/40 uppercase tracking-widest mb-2">Repeat after Bulela:</p>
                <p className="text-2xl font-black text-charcoal italic">"{targetSentence}"</p>
                <button 
                  onClick={() => AudioService.speak(targetSentence)}
                  className="mt-3 text-xs font-bold text-copper flex items-center gap-2 hover:opacity-80"
                >
                  <span>🔊</span> Listen Again
                </button>
              </div>

              {feedback && (
                <div className="bg-success/5 p-4 rounded-2xl border border-success/20 animate-in fade-in slide-in-from-top-2">
                  <p className="text-sm font-medium text-success leading-relaxed italic">"{feedback}"</p>
                </div>
              )}

              {!isRecording && !feedback && status === 'idle' && (
                <button 
                  onClick={startRecording}
                  className="w-full py-4 bg-copper text-white font-black rounded-2xl shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                  <span className="text-xl">🎤</span> START RECORDING
                </button>
              )}

              {isRecording && (
                <div className="flex flex-col items-center gap-3 animate-pulse">
                  <div className="w-12 h-12 bg-rose-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-rose-500/20">
                    <div className="w-4 h-4 bg-white rounded-sm"></div>
                  </div>
                  <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Recording... Speak now</p>
                </div>
              )}
            </div>
          )}

          {status === 'error' && (
            <div className="text-rose-500 font-bold space-y-2">
               <p>The digital winds are too strong today.</p>
               <p className="text-xs opacity-60">Check your internet or microphone permissions.</p>
            </div>
          )}
        </div>

        <div className="mt-12 flex gap-4 w-full">
          <button 
            onClick={generateTargetSentence}
            disabled={status !== 'idle'}
            className="flex-1 py-4 bg-copper/5 text-copper font-black rounded-2xl hover:bg-copper/10 transition-all uppercase tracking-widest text-xs border-2 border-copper/10 disabled:opacity-50"
          >
            New Sentence
          </button>
          <button 
            onClick={onClose}
            className="flex-1 py-4 bg-silk text-charcoal/40 font-black rounded-2xl hover:bg-silk/80 transition-all uppercase tracking-widest text-xs"
          >
            End Practice
          </button>
        </div>

      </div>
    </div>
  );
};

export default VoicePracticeModal;
