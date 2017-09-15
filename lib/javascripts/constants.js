export const colorsByTitle = title => {
  if (title === "social_tone") {
    return ["green", "darkblue", "brown", "cyan", "magenta"];
  } else if (title === "emotion_tone") {
    return ["red", "purple", "darkgreen", "gold", "#99C1DD"];
  } else if (title === "language_tone") {
    return ["blue", "orange", "blue"];
  }
}

export const tonesTitleization = {
  "emotion_tone": "Emotional Tone",
  "language_tone": "Language Style",
  "social_tone": "Social Tendencies",
  "Emotional Tone Over Time": "emotion_tone",
  "Social Tendencies Over Time": "social_tone",
  "Language Style Over Time": "language_tone"
};

export const likelihoodLabel = d => {
  if (d > 0.75) { return "VERY LIKELY"; }
  else if (d > 0.5) { return "LIKELY"; }
  else { return "UNLIKELY"; }
};

export const bcOffsetCalc = title => {
  if (title === "social_tone") {
    return 24;
  } else if (title === "emotion_tone") {
    return -7;
  } else if (title === "language_tone") {
    return -4;
  }
};

export const fadeEffectBC = function(d) {
 if (d <= 0.5) { return 0.4; }
 else if (d <= 0.75) { return 0.75; }
 else { return 1; }
}

export const toneCategories = {
  "emotion_tone": [
    { tone: "anger", key: 0 },
    { tone: "disgust", key: 1 },
    { tone: "fear", key: 2 },
    { tone: "joy", key: 3 },
    { tone: "sadness", key: 4 },
  ],
  "language_tone": [
    { tone: "analytical", key: 5 },
    { tone: "confident", key: 6 },
    { tone: "tentative", key: 7 },
  ],
  "social_tone": [
    { tone: "openness", key: 8 },
    { tone: "conscientiousness", key: 9 },
    { tone: "extraversion", key: 10 },
    { tone: "agreeableness", key: 11 },
    { tone: "emotional range", key: 12 }
  ]
}
