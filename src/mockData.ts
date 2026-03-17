import { LessonContent, Curriculum, LessonStatus } from "./types";

export const MOCK_NYANJA_NOUN_CLASS_LESSON: LessonContent = {
  id: "nyanja-nc-1-2",
  title: "People & Relationships (Class 1 & 2)",
  categories: [
    { id: 1, label: "Class 1: Singular (Mu-)" },
    { id: 2, label: "Class 2: Plural (A-)" }
  ],
  items: [
    { id: "1", word: "Munthu", translation: "Person", correctClass: 1 },
    { id: "2", word: "Anthu", translation: "People", correctClass: 2 },
    { id: "3", word: "Mwana", translation: "Child", correctClass: 1 },
    { id: "4", word: "Ana", translation: "Children", correctClass: 2 },
    { id: "5", word: "Mphunzitsi", translation: "Teacher", correctClass: 1 },
    { id: "6", word: "Aphunzitsi", translation: "Teachers", correctClass: 2 },
    { id: "7", word: "Mchembele", translation: "Elderly Woman", correctClass: 1 },
    { id: "8", word: "Achembele", translation: "Elderly Women", correctClass: 2 }
  ],
  grammarRules: [
    "Class 1 (Mu-) is for singular human beings.",
    "Class 2 (A-) is the plural form of Class 1.",
    "Note: 'Mwana' becomes 'Ana' (Mu- disappears in plural)."
  ]
};

export const MOCK_CURRICULUM: Curriculum = {
  units: [
    {
      id: "unit-1",
      title: "Foundations of Nyanja",
      lessons: [
        {
          id: "nyanja-nc-1-2",
          title: "Noun Classes 1 & 2",
          description: "Learn how to categorize people and groups.",
          type: "concept",
          xpReward: 50,
          requiredMasteryScore: 80,
          prerequisites: []
        },
        {
          id: "nyanja-nc-3-4",
          title: "Trees & Natural Objects",
          description: "Categorizing the world around us.",
          type: "concept",
          xpReward: 60,
          requiredMasteryScore: 80,
          prerequisites: ["nyanja-nc-1-2"]
        }
      ]
    }
  ]
};
