import SentimentsProcessor from './sentiments_processor.js';
import { sampleTweetsHash } from './sampleTweetsHash.js';

class TweetsProcessorDEV {
  constructor(searchTerm) {
    this.spinner();
    this.insertTwitterTimeline(searchTerm);
    // this.displayTweetsAsEmbeds();
    // this.searchTerm = searchTerm;
    // debugger
  }

  // displayTweetsAsEmbeds() {
    // this.spinner();
    // this.insertTwitterTimeline();
    // this.insertDivsIntoCarousel();
    // this.insertTweetEmbedsIntoCarousel(0, Object.values(sampleTweetsHash));
  // }

  spinner() {
    $('body').append(`
      <div id='spinner'>
        <img src="./loading.svg" />
        <div id="loadData">Loading tweets...</div>
      </div>
    `);
  }

  insertTwitterTimeline(searchTerm) {
    twttr.widgets.createTimeline(
      {
        sourceType: "profile",
        screenName: searchTerm
      },
      document.getElementById("twitter-timeline-container"),
      {
        tweetLimit: 20
      }
    ).then(() => {
      this.setClickListenersOnTweets();
      $('#spinner').remove();
      $('body').removeClass('notyetloaded');
    });

    new SentimentsProcessor(sampleTweetsHash);
    // $('#spinner').remove();
    // $('body').removeClass('notyetloaded');
  }

  setClickListenersOnTweets() {
    let setListeners = event => {
      let shadowDoc = event.target.contentDocument,
          tweets = shadowDoc.querySelectorAll('div[data-tweet-id]'),
          loadButton = shadowDoc.getElementsByClassName(
            'timeline-LoadMore-prompt timeline-ShowMoreButton customisable'
          )[0];

      for (let i = 0; i < tweets.length; i++) {
        let tweetId = tweets[i].getAttribute('data-tweet-id');
        tweets[i].onclick = () => {
          console.log('hello');
          updateBarcharts(tweetId);
        };
      }
    }

    twttr.ready(function (twttr) {
      twttr.events.bind('rendered', setListeners);
    });
    // twttr.events.bind(
    //   'loaded',
    //   function (event) {
    //     event.widgets.forEach(function (widget) {
    //       console.log("Created widget", widget.id);
    //     });
    //   }
    // );

    // twttr.ready(function (twttr) {
    //   twttr.events.bind(
    //     'rendered',
    //     function (event) {
    //       console.log("Created widget", event.target.id);
    //     }
    //   );
    // });

    // debugger
    // twttr.ready(function (twttr) {
      // Now bind our custom intent events
      // twttr.events.bind('click', e => console.log(e));
      // twttr.events.bind('tweet', tweetIntentToAnalytics);
      // twttr.events.bind('retweet', retweetIntentToAnalytics);
      // twttr.events.bind('like', likeIntentToAnalytics);
      // twttr.events.bind('follow', followIntentToAnalytics);
    // });
    // debugger
    // let tweets = document.querySelectorAll('div[data-tweet-id]');
    //
    // for (let i = 0; i < tweets.length; i++) {
    //   debugger
    //   tweets[i].onclick = e => console.log('hello');
    // }
  // }

  // insertDivsIntoCarousel() {
  //   let sampleTweetsArray = Object.values(sampleTweetsHash);
  //   for (let i = 0; i < sampleTweetsArray.length; i++) {
  //     let elForInsertion = `<div id=${sampleTweetsArray[i].id}></div>`;
  //     $('.tweets-carousel-container').append(elForInsertion);
  //   }
  // }
  //
  // insertTweetEmbedsIntoCarousel(idx, tweets) {
  //   let tweetId = tweets[idx].id;
  //   twttr.widgets.createTweet(tweetId, document.getElementById(tweetId))
  //     .then(() => {
  //       $('#loadData')[0].innerHTML = `Embedding ${idx + 1}/${tweets.length} tweets`;
  //       if (idx < tweets.length - 1) {
  //         this.insertTweetEmbedsIntoCarousel(idx + 1, tweets);
  //       } else {
  //         $('.tweets-carousel-container').slick({adaptiveHeight: true});
  //         new SentimentsProcessor(sampleTweetsHash);
  //       }
  //     });
  }
}

export default TweetsProcessorDEV;
