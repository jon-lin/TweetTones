import SentimentsProcessor from './sentiments_processor.js';

class TweetsProcessor {
  constructor(tweets) {
    this.tweets = tweets;
    this.tweetsHash = {};
    this.displayTweetsAsEmbeds();
  }

  displayTweetsAsEmbeds() {
    this.spinner();
    this.storeTweetsInStateAndInsertDivsIntoCarousel();
    this.insertTweetEmbedsIntoCarousel(0);
    this.initializeTweetsCarousel();
  }

  spinner() {
    $('body').append(`
      <div id='spinner'>
        <img src="./loading.svg" />
        <div id="loadData">Loading tweets...</div>
      </div>
    `);
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
        $('#loadData')[0].innerHTML = `Embedding ${idx + 1}/${this.tweets.length} tweets`;
        if (idx < this.tweets.length - 1) {
          this.insertTweetEmbedsIntoCarousel(idx + 1);
        } else {
          this.addSentimentData(0, Object.keys(this.tweetsHash));
        }
      });
  }

  initializeTweetsCarousel() {
    $('.tweets-carousel-container').slick({adaptiveHeight: true});
  }

  addSentimentData(idx, keys) {
    $.ajax('/sentiments', { data: { inputText: this.tweetsHash[keys[idx]]['body'] } })
      .then(sentimentData => {
        $('#loadData')[0].innerHTML = `Fetching sentiment data for ${idx + 1}/${keys.length} tweets`;

        let toneCategories = sentimentData.document_tone.tone_categories;
        this.addSentimentDataToOneTweet(keys[idx], toneCategories);

        if (idx < keys.length - 1) {
          this.addSentimentData(idx + 1, keys);
        } else {
          new SentimentsProcessor(this.tweetsHash);
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
}

export default TweetsProcessor;
