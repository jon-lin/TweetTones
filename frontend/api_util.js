export const APIUtil = {

  fetchTweets: (twitter_user) => (
    $.ajax({
      url: "tweets/index",
      method: "GET",
      data: {twitter_user}
    })
  ),

  fetchSentiments: (input) => (
    $.ajax({
      url: "sentiments/index",
      method: "GET",
      data: {input}
    })
  )

};
