import { APIUtil } from './api_util.js';
// import * as d3 from "d3";
import Chart from 'chart.js';

class TweetsProcessor {
  constructor(tweets) {
    this.tweets = tweets;
    this.tweetsHash = {};
    this.displayTweetsAsEmbeds();
    this.data = [];
  }

  spinner() {
    $('body').append(`<div id='spinner'><img src="/loading.svg" /></div>`);
  }

  displayTweetsAsEmbeds() {
    this.spinner();
    //DOMParser is used to convert UTF-8 symbols in tweet to plain text
    let parser = new DOMParser;
    for (let i = 0; i < this.tweets.length; i++) {
      let modText = parser.parseFromString(this.tweets[i].text, 'text/html').body.textContent;
      this.tweetsHash[this.tweets[i].id_str] =  {id: this.tweets[i].id_str, timestamp: this.tweets[i].created_at, body: modText};

      let elForInsertion = `<div id=${this.tweets[i].id_str}></div>`;
      $('.tweets-carousel-container').append(elForInsertion);
    }

    let idx = 0;

    let iterateThroughTweetsOnAsyncSuccess = (idx) => {
      let currentTweet = this.tweets[idx];
      twttr.widgets.createTweet(currentTweet.id_str, document.getElementById(currentTweet.id_str))
        .then(() => {
          if (idx < this.tweets.length - 1) {
            iterateThroughTweetsOnAsyncSuccess(idx + 1);
          } else {
              $('.tweets-carousel-container').on('afterChange', () => {
                this.emotionToneBarchart.destroy();
                this.languageToneBarchart.destroy();
                this.socialToneBarchart.destroy();
                this.displaySentimentData();
              });

              this.addSentimentData();
          }
        });
    }

    iterateThroughTweetsOnAsyncSuccess(idx);

    //not sure why but chance of carousel failure much lower if slick is initialized here
    $('.tweets-carousel-container').slick({});

    //adaptiveHeight is set on after the carousel is initiated because otherwise,
    //the carousel doesn't load either
    $('.tweets-carousel-container').slick('slickSetOption', 'adaptiveHeight', true);
  }

  addSentimentData() {
    let count = 0;
    for (let key in this.tweetsHash) {
      APIUtil.fetchSentiments(this.tweetsHash[key]['body'])
        .then(sentimentData => {
          let setTweetsHash = this.tweetsHash[key];

          let emotion_tone = sentimentData.document_tone.tone_categories[0].tones;
          setTweetsHash['emotion_tone'] = {};
          let setTweetsHashEmotion = setTweetsHash['emotion_tone'];

          setTweetsHashEmotion['anger'] = emotion_tone[0].score;
          setTweetsHashEmotion['disgust'] = emotion_tone[1].score;
          setTweetsHashEmotion['fear'] = emotion_tone[2].score;
          setTweetsHashEmotion['joy'] = emotion_tone[3].score;
          setTweetsHashEmotion['sadness'] = emotion_tone[4].score;

          let language_tone = sentimentData.document_tone.tone_categories[1].tones;
          setTweetsHash['language_tone'] = {};
          let setTweetsHashLang = setTweetsHash['language_tone'];

          setTweetsHashLang['analytical'] = language_tone[0].score;
          setTweetsHashLang['confident'] = language_tone[1].score;
          setTweetsHashLang['tentative'] = language_tone[2].score;

          let social_tone = sentimentData.document_tone.tone_categories[2].tones;
          setTweetsHash['social_tone'] = {};
          let setTweetsHashSocial = setTweetsHash['social_tone'];

          setTweetsHashSocial['openness'] = social_tone[0].score;
          setTweetsHashSocial['conscientiousness'] = social_tone[1].score;
          setTweetsHashSocial['extraversion'] = social_tone[2].score;
          setTweetsHashSocial['agreeableness'] = social_tone[3].score;
          setTweetsHashSocial['emotional range'] = social_tone[4].score;

          count++;
          if (count === this.tweets.length) {
            this.displaySentimentData();
            this.displayLineGraphs();
          }
      });
    }
  }

  displaySentimentData() {
    let selectedTweetId = $('.slick-slide.slick-current.slick-active').attr('id');
    let emotionToneData = this.tweetsHash[selectedTweetId].emotion_tone;

    let ctx = $("#emotion-tone-barchart");

    let emotions = Object.keys(emotionToneData);
    let emotionValues = emotions.map(emotion => emotionToneData[emotion]);

    Chart.plugins.register({
      beforeDraw: function(chartInstance) {
        var ctx = chartInstance.chart.ctx;
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, chartInstance.chart.width, chartInstance.chart.height);
      }
    });

    this.emotionToneBarchart = new Chart(ctx, {
      type: 'bar',
      data: {
          labels: emotions,
          datasets: [{
              label: 'Emotional Tone',
              data: emotionValues,
              backgroundColor: [
                  'rgba(223, 20, 20, 0.62)',
                  'rgba(68, 20, 223, 0.54)',
                  'rgba(20, 223, 68, 0.7)',
                  'rgba(219, 198, 10, 0.55)',
                  'rgba(3, 119, 154, 0.51)'
              ],
              borderColor: [
                'rgba(223, 20, 20, 0.62)',
                'rgba(68, 20, 223, 0.54)',
                'rgba(20, 223, 68, 0.7)',
                'rgba(219, 198, 10, 0.55)',
                'rgba(3, 119, 154, 0.51)'
              ],
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
    });

    let languageToneData = this.tweetsHash[selectedTweetId].language_tone;
    let ctx2 = $("#language-tone-barchart");

    let languageTones = Object.keys(languageToneData);
    let languageValues = languageTones.map(tone => languageToneData[tone]);

    this.languageToneBarchart = new Chart(ctx2, {
      type: 'bar',
      data: {
          labels: languageTones,
          datasets: [{
              label: 'Language Style',
              data: languageValues,
              backgroundColor: [
                '#274B5F',
                '#274B5F',
                '#274B5F'
              ],
              borderColor: [
                '#274B5F',
                '#274B5F',
                '#274B5F'
              ],
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
          },
          defaultFontStyle: 'bold'
      }
    });

    let socialToneData = this.tweetsHash[selectedTweetId].social_tone;
    let ctx3 = $("#social-tone-barchart");

    let socialTones = Object.keys(socialToneData);
    let socialValues = socialTones.map(tone => socialToneData[tone]);

    this.socialToneBarchart = new Chart(ctx3, {
      type: 'bar',
      data: {
          labels: socialTones,
          datasets: [{
              label: 'Social Tendencies',
              data: socialValues,
              backgroundColor: [
                '#1CB4A0',
                '#1CB4A0',
                '#1CB4A0',
                '#1CB4A0',
                '#1CB4A0'
              ],
              borderColor: [
                '#1CB4A0',
                '#1CB4A0',
                '#1CB4A0',
                '#1CB4A0',
                '#1CB4A0'
              ],
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
    });
  }

  displayLineGraphs() {
    let ctx1 = $("#emotion-linechart");

    let labels = [],
        angerData = [],
        disgustData = [],
        fearData = [],
        joyData = [],
        sadnessData = []

    for (let key in this.tweetsHash) {
      labels.unshift(this.tweetsHash[key].timestamp);
      angerData.unshift(this.tweetsHash[key].emotion_tone.anger);
      disgustData.unshift(this.tweetsHash[key].emotion_tone.disgust);
      fearData.unshift(this.tweetsHash[key].emotion_tone.fear);
      joyData.unshift(this.tweetsHash[key].emotion_tone.joy);
      sadnessData.unshift(this.tweetsHash[key].emotion_tone.sadness);
    }

    let emotionLineData = {
        labels: labels,
        datasets: [
            {
                label: "Anger",
                fill: false,
                lineTension: 0.1,
                backgroundColor: "rgba(223, 20, 20, 0.62)",
                borderColor: "rgba(223, 20, 20, 0.62)",
                borderCapStyle: 'butt',
                borderDash: [],
                borderDashOffset: 0.0,
                borderJoinStyle: 'miter',
                pointBorderColor: "rgba(223, 20, 20, 0.62)",
                pointBackgroundColor: "rgba(223, 20, 20, 0.62)",
                pointBorderWidth: 1,
                pointHoverRadius: 5,
                pointHoverBackgroundColor: "rgba(223, 20, 20, 0.62)",
                pointHoverBorderColor: "rgba(223, 20, 20, 0.62)",
                pointHoverBorderWidth: 2,
                pointRadius: 1,
                pointHitRadius: 10,
                data: angerData,
                spanGaps: false
            },
            {
                label: "Disgust",
                fill: false,
                lineTension: 0.1,
                backgroundColor: "rgba(68, 20, 223, 0.54)",
                borderColor: "rgba(68, 20, 223, 0.54)",
                borderCapStyle: 'butt',
                borderDash: [],
                borderDashOffset: 0.0,
                borderJoinStyle: 'miter',
                pointBorderColor: "rgba(68, 20, 223, 0.54)",
                pointBackgroundColor: "rgba(68, 20, 223, 0.54)",
                pointBorderWidth: 1,
                pointHoverRadius: 5,
                pointHoverBackgroundColor: "rgba(68, 20, 223, 0.54)",
                pointHoverBorderColor: "rgba(68, 20, 223, 0.54)",
                pointHoverBorderWidth: 2,
                pointRadius: 1,
                pointHitRadius: 10,
                data: disgustData,
                spanGaps: false
            },
            {
                label: "Fear",
                fill: false,
                lineTension: 0.1,
                backgroundColor: "rgba(20, 223, 68, 0.7)",
                borderColor: "rgba(20, 223, 68, 0.7)",
                borderCapStyle: 'butt',
                borderDash: [],
                borderDashOffset: 0.0,
                borderJoinStyle: 'miter',
                pointBorderColor: "rgba(20, 223, 68, 0.7)",
                pointBackgroundColor: "rgba(20, 223, 68, 0.7)",
                pointBorderWidth: 1,
                pointHoverRadius: 5,
                pointHoverBackgroundColor: "rgba(20, 223, 68, 0.7)",
                pointHoverBorderColor: "rgba(20, 223, 68, 0.7)",
                pointHoverBorderWidth: 2,
                pointRadius: 1,
                pointHitRadius: 10,
                data: fearData,
                spanGaps: false
            },
            {
                label: "Joy",
                fill: false,
                lineTension: 0.1,
                backgroundColor: "rgba(219, 198, 10, 0.55)",
                borderColor: "rgba(219, 198, 10, 0.55)",
                borderCapStyle: 'butt',
                borderDash: [],
                borderDashOffset: 0.0,
                borderJoinStyle: 'miter',
                pointBorderColor: "rgba(219, 198, 10, 0.55)",
                pointBackgroundColor: "rgba(219, 198, 10, 0.55)",
                pointBorderWidth: 1,
                pointHoverRadius: 5,
                pointHoverBackgroundColor: "rgba(219, 198, 10, 0.55)",
                pointHoverBorderColor: "rgba(219, 198, 10, 0.55)",
                pointHoverBorderWidth: 2,
                pointRadius: 1,
                pointHitRadius: 10,
                data: joyData,
                spanGaps: false
            },
            {
                label: "Sadness",
                fill: false,
                lineTension: 0.1,
                backgroundColor: "rgba(3, 119, 154, 0.51)",
                borderColor: "rgba(3, 119, 154, 0.51)",
                borderCapStyle: 'butt',
                borderDash: [],
                borderDashOffset: 0.0,
                borderJoinStyle: 'miter',
                pointBorderColor: "rgba(3, 119, 154, 0.51)",
                pointBackgroundColor: "rgba(3, 119, 154, 0.51)",
                pointBorderWidth: 1,
                pointHoverRadius: 5,
                pointHoverBackgroundColor: "rgba(3, 119, 154, 0.51)",
                pointHoverBorderColor: "rgba(3, 119, 154, 0.51)",
                pointHoverBorderWidth: 2,
                pointRadius: 1,
                pointHitRadius: 10,
                data: sadnessData,
                spanGaps: false
            }
        ]
    };

    let emotionLineChart = new Chart(ctx1, {
        type: 'line',
        data: emotionLineData,
        options: {
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
        }
      });

    $('#spinner').remove();
  }


}

export default TweetsProcessor;

////////// working version of display tweets as embeds before dealing with loading individual tweet async

// let count = 0;
// this.tweets.forEach(tweet => {
//   let modText = parser.parseFromString(tweet.text, 'text/html').body.textContent;
//   this.tweetsHash[tweet.id_str] =  {id: tweet.id_str, timestamp: tweet.created_at, body: modText};
//
//   let elForInsertion = `<div id=${tweet.id_str}></div>`;
//   $('.tweets-carousel-container').append(elForInsertion);
//
//   //The line below is dangerous in that you're calling an async function
//   //inside a forEach loop. What if the loop doesn't wait for each
//   //async function to finish before moving onto the next iteration?
//   twttr.widgets.createTweet(tweet.id_str, document.getElementById(tweet.id_str))
//     .then(() => {
//       count ++;
//       console.log(count);
//       if (count === this.tweets.length) {
//         $('.tweets-carousel-container').on('afterChange', () => {
//           this.emotionToneBarchart.destroy();
//           this.languageToneBarchart.destroy();
//           this.socialToneBarchart.destroy();
//
//           this.displaySentimentData();
//         });
//
//         $('.tweets-carousel-container').slick({});
//
//         //adaptiveHeight is set on after the carousel is initiated because otherwise,
//         //the slick draggable div won't initially adjust its height for the first slide
//         $('.tweets-carousel-container').slick('slickSetOption', 'adaptiveHeight', true);
//
//         this.addSentimentData();
//       }
//     })
// });

//////////////

//   let selectedTweetId = $('.slick-slide.slick-current.slick-active').attr('id');
//   let elToAddToScreen = `<div id="replaceSentiment">${JSON.stringify(this.tweetsHash[selectedTweetId].emotion_tone)}</div>`;
//   $('#replaceSentiment').replaceWith(elToAddToScreen);
//
// $('body > div.tweets-carousel-container.slick-initialized.slick-slider > button.slick-next.slick-arrow')
//   .click(() => {
//     let selectedTweetId = $('.slick-slide.slick-current.slick-active').attr('id');
//     let elToAddToScreen = `<div id="replaceSentiment">${JSON.stringify(this.tweetsHash[selectedTweetId].emotion_tone)}</div>`;
//     $('#replaceSentiment').replaceWith(elToAddToScreen);
//   });
//
// $('body > div.tweets-carousel-container.slick-initialized.slick-slider > button.slick-prev.slick-arrow')
//   .click(() => {
//     let selectedTweetId = $('.slick-slide.slick-current.slick-active').attr('id');
//     let elToAddToScreen = `<div id="replaceSentiment">${JSON.stringify(this.tweetsHash[selectedTweetId].emotion_tone)}</div>`;
//     $('#replaceSentiment').replaceWith(elToAddToScreen);
//   });
//
//   window.tweetsHash = this.tweetsHash;

//this doesn't solve the carousel initial load problem, taking into account async:
// let idx = 0;
//
// let iterateThroughTweetsOnAsyncSuccess = (idx) => {
//   debugger
//   let currentTweet = this.tweets[idx];
//   this.tweetsHash[currentTweet.id_str] =  {id: currentTweet.id_str, timestamp: currentTweet.created_at, body: currentTweet.text};
//
//   let elForInsertion = `<div id=${currentTweet.id_str}></div>`;
//   $('.tweets-carousel-container').append(elForInsertion);
//
//   twttr.widgets.createTweet(currentTweet.id_str, document.getElementById(currentTweet.id_str))
//     .then(() => {
//       if (idx < this.tweets.length - 1) {
//         debugger
//         iterateThroughTweetsOnAsyncSuccess(idx + 1);
//       }
//     });
// }
//
// iterateThroughTweetsOnAsyncSuccess(idx);

// $('body > div.tweets-carousel-container.slick-initialized.slick-slider > button.slick-next.slick-arrow')
// $('body > div.tweets-carousel-container.slick-initialized.slick-slider > button.slick-prev.slick-arrow')

// what tweetsprocessor looked like as a constant:
//
// export const TweetsProcessor = {
//
//   displayTweetsAsEmbeds: (tweets) => {
//     let tweetsHash = {};
//
//     tweets.forEach(tweet => {
//       tweetsHash[tweet.id_str] =  {id: tweet.id_str, timestamp: tweet.created_at, body: tweet.text};
//
//       let elForInsertion = `<div id=${tweet.id_str}></div>`;
//       $('.tweets-carousel-container').append(elForInsertion);
//
//       twttr.widgets.createTweet(tweet.id_str, document.getElementById(tweet.id_str));
//     });
//
//       $('.tweets-carousel-container').toggle(true);
//
//       //jQuery to select for the tweet id of
//       //whichever tweet is currently selected in the carousel
//       // $('.slick-slide.slick-current.slick-active twitterwidget').attr('data-tweet-id')
//
//       $('.tweets-carousel-container').slick({
//         // dots: true
//       });
//
//       debugger
//   }
// }

// working dynamic embedCode for X number of posts from user's timeline
// let embedCode =  `<a class="twitter-timeline"
//                   href="https://twitter.com/${tweets[0]['user']['screen_name']}"
//                   data-tweet-limit="${tweets.length}">
//                   Tweets by ${tweets[0]['user']['screen_name']}</a>
//                   <script async src="//platform.twitter.com/widgets.js"
//                   charset="utf-8"></script>`;
