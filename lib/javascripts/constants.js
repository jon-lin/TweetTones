import * as d3 from 'd3';

export const colorsByTitle = title => {
  if (title === "social_tone") {
    return ["green", "darkblue", "brown", "cyan", "magenta"];
  } else if (title === "emotion_tone") {
    return ["red", "purple", "darkgreen", "gold", "#99C1DD"];
  } else if (title === "language_tone") {
    return ["blue", "orange", "pink"];
  }
};

export const tonesTitleization = {
  "emotion_tone": "Emotional Tone",
  "language_tone": "Language Style",
  "social_tone": "Social Tendencies"
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
};

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
};

export const getCurrentTone = () => {
  let DOMSelect = $(".selectToneDropdown")[0];
  return DOMSelect.options[DOMSelect.selectedIndex].value;
};

export const getStartAndEndDates = data => {
  let startDate = d3.min(data, d => d.timestamp),
      endDate = d3.max(data, d => d.timestamp);

  return [
    d3.timeDay.offset(startDate, -1),
    d3.timeDay.offset(endDate, 1)
  ];
};

export const spWidth = 700;

export const spHeight = 350;

export const spPad = {top: 5, bottom: 90, left: 45, right: 30};

export const parseTime = d3.timeParse("%Y-%m-%dT%H:%M:%S%Z");
export const formatTime = d3.timeFormat("%-m/%-d/%y, %-I:%M%p");

export const toneColors = {
    "anger": "red",
    "disgust": "purple",
    "fear": "darkgreen",
    "joy": "gold",
    "sadness": "#99C1DD",
    "analytical": "blue",
    "confident": "orange",
    "tentative": "pink",
    "openness": "green",
    "conscientiousness": "darkblue",
    "extraversion": "brown",
    "agreeableness": "cyan",
    "emotional range": "magenta"
};


export const maxScaleExtent = data => {
  let startDate = getStartAndEndDates(data)[0];
  let endDate = getStartAndEndDates(data)[1];
  let datesDiff = (endDate - startDate)/1000/60/60/24/10;
  return datesDiff * 1440;
};

export const translateMaxRange = (w, h) => {
  return [[-w/2, -h/2], [w * 2, h * 2]];
};

export const rotateXTicks = axis => {
  axis.selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-65)" );
};
