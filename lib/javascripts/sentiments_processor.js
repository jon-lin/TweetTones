import Chart from 'chart.js';
import json2csv from 'json2csv';
import merge from 'lodash/merge';
import { fields, fieldNames } from './fieldsAndFieldNamesForCSV';
import { BarChartsProcessor } from './barcharts_processor';
import { ScatterplotProcessor } from './scatterplot_processor';

class SentimentsProcessor {
  constructor(tweetsHash) {
    this.tweetsHash = tweetsHash;
    this.barchartsProcessor = new BarChartsProcessor;
    this.scatterplot_processor = new ScatterplotProcessor;
    this.emotionLineChart = null;
  }

  updateBarcharts(currentTweet) {
    this.barchartsProcessor.updateAllBarCharts(currentTweet);
  }

  updateLineChart() {
    let emotionData = this.formatEmotionDataAndTimestamps()[0],
        labels = this.formatEmotionDataAndTimestamps()[1];

    this.emotionLineChart.data.labels = labels;
    this.emotionLineChart.data.datasets.forEach((dataset, idx) =>
      this.emotionLineChart.data.datasets[idx].data = emotionData[idx]
    );

    this.emotionLineChart.update();
    $('.spinner').remove();

    if ($(window).width() <= 650) {
        $('.all-linecharts').append(
          `<div class='tooSmallNotification'>Enlarge window to see line chart</div>`
        );
      }
  }

  chartData(labels, label, data, colors) {
    return {
      type: 'bar',
      data: {
          labels: labels,
          datasets: [{
              label: label,
              data: data,
              backgroundColor: colors,
              borderColor: colors,
              borderWidth: 1
          }]
      },
      options: {
        title: {
          display: true,
          text: label,
          fontSize: 14
        },
        legend: {
          display: false
        },
        layout: {
          padding: {
            left: 10,
            bottom: 15
          }
        },
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: true,
                    max: 1
                }
            }]
        }
      }
    };
  }

  createBarCharts(id) {
    ["emotion_tone", "language_tone", "social_tone"].forEach(title => {
      let toneCategory = this.tweetsHash[id][title];
      let labels = Object.keys(toneCategory);
      let data = Object.values(toneCategory);
      this.barchartsProcessor.createBarChart(data, labels, title);
    })
  }

  lineGraphSingleDataset(label, color, data) {
    return {
        label: label,
        fill: false,
        lineTension: 0.1,
        backgroundColor: color,
        borderColor: color,
        borderCapStyle: 'butt',
        borderDash: [],
        borderDashOffset: 0.0,
        borderJoinStyle: 'miter',
        pointBorderColor: color,
        pointBackgroundColor: color,
        pointBorderWidth: 1,
        pointHoverRadius: 8,
        pointHoverBackgroundColor: color,
        pointHoverBorderColor: color,
        pointHoverBorderWidth: 2,
        pointRadius: 5,
        pointHitRadius: 10,
        data: data,
        spanGaps: false
    }
  }

  styleToolTip(tooltipModel, chartEl) {
    let tweetText, dateLabel, emotionScore;
    if (tooltipModel.dataPoints) {
      tweetText = Object.values(this.tweetsHash)
        .filter(emotionObj =>
          emotionObj.timestamp === tooltipModel.dataPoints[0].xLabel
        )[0].body;

      dateLabel = new Date(tooltipModel.dataPoints[0].xLabel).toLocaleString();

      emotionScore = tooltipModel.body[0].lines[0];
    }

    // Tooltip Element
    var tooltipEl = document.getElementById('chartjs-tooltip');

    // Create element on first render
    if (!tooltipEl) {
        tooltipEl = document.createElement('div');
        tooltipEl.id = 'chartjs-tooltip';
        document.body.appendChild(tooltipEl);
    }

    // Hide if no tooltip
    if (tooltipModel.opacity === 0) {
        tooltipEl.style.opacity = 0;
        return;
    }

    // Set caret Position
    tooltipEl.classList.remove('above', 'below', 'no-transform');
    if (tooltipModel.yAlign) {
        tooltipEl.classList.add(tooltipModel.yAlign);
    } else {
        tooltipEl.classList.add('no-transform');
    }

    function getBody(bodyItem) {
        return bodyItem.lines;
    }

    // Set Text
    if (tooltipModel.body) {
        tooltipEl.innerHTML =
        `<div class='tooltipContainer'>
            <div class='tooltipDateLabel'>Date: ${dateLabel}</div>
            <div class='tooltipTweetText'>Tweet: "${tweetText}"</div>
            <div class='emotionScoreContainer'>
              <div class='littleEmotionSquare' style='background: ${tooltipModel.labelColors[0].backgroundColor}'></div>
              <div class='tooltipEmotionScore'>${emotionScore}</div>
            </div>
          </div>`;
    }

    var position = chartEl._chart.canvas.getBoundingClientRect();

    // Display, position, and set styles for font
    tooltipEl.style.opacity = 1;
    tooltipEl.style.position = 'absolute';
    tooltipEl.style.top = position.top + tooltipModel.caretY + window.scrollY + 'px';
    tooltipEl.style.fontFamily = tooltipModel._fontFamily;
    tooltipEl.style.fontSize = tooltipModel.fontSize;
    tooltipEl.style.fontStyle = tooltipModel._fontStyle;
    tooltipEl.style.padding = tooltipModel.yPadding + 'px ' + tooltipModel.xPadding + 'px';

    //Dynamically adjust position of tooltip if it'd run offscreen;
    let defaultPosition = position.left + tooltipModel.caretX + window.scrollX,
        altPosition = defaultPosition - 206,
        windowWidth = $(window).width(),
        offscreen = defaultPosition + 200 > windowWidth;

    tooltipEl.style.left = (offscreen ? altPosition : defaultPosition) + 'px';
  }

  lineGraphOptions() {
    let that = this;

    return {
      title: {
        display: true,
        text: 'Emotional Tone Over Time',
        fontSize: 25
      },
      layout: {
        padding: {
          left: 25,
          right: 30
        }
      },
      scales: {
        yAxes: [{
          ticks: {
              beginAtZero: true,
              max: 1
          },
          scaleLabel: {
              display: true,
              labelString: 'scores (< .5 = not likely present)'
            }
          }],
        xAxes: [{
          ticks: {
            minRotation: 45
          },
          type: 'time',
          time: {
            displayFormats: {
               'millisecond': 'M/D/YY, ha',
               'second': 'M/D/YY, ha',
               'minute': 'M/D/YY, ha',
               'hour': 'M/D/YY, ha',
               'day': 'M/D/YY, ha',
               'week': 'M/D/YY, ha',
               'month': 'M/D/YY, ha',
               'quarter': 'M/D/YY, ha',
               'year': 'M/D/YY, ha',
            }
          }
        }],
      },
      tooltips: {
        enabled: false,
        custom: function(tooltipModel) {
          let chartEl = this;
          that.styleToolTip(tooltipModel, chartEl);
        }
      }
    };
  }

  formatEmotionDataAndTimestamps() {
    let labels = [],
        emotionData = [[], [], [], [], []],
        currentTweetData;
    // emotionData corresponds to ["Anger", "Disgust", "Fear", "Joy", "Sadness"]

    let dateComparator = (tweetObj1, tweetObj2) => {
      return new Date(tweetObj1.timestamp) - new Date(tweetObj2.timestamp)
    };

    let sortedTweets = Object.values(this.tweetsHash)
                             .sort((a, b) => dateComparator(a, b));

    for (let i = 0; i < sortedTweets.length; i++) {
      currentTweetData = sortedTweets[i];
      labels.unshift(currentTweetData.timestamp);
      let emotionObj = currentTweetData.emotion_tone;
      let j = 0;
      for (let emotion in emotionObj) {
        emotionData[j].unshift(emotionObj[emotion]);
        j++;
      }
    }

    return [emotionData, labels];
  }

  createScatterplot(tweetsHash) {
    this.scatterplot_processor.createScatterplot(tweetsHash);
  }

  introTooltips() {
    $('.top-dashboard').popupTooltip('top-left', `
        Scroll through the tweets and click on one
        to see its tone analyses in the bar charts on the right.
    `);

    setTimeout( () => $('.barcharts-container').popupTooltip('top', `
        A note on IBM Watson's scoring: Less than 0.5 means 'unlikely present.'
        More than 0.5 means 'likely present,' and more than 0.75
        means 'very likely present.'
    `), 3000);

    setTimeout( () => $('.top-dashboard').popupTooltip('bottom-left', `
        Scroll to the bottom of this column and click on 'Load
        more Tweets' to feed more data into the line chart below.
    `), 7000);

    setTimeout( () => $('.all-linecharts').popupTooltip('top-right', `
        When the line chart is loaded, hover over a data point to
        see its associated tweet, date & time, and emotion score.
    `), 10000);
  }

  removeLineChartIfWindowTooSmall() {
    $(window).resize(() => {
      $('#twitter-timeline-container').height(
        $('.emotion_tone_barchart').height() * 3 + 40
      );

      $('.popupTooltip.side-top-right').remove();

      let windowWidth = $(window).width(),
          noteAlreadyPresent = document.querySelector('.tooSmallNotification'),
          spinnerPresent = document.querySelector('.spinner');

      if (windowWidth <= 650 && !spinnerPresent && !noteAlreadyPresent) {
          $('.all-linecharts').append(
            `<div class='tooSmallNotification'>Enlarge window to see line chart</div>`
          );
        }

      if (windowWidth > 650) { $('.tooSmallNotification').remove(); }
    });
  }

  toggleMenuDropDown() {
    $('.fa-bars').toggleClass('selected');
    $('.menuDropdownMenu, .arrow-up').toggle(200);
  }

  setupButtonListeners() {
    $('.fa-bars').click(() => this.toggleMenuDropDown());

    $('#lookUpAnotherTwitterUserButton').click(() => window.location.reload());

    $('.appOptionsLinks > *, .aboutThisAppLinks > *').each((idx, el) =>
      el.onclick = () => this.toggleMenuDropDown()
    );

    $('#takeATourButton').click(() => this.introTooltips());

    $('.navbarLogoAndText').click(() => window.location.reload());

    $('body').click(e => {
        if ($(e.target).closest('.navbarHamburgerContainer').length === 0 && document.querySelector('.selected')) {
          this.toggleMenuDropDown();
        }
    });

    $('#downloadCSVButton').click(this.deployCSVFile.bind(this));
    $('#downloadJSONButton').click(this.deployJSONFile.bind(this));
  }

  deployCSVFile() {
    let data = Object.values(merge({}, this.tweetsHash));

    data.forEach((obj, i) => {
        data[i].timestamp = new Date(data[i].timestamp)
                            .toLocaleString()
                            .replace(',', '');
    });

    let options = { data, fields, fieldNames },
        csv = "data:text/csv;charset=utf-8," + json2csv(options),
        encodedFile = encodeURI(csv),
        link = document.createElement("a");

    link.setAttribute("href", encodedFile);
    link.setAttribute("download", "data.csv");
    document.body.appendChild(link);
    link.click();
  }

  deployJSONFile() {
    let dataType = "data:application/json;charset=utf-8,",
        dataStr = dataType + encodeURIComponent(JSON.stringify(this.tweetsHash)),
        link = document.createElement("a");

    link.setAttribute("href", dataStr);
    link.setAttribute("download", "data.json");
    document.body.appendChild(link);
    link.click();
  }

  finalizeDeployment() {
    this.setupButtonListeners();

    $('#twitter-timeline-container').height(
      $('.emotion_tone_barchart').height() * 3 + 40
    );

    this.removeLineChartIfWindowTooSmall();

    this.introTooltips();

    window.onbeforeunload = function(event) {
      window.scrollTo(0, 0);
      return null;
    };
  }
}

export default SentimentsProcessor;
