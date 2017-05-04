import { APIUtil } from './api_util.js';

//
APIUtil.fetchTweets().then( (result) => {
    console.log(result)

    let tweetTexts = result.map((tweetObj) => {
        return tweetObj.text
    });


    // tweetTexts.forEach((text) => {
    //   APIUtil.fetchSentiments(text).then((sentiment) => document.write(sentiment))
    // });

    APIUtil.fetchSentiments(tweetTexts[0]).then(
      (sentiment) => document.write(
        sentiment["document_tone"]["tone_categories"][0]["tones"][0]["tone_name"] + " " + sentiment["document_tone"]["tone_categories"][0]["tones"][0]["score"]
      )
    );

  }
);
