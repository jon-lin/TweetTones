import { APIUtil } from './api_util.js';
// import * as d3 from "d3";
import Chart from 'chart.js';

class TweetsProcessor {
  constructor(tweets) {
    this.tweets = tweets;
    this.tweetsHash = {};
    // this.selectedTweetId = null;
    this.displayTweetsAsEmbeds();
    this.data = [];
  }

  displayTweetsAsEmbeds() {
    //DOMParser is used to convert UTF-8 symbols in tweet to plain text
    let parser = new DOMParser;

    this.tweets.forEach(tweet => {
      let modText = parser.parseFromString(tweet.text, 'text/html').body.textContent;
      this.tweetsHash[tweet.id_str] =  {id: tweet.id_str, timestamp: tweet.created_at, body: modText};

      let elForInsertion = `<div id=${tweet.id_str}></div>`;
      $('.tweets-carousel-container').append(elForInsertion);

      //The line below is dangerous in that you're calling an async function
      //inside a forEach loop. What if the loop doesn't wait for each
      //async function to finish before moving onto the next iteration?
      twttr.widgets.createTweet(tweet.id_str, document.getElementById(tweet.id_str));
    });

    $('.tweets-carousel-container').slick({});

    //adaptiveHeight is set on after the carousel is initiated because otherwise,
    //the slick draggable div won't initially adjust its height for the first slide
    $('.tweets-carousel-container').slick('slickSetOption', 'adaptiveHeight', true);

    this.addSentimentData();
  }

  addSentimentData() {
    let count = 0;
    for (let key in this.tweetsHash) {

      //The line below is dangerous in that you're calling an async function
      //inside a forEach loop. What if the loop doesn't wait for each
      //async function to finish before moving onto the next iteration?
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
          setTweetsHashSocial['emotionalRange'] = social_tone[4].score;

          count++;
          if (count === this.tweets.length) { this.displaySentimentData(); }
      });

    }


  }

  displaySentimentData() {

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
    let selectedTweetId = $('.slick-slide.slick-current.slick-active').attr('id');
    let emotion_tone_data = this.tweetsHash[selectedTweetId].emotion_tone;


    debugger
    let ctx = $("#emotion-tone-barchart");

    let emotions = Object.keys(emotion_tone_data);
    let emotion_values = emotions.map(emotion => emotion_tone_data[emotion]);

    let emotionToneBarchart = new Chart(ctx, {
      type: 'line',
      data: {
          labels: emotions,
          datasets: [{
              label: 'Emotional Tone',
              data: emotion_values,
              backgroundColor: [
                  'rgba(255, 99, 132, 0.2)',
                  'rgba(54, 162, 235, 0.2)',
                  'rgba(255, 206, 86, 0.2)',
                  'rgba(75, 192, 192, 0.2)',
                  'rgba(153, 102, 255, 0.2)',
                  'rgba(255, 159, 64, 0.2)'
              ],
              borderColor: [
                  'rgba(255,99,132,1)',
                  'rgba(54, 162, 235, 1)',
                  'rgba(255, 206, 86, 1)',
                  'rgba(75, 192, 192, 1)',
                  'rgba(153, 102, 255, 1)',
                  'rgba(255, 159, 64, 1)'
              ],
              borderWidth: 1
          }]
      },
      options: {
          scales: {
              yAxes: [{
                  ticks: {
                      beginAtZero:true
                  }
              }]
          }
      }
    });
  }
}

export default TweetsProcessor;

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
