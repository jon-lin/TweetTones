import SentimentsProcessor from './sentiments_processor.js';
import { sampleTweetsHash } from './sampleTweetsHash.js';

class TweetsProcessorDEV {
  constructor() {
    this.displayTweetsAsEmbeds();
  }

  displayTweetsAsEmbeds() {
    this.spinner();
    this.insertDivsIntoCarousel();
    this.insertTweetEmbedsIntoCarousel(0, Object.values(sampleTweetsHash));
  }

  spinner() {
    $('body').append(`<div id='spinner'><img src="./loading.svg" /></div>`);
  }

  insertDivsIntoCarousel() {
    let sampleTweetsArray = Object.values(sampleTweetsHash);
    for (let i = 0; i < sampleTweetsArray.length; i++) {
      let elForInsertion = `<div id=${sampleTweetsArray[i].id}></div>`;
      $('.tweets-carousel-container').append(elForInsertion);
    }
  }

  insertTweetEmbedsIntoCarousel(idx, tweets) {
    let tweetId = tweets[idx].id;
    twttr.widgets.createTweet(tweetId, document.getElementById(tweetId))
      .then(() => {
        if (idx < tweets.length - 1) {
          this.insertTweetEmbedsIntoCarousel(idx + 1, tweets);
        } else {
          $('.tweets-carousel-container').slick({adaptiveHeight: true});
          new SentimentsProcessor(sampleTweetsHash);
        }
      });
  }
}

export default TweetsProcessorDEV;
