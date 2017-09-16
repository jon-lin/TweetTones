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

export const convertTimestamps = tweetsArr => {
  if (!parseTime(tweetsArr[0].timestamp)) return;

  tweetsArr.forEach(tweet => {
    tweet.timestamp = parseTime(tweet.timestamp);
  });
}

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

export const highlightCirclesCol = col => {
  col.on("mouseover", function() {
        d3.select(this).attr("stroke", "black")
                       .attr("stroke-width", "2");
      })
     .on("mouseout", function() {
        d3.select(this).attr("stroke", "")
                       .attr("stroke-width", "");
      });
}

export const formatCircleData = d => {
   let toneKey = getCurrentTone();
   let labels = Object.keys(d[toneKey]);
   let scores = Object.values(d[toneKey]);

   let result = [];
   for (let i = 0; i < scores.length; i++) {
     result.push({
       dotId: d.id + "-" + labels[i],
       toneTitle: labels[i],
       [i]: scores[i],
       timestamp: d.timestamp,
       body: d.body
     });
   }

   return result;
};

export const dotFadeEffect = function(d, i) {
 if (d[i] <= 0.5) { return 0.4; }
 else if (d[i] <= 0.75) { return 0.75; }
 else { return 1; }
};

function generateTooltip(d, i) {
  let yPosition = $(this).offset().top + 10;
  let xPosition = $(this).offset().left + 10;

  if ((xPosition + 200) > $(window).width()) xPosition -= 210;

  let tooltipContainer = d3.select(".tooltipContainer")
                            .style("left", xPosition + "px");

  $(".tooltipDateLabel").text("DATE: " + formatTime(d.timestamp));
  $(".tooltipTweetText").text(`TWEET: "${d.body}"`);
  $(".tooltipToneTitle").text(`${d.toneTitle.toUpperCase()}:`);
  $(".tooltipBarColor")
      .attr("style",
          `background: ${toneColors[d.toneTitle]};
          opacity: ${dotFadeEffect(d, i)}`)
      .css("width", 0)
      .animate({width: d[i] * 110 + "px"}, 250, "linear");

  $(".tooltipScore").text(d3.format(".2f")(d[i]));
  $(".tooltipLikelihood").text(likelihoodLabel(d[i]));

  let circleToViewportBottom = $(window).height() + window.scrollY - yPosition;
  let tooltipH = +$(".tooltipContainer").css("height").slice(0, -2);
  if (tooltipH > circleToViewportBottom) yPosition -= tooltipH + 10;

  tooltipContainer.style("top", yPosition + "px");

  d3.select(".tooltipContainer").classed("hidden", false);
}

export const applyTooltipEffect = circle => {
  circle.on("mouseover", generateTooltip)
        .on("mouseout", () => d3.select(".tooltipContainer").classed("hidden", true));
}
