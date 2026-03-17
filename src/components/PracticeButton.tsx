
import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SpeechService } from '../services/SpeechService';
import { useBulelaStore } from '../store/useBulelaStore';

interface PracticeButtonProps {
  referenceText: string;
  onResult?: (score: number, text: string) => void;
}

export const PracticeButton: React.FC<PracticeButtonProps> = ({ referenceText, onResult }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const animationFrame = useRef<number | null>(null);
  const audioContext = useRef<AudioContext | null>(null);
  const analyser = useRef<AnalyserNode | null>(null);

  const { user } = useBulelaStore();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      // Setup Visualizer
      audioContext.current = new AudioContext();
      analyser.current = audioContext.current.createAnalyser();
      const source = audioContext.current.createMediaStreamSource(stream);
      source.connect(analyser.current);
      analyser.current.fftSize = 256;
      
      const bufferLength = analyser.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateLevel = () => {
        if (analyser.current) {
          analyser.current.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / bufferLength;
          setAudioLevel(average / 128); // Normalize to 0-1
          animationFrame.current = requestAnimationFrame(updateLevel);
        }
      };
      updateLevel();

      mediaRecorder.current.ondataavailable = (e) => {
        audioChunks.current.push(e.data);
      };

      mediaRecorder.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
        setIsProcessing(true);
        
        try {
          const result = await SpeechService.processSpeech(
            audioBlob, 
            user?.subscriptionTier === 'pro' ? 'pro' : 'free'
          );
          
          if (result.score !== undefined) {
            setScore(result.score);
            if (onResult) onResult(result.score, result.text);
          }
        } catch (error) {
          console.error("Speech processing failed", error);
        } finally {
          setIsProcessing(false);
        }
      };

      mediaRecorder.current.start();
      setIsRecording(true);
      setScore(null);
    } catch (err) {
      console.error("Microphone access denied", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      setIsRecording(false);
      if (animationFrame.current) cancelAnimationFrame(animationFrame.current);
      setAudioLevel(0);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <AnimatePresence>
          {isRecording && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ 
                scale: 1 + audioLevel * 0.5,
                opacity: 0.2,
              }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="absolute inset-0 bg-copper rounded-full blur-xl"
            />
          )}
        </AnimatePresence>

        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isProcessing}
          className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-lg ${
            isRecording 
              ? 'bg-rose-500 hover:bg-rose-600' 
              : 'bg-copper hover:bg-copper-light'
          } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isProcessing ? (
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          ) : isRecording ? (
            <Square className="w-8 h-8 text-white fill-current" />
          ) : (
            <Mic className="w-8 h-8 text-white" />
          )}
        </button>
      </div>

      <AnimatePresence>
        {score !== null && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold ${
              score > 70 ? 'bg-emerald/20 text-emerald-light' : 'bg-rose-500/20 text-rose-500'
            }`}
          >
            {score > 70 ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span>Pronunciation Score: {score}%</span>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="text-sm text-white/60 italic">
        {isRecording ? 'Listening...' : isProcessing ? 'Analyzing...' : `Say: "${referenceText}"`}
      </p>
    </div>
  );
};
