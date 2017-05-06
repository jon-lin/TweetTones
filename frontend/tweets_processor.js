import { APIUtil } from './api_util.js';

class TweetsProcessor {
  constructor(tweets) {
    this.tweets = tweets;
    this.tweetsHash = {};
    this.displayTweetsAsEmbeds();
  }

  displayTweetsAsEmbeds() {
    this.tweets.forEach(tweet => {
      this.tweetsHash[tweet.id_str] =  {id: tweet.id_str, timestamp: tweet.created_at, body: tweet.text};

      let elForInsertion = `<div id=${tweet.id_str}></div>`;
      $('.tweets-carousel-container').append(elForInsertion);

      twttr.widgets.createTweet(tweet.id_str, document.getElementById(tweet.id_str));
    });

      $('.tweets-carousel-container').toggle(true);

      $('.tweets-carousel-container').slick({});

      this.addSentimentData();
  }

  addSentimentData() {
    for (let key in this.tweetsHash) {
      APIUtil.fetchSentiments(this.tweetsHash[key]['body'])
        .then(sentimentData => this.tweetsHash[key]['sentimentData'] = sentimentData);
    }

    console.log(this.tweetsHash);
  }

}

export default TweetsProcessor;

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
