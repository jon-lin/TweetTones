import SentimentsProcessor from './sentiments_processor.js';
import { sampleTweetsHash } from './sampleTweetsHash.js';

class TweetsProcessor {
  constructor(shadowDoc) {
    this.tweets = shadowDoc.querySelectorAll('div[data-tweet-id]');
    this.loadButton = shadowDoc.getElementsByClassName(
          'timeline-LoadMore-prompt timeline-ShowMoreButton customisable'
          )[0];
    this.tweetsHash = {};
    this.SentimentsProcessor = new SentimentsProcessor(this.tweetsHash);

    this.spinner();
    this.extractTweetDataAndAddSentimentDataAndClickListeners();
    // this.addClickListenerToLoadButton(shadowDoc);
  }

  spinner() {
    $('body').append(`
      <div id='spinner'>
        <img src="./loading.svg" />
        <div id="loadData">Loading tweets...</div>
      </div>
    `);
  }

  extractTweetDataAndAddSentimentDataAndClickListeners() {
    for (let i = 0; i < this.tweets.length; i++) {
      let id = this.tweets[i].getAttribute('data-tweet-id');
      if (this.tweetAlreadyFetched(id)) { continue; }

      let timestamp = new Date(this.tweets[i].querySelector('time').getAttribute('datetime')).toISOString(),
          body = this.tweets[i].querySelector('p.timeline-Tweet-text').innerHTML;

      this.tweetsHash[id] = {id, timestamp, body};
      this.addSentimentData(id, body, i);

      this.tweets[i].onclick = () => this.updateBarcharts(id);
    }
  }

  tweetAlreadyFetched(id) {
    return !!this.tweetsHash[id];
  }

  addSentimentData(id, body, i) {
    $.ajax('/sentiments', { data: { inputText: body }})
      .then(sentimentData => {
        let toneCategories = sentimentData.document_tone.tone_categories;
        this.addSentimentDataToOneTweet(id, toneCategories);

        if (i === this.tweets.length - 1) {
          this.initializeCharts(this.tweets[0].getAttribute('data-tweet-id'));
        }
      });
  }

  addSentimentDataToOneTweet(id, toneCategories) {
    let setTweetsHash = this.tweetsHash[id];

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

  updateBarcharts(id) {
    console.log(this.tweetsHash[id])
  }

  // addClickListenerToLoadButton(shadowDoc, loadButton) {
  //     loadButton.onclick = () => {
  //       setTimeout(() => {
  //         let updatedTweets = shadowDoc.querySelectorAll('div[data-tweet-id]');
  //         this.extractTweetData(updatedTweets);
  //       }, 1000)
  //     }
  // }

  initializeCharts(id) {
    this.SentimentsProcessor.tweetsHash = this.tweetsHash;
    this.SentimentsProcessor.createSentimentDataBarCharts(id);
    this.SentimentsProcessor.createLineGraphs();
    this.SentimentsProcessor.finalizeDeployment();

    $('#spinner').remove();
    $('body').removeClass('notyetloaded');
  }
}

export default TweetsProcessor;
