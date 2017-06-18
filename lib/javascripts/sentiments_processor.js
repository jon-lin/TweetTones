import Chart from 'chart.js';

class SentimentsProcessor {
  constructor(tweetsHash) {
    this.tweetsHash = tweetsHash;
    this.barcharts = [];
    this.initializedBarChartsCarousel = false;
    this.setUpdateChartsListener();
    this.createSentimentDataBarCharts();
    this.createLineGraphs();
  }

  setUpdateChartsListener() {
    $('.tweets-carousel-container').on('afterChange', () => {
        let selectedTweetId = $('.tweets-carousel-container .slick-slide.slick-current.slick-active').attr('id'),
            currentTweet = this.tweetsHash[selectedTweetId],
            data = [
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
    });
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
          scales: {
              yAxes: [{
                  ticks: {
                      beginAtZero:true,
                      max: 1
                  }
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

  createSentimentDataBarCharts() {
    this.giveChartsWhiteBackground();

    let selectedTweetId = $('.tweets-carousel-container .slick-slide.slick-current.slick-active').attr('id'),
        currentTweet = this.tweetsHash[selectedTweetId];

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

    if (!this.initializedBarChartsCarousel) {
      $('.barcharts-carousel-container').slick({
        // centerMode: true
      });
      this.initializedBarChartsCarousel = true;
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
        pointHoverRadius: 5,
        pointHoverBackgroundColor: color,
        pointHoverBorderColor: color,
        pointHoverBorderWidth: 2,
        pointRadius: 1,
        pointHitRadius: 10,
        data: data,
        spanGaps: false
    }
  }

  lineGraphOptions() {
    return {
      scales: {
        xAxes: [{
          type: 'time',
          time: {
            displayFormats: {
               'millisecond': 'M/DD/YY h:mm a',
               'second': 'M/DD/YY h:mm a',
               'minute': 'M/DD/YY h:mm a',
               'hour': 'M/DD/YY h:mm a',
               'day': 'M/DD/YY h:mm a',
               'week': 'M/DD/YY h:mm a',
               'month': 'M/DD/YY h:mm a',
               'quarter': 'M/DD/YY h:mm a',
               'year': 'M/DD/YY h:mm a',
            }
          }
        }]
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

    let emotionLineChart = new Chart(ctx, {
        type: 'line',
        data: {labels, datasets},
        options: this.lineGraphOptions()
      });

    $('.searchAgainButton').click(() => window.location.reload());
    $(window).trigger('resize');
    setTimeout(() => $('#spinner').remove(), 300);
  }

}

export default SentimentsProcessor;
