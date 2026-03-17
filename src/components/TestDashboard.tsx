
import React, { useState } from 'react';
import { PlacementOrchestrator } from '../services/PlacementOrchestrator';
import { AdaptiveEngine } from '../services/AdaptiveEngine';
import { PlacementResult, AdaptiveInput } from '../types';

const TestDashboard: React.FC = () => {
  const [placementResults, setPlacementResults] = useState<any[]>([]);
  const [adaptiveResult, setAdaptiveResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const runPlacementTests = () => {
    const testCases = [
      {
        name: "MWAYI Path (Failed Step 1)",
        results: [
          { id: 'step_1_hook', isCorrect: false },
          { id: 'step_2_ulemu', isCorrect: true },
          { id: 'step_3_tonal', isCorrect: true }
        ],
        expected: 'MWAYI'
      },
      {
        name: "CHIKONDI Path (Failed Step 2)",
        results: [
          { id: 'step_1_hook', isCorrect: true },
          { id: 'step_2_ulemu', isCorrect: false },
          { id: 'step_3_tonal', isCorrect: true }
        ],
        expected: 'CHIKONDI'
      },
      {
        name: "CHIKONDI Path (Failed Step 3)",
        results: [
          { id: 'step_1_hook', isCorrect: true },
          { id: 'step_2_ulemu', isCorrect: true },
          { id: 'step_3_tonal', isCorrect: false }
        ],
        expected: 'CHIKONDI'
      },
      {
        name: "DOLO Path (All Correct)",
        results: [
          { id: 'step_1_hook', isCorrect: true },
          { id: 'step_2_ulemu', isCorrect: true },
          { id: 'step_3_tonal', isCorrect: true }
        ],
        expected: 'DOLO'
      }
    ];

    const results = testCases.map(tc => {
      const actual = PlacementOrchestrator.getInitialTier(tc.results as PlacementResult[]);
      return {
        ...tc,
        actual,
        passed: actual === tc.expected
      };
    });

    setPlacementResults(results);
  };

  const runAdaptiveTest = async () => {
    setIsLoading(true);
    try {
      const input: AdaptiveInput = {
        language: 'Nyanja',
        language_rules: { hasTonality: true, nounClassCount: 18 },
        sentiment_score: 'Frustrated',
        error_type: 'Tone',
        user_level: 'Mwayi',
        current_task: 'Nyanja Tonal Minimal Pairs'
      };
      const result = await AdaptiveEngine.generateFeedback(input);
      setAdaptiveResult(result);
    } catch (error) {
      setAdaptiveResult({ error: String(error) });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-8 bg-white rounded-3xl shadow-sm border border-copper/10">
      <div className="space-y-4">
        <h2 className="text-2xl font-black text-charcoal uppercase tracking-tighter">Placement Logic Tests</h2>
        <button 
          onClick={runPlacementTests}
          className="px-6 py-2 bg-copper text-white font-bold rounded-xl hover:bg-copper-dark transition-colors"
        >
          Run Placement Tests
        </button>
        
        <div className="grid gap-4">
          {placementResults.map((res, i) => (
            <div key={i} className={`p-4 rounded-2xl border-2 ${res.passed ? 'border-success/20 bg-success/5' : 'border-rose-200 bg-rose-50'}`}>
              <div className="flex justify-between items-center">
                <span className="font-bold text-charcoal">{res.name}</span>
                <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase ${res.passed ? 'bg-success text-white' : 'bg-rose-500 text-white'}`}>
                  {res.passed ? 'Passed' : 'Failed'}
                </span>
              </div>
              <p className="text-xs text-charcoal/60 mt-1">Expected: {res.expected} | Actual: {res.actual}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4 pt-8 border-t border-copper/10">
        <h2 className="text-2xl font-black text-charcoal uppercase tracking-tighter">Adaptive Engine AI Test</h2>
        <p className="text-sm text-charcoal/60">Testing: FRUSTRATED + TONE Error (Should pivot to warm maternal tone)</p>
        <button 
          onClick={runAdaptiveTest}
          disabled={isLoading}
          className="px-6 py-2 bg-midnight text-white font-bold rounded-xl hover:bg-black transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Generating AI Feedback...' : 'Run Adaptive AI Test'}
        </button>

        {adaptiveResult && (
          <div className="p-6 bg-silk rounded-2xl border-2 border-copper/10 space-y-4">
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="font-black uppercase text-charcoal/40 block">Nyanja Feedback</span>
                <p className="font-bold text-charcoal text-sm mt-1">{adaptiveResult.personalized_feedback}</p>
              </div>
              <div>
                <span className="font-black uppercase text-charcoal/40 block">English Translation</span>
                <p className="font-bold text-charcoal/60 mt-1">{adaptiveResult.english_translation}</p>
              </div>
              <div>
                <span className="font-black uppercase text-charcoal/40 block">UI Action</span>
                <p className="font-bold text-copper mt-1">{adaptiveResult.ui_action}</p>
              </div>
              <div>
                <span className="font-black uppercase text-charcoal/40 block">Tone Map</span>
                <p className="font-bold text-success mt-1">{adaptiveResult.tone_map}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestDashboard;
