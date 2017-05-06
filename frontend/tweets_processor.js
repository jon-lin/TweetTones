// import { slick } from 'slick';

export const TweetsProcessor = {

  displayTweetsAsEmbeds: (tweets) => {
    // tweets.forEach(tweet => (
    //
    //   twttr.widgets.createTweet(tweet.id_str, document.getElementById('tweetsContainer')
    //
    //
    // ));

    twttr.widgets.createTweet(tweets[0].id_str, document.getElementById('hitest'));

      $('.tweets-carousel-container').toggle(true);

      // `<div><h3>${}`

      $(".single-tweet-in-carousel").slick({
        dots: true
      });

      // <div><h3>1</h3></div>
      // <div><h3>2</h3></div>
      // <div><h3>3</h3></div>
      // <div><h3>4</h3></div>
      // <div><h3>5</h3></div>
      // <div><h3>6</h3></div>

    // });
  }
}

// working dynamic embedCode for X number of posts from user's timeline
// let embedCode =  `<a class="twitter-timeline"
//                   href="https://twitter.com/${tweets[0]['user']['screen_name']}"
//                   data-tweet-limit="${tweets.length}">
//                   Tweets by ${tweets[0]['user']['screen_name']}</a>
//                   <script async src="//platform.twitter.com/widgets.js"
//                   charset="utf-8"></script>`;
