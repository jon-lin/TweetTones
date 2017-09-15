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
