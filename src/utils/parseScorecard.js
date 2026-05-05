// Extracts basic metadata from a raw scorecard string if possible
export const parseScorecard = (rawText) => {
  // A simple heuristic for MVP: if it's too short, it might be invalid.
  // In a real scenario, this would parse player names, runs, balls, etc.
  // We leave the deep parsing to the LLM as per architecture.
  
  const text = rawText.trim();
  if (text.length < 50) {
    return {
      isValid: false,
      error: "Scorecard text is too short. Please paste a full scorecard."
    };
  }
  
  return {
    isValid: true,
    error: null
  };
};
