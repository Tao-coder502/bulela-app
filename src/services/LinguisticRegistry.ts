import { LanguageDNA } from '../types';

export const LinguisticRegistry: Record<string, LanguageDNA> = {
  nyanja: {
    id: 'nyanja',
    name: 'Nyanja',
    respectPrefix: 'A-',
    greeting: 'Muli bwanji',
    culturalPivot: 'Maternal/Supportive',
    rules: {
      hasTonality: true,
      nounClassCount: 18,
      culturalMetaphorTheme: 'Zambian Roadside'
    },
    progress: { nounClasses: 65 },
    stats: { accuracy: 88 }
  },
  bemba: {
    id: 'bemba',
    name: 'Bemba',
    respectPrefix: 'Ba-',
    greeting: 'Muli shani',
    culturalPivot: 'Ancestral/Proud',
    rules: {
      hasTonality: true,
      nounClassCount: 15,
      culturalMetaphorTheme: 'Copperbelt Heritage'
    },
    progress: { nounClasses: 42 },
    stats: { accuracy: 72 }
  },
  tonga: {
    id: 'tonga',
    name: 'Tonga',
    respectPrefix: 'Ba-',
    greeting: 'Kamwaamba',
    culturalPivot: 'Pastoral/Resilient',
    rules: {
      hasTonality: true,
      nounClassCount: 16,
      culturalMetaphorTheme: 'Zambezi Valley'
    },
    progress: { nounClasses: 15 },
    stats: { accuracy: 55 }
  },
  lozi: {
    id: 'lozi',
    name: 'Lozi',
    respectPrefix: 'Bo-',
    greeting: 'Muzuhile cwani',
    culturalPivot: 'Royal/Riverine',
    rules: {
      hasTonality: false,
      nounClassCount: 14,
      culturalMetaphorTheme: 'Barotse Floodplain'
    },
    progress: { nounClasses: 8 },
    stats: { accuracy: 40 }
  },
  kaonde: {
    id: 'kaonde',
    name: 'Kaonde',
    respectPrefix: 'Ba-',
    greeting: 'Mwashibukanyi',
    culturalPivot: 'Mining/Community',
    rules: {
      hasTonality: true,
      nounClassCount: 17,
      culturalMetaphorTheme: 'Solwezi Hills'
    },
    progress: { nounClasses: 22 },
    stats: { accuracy: 68 }
  }
};
