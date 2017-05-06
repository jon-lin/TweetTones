// import { slick } from 'slick';

export const TweetsProcessor = {

  displayTweetsAsEmbeds: (tweets) => {
    let tweetsHash = {};

    tweets.forEach(tweet => {
      tweetsHash[tweet.id_str] =  {id: tweet.id_str, timestamp: tweet.created_at, body: tweet.text};

      let elForInsertion = `<div><h3 id=${tweet.id_str}></h3></div>`;
      $('.single-tweet-in-carousel').append(elForInsertion);

      twttr.widgets.createTweet(tweet.id_str, document.getElementById(tweet.id_str));
    });

      $('.tweets-carousel-container').toggle(true);

      //jQuery to select for the tweet id of
      //whichever tweet is currently selected in the carousel
      // $('.slick-slide.slick-current.slick-active h3 twitterwidget').attr('data-tweet-id')

      $(".single-tweet-in-carousel").slick({
        dots: true
      });
  }
}

// working dynamic embedCode for X number of posts from user's timeline
// let embedCode =  `<a class="twitter-timeline"
//                   href="https://twitter.com/${tweets[0]['user']['screen_name']}"
//                   data-tweet-limit="${tweets.length}">
//                   Tweets by ${tweets[0]['user']['screen_name']}</a>
//                   <script async src="//platform.twitter.com/widgets.js"
//                   charset="utf-8"></script>`;
