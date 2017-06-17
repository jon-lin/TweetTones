import Chart from 'chart.js';

class TweetsProcessor {
  constructor(tweets) {
    this.tweets = tweets;
    this.tweetsHash = {};
    this.barcharts = [];
    this.displayTweetsAsEmbeds();
  }

  displayTweetsAsEmbeds() {
    this.spinner();
    this.storeTweetsInStateAndInsertDivsIntoCarousel();
    this.insertTweetEmbedsIntoCarousel(0);
    this.initializeCarousel();
  }

  spinner() {
    $('body').append(`<div id='spinner'><img src="./loading.svg" /></div>`);
  }

  storeTweetsInStateAndInsertDivsIntoCarousel() {
    //DOMParser is used to convert UTF-8 symbols in tweets to plain text
    let parser = new DOMParser;
    for (let i = 0; i < this.tweets.length; i++) {
      this.tweets[i].text = parser
                            .parseFromString(this.tweets[i].text, 'text/html')
                            .body.textContent;

      this.tweetsHash[this.tweets[i].id_str] =  {
        id: this.tweets[i].id_str,
        timestamp: new Date(this.tweets[i].created_at).toISOString(),
        // timestamp: this.tweets[i].created_at,
        body: this.tweets[i].text
      };

      let elForInsertion = `<div id=${this.tweets[i].id_str}></div>`;
      $('.tweets-carousel-container').append(elForInsertion);
    }
  }

  insertTweetEmbedsIntoCarousel(idx) {
    let tweetId = this.tweets[idx].id_str;
    twttr.widgets.createTweet(tweetId, document.getElementById(tweetId))
      .then(() => {
        if (idx < this.tweets.length - 1) {
          this.insertTweetEmbedsIntoCarousel(idx + 1);
        } else {
          this.addSentimentData(0, Object.keys(this.tweetsHash));
        }
      });
  }

  initializeCarousel() {
    $('.tweets-carousel-container').on('afterChange', () => {
      let [chart1, chart2, chart3] = this.barcharts;
      chart1.destroy();
      chart2.destroy();
      chart3.destroy();
      this.displaySentimentData();
    });

    $('.tweets-carousel-container').slick({});
    $('.tweets-carousel-container').slick('slickSetOption', 'adaptiveHeight', true);
  }

  addSentimentData(idx, keys) {
    $.ajax('/sentiments', { data: { inputText: this.tweetsHash[keys[idx]]['body'] } })
      .then(sentimentData => {
        let toneCategories = sentimentData.document_tone.tone_categories;
        this.addSentimentDataToOneTweet(keys[idx], toneCategories);

        if (idx < keys.length - 1) {
          this.addSentimentData(idx + 1, keys);
        } else {
          this.displaySentimentData();
          this.displayLineGraphs();
        }
    });
  }

  addSentimentDataToOneTweet(key, toneCategories) {
    let setTweetsHash = this.tweetsHash[key];

    toneCategories.forEach(toneCategory => {
      setTweetsHash[toneCategory.category_id] = {};
      let currentToneCategory = setTweetsHash[toneCategory.category_id];

      toneCategory.tones.forEach(tonesObj => {
        tonesObj.tone_id = tonesObj.tone_id.replace('_big5', '');
        tonesObj.tone_id = tonesObj.tone_id.replace('_', ' ');
        currentToneCategory[tonesObj.tone_id] = tonesObj.score;
      });
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

  displaySentimentData() {
    this.giveChartsWhiteBackground();

    let selectedTweetId = $('.slick-slide.slick-current.slick-active').attr('id'),
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

    $('.barcharts-carousel-container').slick({});
    // $('.barcharts-carousel-container').slick('slickSetOption', 'adaptiveHeight', true);
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
               'millisecond': 'MM/DD/YY',
               'second': 'MM/DD/YY',
               'minute': 'MM/DD/YY',
               'hour': 'MM/DD/YY',
               'day': 'MM/DD/YY',
               'week': 'MM/DD/YY',
               'month': 'MM/DD/YY',
               'quarter': 'MM/DD/YY',
               'year': 'MM/DD/YY',
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

  displayLineGraphs() {
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
    $('#spinner').remove();
  }

}

export default TweetsProcessor;
