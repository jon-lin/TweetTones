import Chart from 'chart.js';

class SentimentsProcessor {
  constructor(tweetsHash, loadButton) {
    this.tweetsHash = tweetsHash;
    this.loadButton = loadButton;
    this.barcharts = [];
    this.emotionLineChart = null;
  }

  updateBarcharts(currentTweet) {
    let data = [
          currentTweet.emotion_tone,
          currentTweet.language_tone,
          currentTweet.social_tone
        ];

    this.barcharts.forEach((barchart, idx1) => {
        barchart.data.datasets[0].data.forEach((datum, idx2) => {
            barchart.data.datasets[0].data[idx2] = Object.values(data[idx1])[idx2];
        })
    });

    this.barcharts.forEach(barchart => barchart.update());
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
            // top: 30,
            left: 10,
            bottom: 15
          }
        },
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: true,
                    max: 1
                },
                // scaleLabel: {
                //   display: true,
                //   labelString: 'scores (< .5 = not likely present)'
                // }
            }]
        }
      }
    };
  }

  giveChartsWhiteBackground() {
    Chart.plugins.register({
      beforeDraw: function(chartInstance) {
        var ctx = chartInstance.chart.ctx;
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, chartInstance.chart.width, chartInstance.chart.height);
      }
    });
  }

  createSentimentDataBarCharts(id) {
    this.giveChartsWhiteBackground();

    let currentTweet = this.tweetsHash[id];

    let data = [
          currentTweet.emotion_tone,
          currentTweet.language_tone,
          currentTweet.social_tone
        ],
        contexts = [
          $("#emotion-tone-barchart"),
          $("#language-tone-barchart"),
          $("#social-tone-barchart")
        ],
        toneCategory = ['Emotional Tone', 'Language Style', 'Social Tendencies'],
        colors = [
          [
              'rgba(223, 20, 20, 0.62)',
              'rgba(68, 20, 223, 0.54)',
              'rgba(20, 223, 68, 0.7)',
              'rgba(219, 198, 10, 0.55)',
              'rgba(3, 119, 154, 0.51)'
          ],
          ['#274B5F', '#274B5F', '#274B5F'],
          ['#1CB4A0', '#1CB4A0', '#1CB4A0', '#1CB4A0', '#1CB4A0']
        ];

    for (var i = 0; i < 3; i++) {
      this.barcharts[i] = new Chart(contexts[i], this.chartData(
        Object.keys(data[i]),
        toneCategory[i],
        Object.values(data[i]),
        colors[i]));
    }
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
        tooltipEl.innerHTML = `
          <div class='tooltipContainer'>
            <div class='tooltipDateLabel'>Date: ${dateLabel}</div>
            <div class='tooltipTweetText'>Tweet: "${tweetText}"</div>
            <div class='emotionScoreContainer'>
              <div class='littleEmotionSquare' style='background: ${tooltipModel.labelColors[0].backgroundColor}'></div>
              <div class='tooltipEmotionScore'>${emotionScore}</div>
            </div>
          </div>
          `
    }

    var position = chartEl._chart.canvas.getBoundingClientRect();

    // Display, position, and set styles for font
    tooltipEl.style.opacity = 1;
    tooltipEl.style.position = 'absolute';
    tooltipEl.style.left = position.left + tooltipModel.caretX + window.scrollX + 'px';
    tooltipEl.style.top = position.top + tooltipModel.caretY + window.scrollY + 'px';
    tooltipEl.style.fontFamily = tooltipModel._fontFamily;
    tooltipEl.style.fontSize = tooltipModel.fontSize;
    tooltipEl.style.fontStyle = tooltipModel._fontStyle;
    tooltipEl.style.padding = tooltipModel.yPadding + 'px ' + tooltipModel.xPadding + 'px';
  }

  lineGraphOptions() {
    let that = this;

    return {
      title: {
        display: true,
        text: 'Emotional Tone Data For All Fetched Tweets Mapped Over Time',
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
        emotionData = [[], [], [], [], []];
    // emotionData corresponds to ["Anger", "Disgust", "Fear", "Joy", "Sadness"]

    for (let key in this.tweetsHash) {
      labels.unshift(this.tweetsHash[key].timestamp);
      let emotionObj = this.tweetsHash[key].emotion_tone;
      let i = 0;
      for (let emotion in emotionObj) {
        emotionData[i].unshift(emotionObj[emotion]);
        i++;
      }
    }
    return [emotionData, labels];
  }

  createLineGraphs() {
    let ctx = $("#emotion-linechart"),
        emotionData = this.formatEmotionDataAndTimestamps()[0],
        labels = this.formatEmotionDataAndTimestamps()[1],
        emotionLabels = ["Anger", "Disgust", "Fear", "Joy", "Sadness"],
        colors = [
                    "rgba(223, 20, 20, 0.62)",
                    "rgba(68, 20, 223, 0.54)",
                    "rgba(20, 223, 68, 0.7)",
                    "rgba(219, 198, 10, 0.55)",
                    "rgba(3, 119, 154, 0.51)"
                  ],
        datasets = emotionLabels.map((label, i) =>
          this.lineGraphSingleDataset(label, colors[i], emotionData[i]));

    this.emotionLineChart = new Chart(ctx, {
        type: 'line',
        data: {labels, datasets},
        options: this.lineGraphOptions()
      });
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
        $('#emotion-tone-barchart').height() * 3 + 40
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
  }

  finalizeDeployment() {
    this.setupButtonListeners();

    $('#twitter-timeline-container').height(
      $('#emotion-tone-barchart').height() * 3 + 40
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
