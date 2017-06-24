import SentimentsProcessor from './sentiments_processor.js';
import { sampleTweetsHash } from './sampleTweetsHash.js';
import htmlToText from 'html-to-text';

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

      // let timestamp = new Date(this.tweets[i].querySelector('time').getAttribute('datetime')).toISOString(),
      let timestamp = this.tweets[i].querySelector('time').getAttribute('datetime'),
          body = this.parseBodyText(this.tweets[i].querySelector('p.timeline-Tweet-text').innerHTML);

      this.tweetsHash[id] = {id, timestamp, body};
      this.addSentimentData(id, body, i);

      this.tweets[i].onclick = () => this.updateBarcharts(id);
    }
  }

  parseBodyText(string) {
    string = htmlToText.fromString(string);
    let newString = "",
        trip = false;

    let i = 0;
    while (i < string.length) {
      if ((string[i + 1] === '[' || trip) && string[i] !== ']') {
        trip = true; i++; continue;
      } else if (string[i] === ']') {
        trip = false; i++; continue;
      }

      newString += string[i];
      i++;
    }

    return newString;
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
    console.log(this.tweetsHash[id]);
    this.SentimentsProcessor.updateBarcharts(this.tweetsHash[id]);
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
    debugger
    this.SentimentsProcessor.tweetsHash = this.tweetsHash;
    debugger
    this.SentimentsProcessor.createSentimentDataBarCharts(id);
    this.SentimentsProcessor.createLineGraphs();
    this.SentimentsProcessor.finalizeDeployment();

    $('#spinner').remove();
    $('body').removeClass('notyetloaded');
  }
}

export default TweetsProcessor;