# TweetTones
* [Live link](https://www.tweettones.me/)

### Background

TweetTones is a data visualization web app that uses the Twitter API and IBM Watson's Tone Analyzer to display a sentiment analysis of any Twitter user's most recent tweets. Built with HTML5, CSS3 and JavaScript, the app leverages jQuery, Slick.js and Chart.js to provide a clean interface for examining tweet analyses.

![main](lib/assets/TweetTonesSplashPage.png)

### Highlights

#### APIs: Twitter + IBM Watson's Tone Analyzer

<!-- TweetTones uses a lightweight Express server -->

#### Carousels

![main](lib/assets/TweetTonesCarouselsDemo.gif)

After tweets are fetched, divs are inserted into a carousel container and assigned IDs matching each tweet's unique ID. Single tweet widgets are subsequently embedded into their corresponding divs using Twitter's JavaScript Factory Function.

https://dev.twitter.com/web/embedded-tweets/javascript-create

```javascript
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
```

#### Charts

##### Custom Tooltips

![main](lib/assets/TweetTonesLineChartScreenshot.png)
