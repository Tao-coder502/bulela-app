
import { QuizQuestion } from './types';

export const quizBank: Record<string, QuizQuestion[]> = {
  lesson_1_greetings: [
    {
      id: 'q1_1',
      type: 'multiple-choice',
      question: 'How do you say "Good morning" (respectfully) in Nyanja?',
      options: ['Muli bwanji', 'Mwauka bwanji', 'Zikomo', 'Moni'],
      correctAnswer: 'Mwauka bwanji',
      explanation: 'Mwauka bwanji is the respectful morning greeting, literally "How have you woken up?".',
      hint: 'It starts with "Mwa-".',
      difficulty: 'easy'
    },
    {
      id: 'q1_2',
      type: 'word-bank',
      question: 'Assemble the phrase: "Yes, thank you (respectfully)"',
      options: ['Inde', 'zikomo', 'Moni', 'Bwino'],
      correctAnswer: 'Inde zikomo',
      explanation: 'Inde zikomo means "Yes, thank you". It is the standard polite response.',
      hint: 'It shows agreement and gratitude.',
      difficulty: 'medium'
    },
    {
      id: 'q1_3',
      type: 'audio-to-meaning',
      question: 'Listen to the audio and select the correct meaning.',
      options: ['Good morning', 'Thank you', 'How are you?', 'Goodbye'],
      correctAnswer: 'Thank you',
      explanation: 'Zikomo is used for thank you, excuse me, or as a general polite interjection.',
      hint: 'It starts with "Zi-".',
      audioUrl: '/audio/zikomo.mp3',
      difficulty: 'easy'
    },
    {
      id: 'q1_4',
      type: 'text-input',
      question: 'Translate to Nyanja: "Good morning"',
      options: [],
      correctAnswer: 'Mwauka bwanji',
      explanation: 'Mwauka bwanji is the standard respectful morning greeting.',
      hint: 'Starts with Mwa...',
      difficulty: 'hard'
    },
    {
      id: 'q1_5',
      type: 'multiple-choice',
      question: 'Which greeting is used generally at any time?',
      options: ['Mwauka bwanji', 'Moni', 'Zikomo', 'Inde'],
      correctAnswer: 'Moni',
      explanation: 'Moni is a general greeting used at any time of day.',
      hint: 'It is short and common.',
      difficulty: 'medium'
    }
  ],
  lesson_2_muba_class: [
    {
      id: 'q2_1',
      type: 'multiple-choice',
      question: 'Change "Munthu" (one person) to plural (many people).',
      options: ['Anthu', 'Imunthu', 'Chinthu', 'Zinthu'],
      correctAnswer: 'Anthu',
      explanation: 'In the Mu-/A- class, "Mu-" often becomes "A-" in plural (Munthu -> Anthu).',
      hint: 'Replace "Mu-" with "A-".',
      difficulty: 'easy'
    },
    {
      id: 'q2_2',
      type: 'word-bank',
      question: 'Assemble: "The good people"',
      options: ['Anthu', 'abwino', 'Munthu', 'wabwino'],
      correctAnswer: 'Anthu abwino',
      explanation: '"Anthu" is plural, so "abwino" must also be plural.',
      hint: 'Both words should start with "A-".',
      difficulty: 'medium'
    },
    {
      id: 'q2_3',
      type: 'text-input',
      question: 'What is the plural prefix for the people class?',
      options: [],
      correctAnswer: 'A-',
      explanation: '"A-" is used for plural nouns in the people class.',
      hint: 'Think of "Anthu".',
      difficulty: 'easy'
    }
  ],
  lesson_3_mirror_rule_intro: [
    {
      id: 'q3_1',
      type: 'multiple-choice',
      question: 'Complete the sentence: "Ana ___kudya" (The children are eating).',
      options: ['a', 'chi', 'mu', 'zi'],
      correctAnswer: 'a',
      explanation: 'The verb prefix must mirror the noun prefix "A-" (from Ana).',
      hint: 'Look at the beginning of "Ana".',
      difficulty: 'easy'
    },
    {
      id: 'q3_2',
      type: 'multiple-choice',
      question: 'Complete: "Munthu ___bwino" (The person is good/well).',
      options: ['a', 'wa', 'chi', 'u'],
      correctAnswer: 'wa',
      explanation: 'For Class 1 singular nouns, the possessive/adjective concord is often "wa-".',
      hint: 'Think of "Munthu wa-".',
      difficulty: 'hard'
    },
    {
      id: 'q3_3',
      type: 'multiple-choice',
      question: 'The "Mirror Rule" (Concord) ensures what in a sentence?',
      options: ['Rhyming', 'Agreement (Concord)', 'Speed', 'Loudness'],
      correctAnswer: 'Agreement (Concord)',
      explanation: 'It ensures all parts of the sentence agree with the subject noun class.',
      hint: 'It makes the sentence parts match.',
      difficulty: 'medium'
    }
  ],
  lesson_4_chizi_class: [
    {
      id: 'q4_1',
      type: 'multiple-choice',
      question: 'What is the plural of "Chinthu" (thing)?',
      options: ['Anthu', 'Zinthu', 'Aminthu', 'Izinthu'],
      correctAnswer: 'Zinthu',
      explanation: 'In the Chi-/Zi- class, "Chi-" becomes "Zi-" in plural.',
      hint: 'Replace "Chi-" with "Zi-".',
      difficulty: 'easy'
    },
    {
      id: 'q4_2',
      type: 'multiple-choice',
      question: 'Which prefix is used for objects or tools?',
      options: ['Mu-', 'A-', 'Chi-', 'Imi-'],
      correctAnswer: 'Chi-',
      explanation: '"Chi-" is the singular prefix for the objects class.',
      hint: 'Think of "Chinthu".',
      difficulty: 'easy'
    },
    {
      id: 'q4_3',
      type: 'multiple-choice',
      question: 'If "Chabwino" means "good" (singular object), what is the plural?',
      options: ['Abwino', 'Zabwino', 'Mabwino', 'Izabwino'],
      correctAnswer: 'Zabwino',
      explanation: 'The adjective mirrors the "Zi-" prefix of the plural noun.',
      hint: 'Mirror the "Zi-" prefix.',
      difficulty: 'medium'
    }
  ],
  remedial_muba_drill: [
    {
      id: 'r1_1',
      type: 'multiple-choice',
      question: 'Quick Review: "Mu-" is singular. What is plural in the people class?',
      options: ['A-', 'Chi-', 'Zi-', 'Imi-'],
      correctAnswer: 'A-',
      explanation: 'Always remember: Mu- (one) becomes A- (many) for people.',
      hint: 'Think of Munthu -> Anthu.',
      difficulty: 'easy'
    },
    {
      id: 'r1_2',
      type: 'multiple-choice',
      question: 'Which is correct: "Munthu wabwino" or "Munthu abwino"?',
      options: ['Munthu wabwino', 'Munthu abwino'],
      correctAnswer: 'Munthu wabwino',
      explanation: 'Singular noun "Munthu" needs singular adjective concord "wabwino".',
      hint: 'The prefixes must match.',
      difficulty: 'easy'
    }
  ]
};
