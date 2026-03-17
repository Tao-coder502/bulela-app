
export async function mockSentimentInference(text: string) {
  console.log("[MockInference] Analyzing:", text);
  return {
    results: [
      {
        label: "positive",
        score: 0.95
      }
    ]
  };
}
