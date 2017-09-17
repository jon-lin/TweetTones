import SentimentsProcessor from './sentiments_processor.js';
import { sampleTweetsHash } from './sampleTweetsHash.js';
import { convertTimestamps } from './constants';
import htmlToText from 'html-to-text';
import merge from 'lodash/merge';

class TweetsProcessor {
  constructor(shadowDoc) {
    this.tweets = Array.prototype.slice.call(
      shadowDoc.querySelectorAll('div[data-tweet-id]')
    );

    this.selectedTweet = this.tweets[0];
    this.tweetsHash = {};
    this.SentimentsProcessor = new SentimentsProcessor(this.tweetsHash);

    this.twitterHandle = shadowDoc.querySelector(
          '.timeline-InformationCircle-widgetParent span a'
        ).innerHTML.replace(/&lrm;|\u200E/gi, '');

    this.extractTweetDataAndAddSentimentDataAndClickListeners(0);
    this.addListenerToTimeline(shadowDoc);
  }

  extractTweetDataAndAddSentimentDataAndClickListeners(i) {
      if (i === this.tweets.length) { return; }

      $('.loadDataText')[0].innerHTML = `Fetching sentiment data for ${i + 1}/${this.tweets.length} tweets`;

      let id = this.tweets[i].getAttribute('data-tweet-id');

      if (this.tweetAlreadyFetched(id)) {
        this.extractTweetDataAndAddSentimentDataAndClickListeners(i + 1);
        return;
      }

      let timestamp = this.tweets[i].querySelector('time').getAttribute('datetime'),
          body = this.parseBodyText(
            this.tweets[i].querySelector('p.timeline-Tweet-text').innerHTML
          );

      this.tweetsHash[id] = {id, timestamp, body, twitterHandle: this.twitterHandle};
      this.addSentimentData(id, body, i);

      if (i === 1) {this.selectedTweet.style.border = '5px solid #105170';}

      this.tweets[i].onclick = () => this.handleTweetClick(this.tweets[i]);
  }

  tweetAlreadyFetched(id) {
    return !!this.tweetsHash[id];
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

    return newString.replace(/\n/g, ' ');
  }

  addSentimentData(id, body, i) {
    //Attempt to fetch sentiment data from database of previous tweets.
    //If sentiment data isn't available, fetch from Watson and add to database.
    $.ajax(`api/tweets/${id}/sentiments`).then(result => {
      if (result.error) {
        this.fetchFromWatson(id, body, i);
      } else {
        this.tweetsHash[id]['emotion_tone'] = JSON.parse(result.emotion_tone);
        this.tweetsHash[id]['language_tone'] = JSON.parse(result.language_tone);
        this.tweetsHash[id]['social_tone'] = JSON.parse(result.social_tone);

        this.deployFetchOrUpdate(i);
      }
    });
  }

  fetchFromWatson(id, body, i) {
    $.ajax('/sentiments', { data: { inputText: body || " " }})
      .then(sentimentData => {
        let toneCategories = sentimentData.document_tone.tone_categories;

        this.addSentimentDataToOneTweet(id, toneCategories);

        let currentTweetCopy = merge({}, this.tweetsHash[id]);
        ['emotion_tone', 'language_tone', 'social_tone'].forEach(sentiment => {
          currentTweetCopy[sentiment] = JSON.stringify(currentTweetCopy[sentiment]);
        });

        this.persistTweetData(currentTweetCopy, i);
      });
  }

  persistTweetData(tweetData, i) {
    $.ajax({
      url: 'api/tweets',
      method: 'POST',
      data: JSON.stringify(tweetData),
      contentType: 'application/json'
    }).then(result => this.deployFetchOrUpdate(i));
  }

  deployFetchOrUpdate(i) {
    if (i === 0) { this.deployLandingPage(); }

    if (i === this.tweets.length - 1) {
      this.SentimentsProcessor.updateScatterplot(
        this.copyAndReformatData(this.tweetsHash));
    } else {
      this.extractTweetDataAndAddSentimentDataAndClickListeners(i + 1);
    }
  }

  deployLandingPage() {
    this.initializeCharts(this.tweets[0].getAttribute('data-tweet-id'));
    this.scatterplotSpinner();
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

  handleTweetClick(tweet) {
    this.selectedTweet.style.border = "";
    this.selectedTweet = tweet;
    this.selectedTweet.style.border = '5px solid #105170';
    let tweetId = tweet.getAttribute('data-tweet-id');
    this.SentimentsProcessor.updateBarcharts(this.tweetsHash[tweetId]);
  }

  scatterplotSpinner() {
    $('.scatterplot-container').append(`
      <div class='spinner scatterplot'>
        <img src="./loading.svg" />
        <div class="loadDataText">Loading more data...</div>
      </div>
    `);
  }

  addListenerToTimeline(shadowDoc) {
    let target = shadowDoc.querySelector('.timeline-TweetList');

    let observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.type === "childList") {

          let i = 0, nodeArray = [];
          while (i < mutation.addedNodes.length) {
            nodeArray.push(mutation.addedNodes[i].firstElementChild);
            i++;
          }

          this.tweets = this.tweets.concat(nodeArray);

          this.scatterplotSpinner();
          this.extractTweetDataAndAddSentimentDataAndClickListeners(0);
        }
      });
    });

    observer.observe(target, { childList: true });
  }

  copyAndReformatData(data) {
    let copyData = merge({}, data);
    copyData = Object.values(copyData);
    convertTimestamps(copyData);
    return copyData;
  }

  initializeCharts(id) {
    this.SentimentsProcessor.createBarCharts(id);
    this.SentimentsProcessor.createScatterplot(
      this.copyAndReformatData(this.tweetsHash));
    this.SentimentsProcessor.finalizeDeployment();

    $('.spinner').remove();
    $('#twitter-timeline-container').removeClass('stopScrollbarAppearance');
    $('#mainContainer').removeClass('notyetloaded');
    $('.scatterplot-container').removeClass("hidden");
  }
}

export default TweetsProcessor;
