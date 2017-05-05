export const TweetsProcessor = {

  displayTweetsAsEmbeds: (tweets) => {
    tweets.forEach(tweet => {
      twttr.widgets.createTweet(tweet.id_str, document.getElementById('tweetsContainer'));
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
