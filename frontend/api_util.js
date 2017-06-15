export const APIUtil = {

  fetchTweets: (twitter_user) => (
    $.ajax('/tweets', { data: { screen_name: twitter_user } })
  ),

  fetchSentiments: (input) => (
    $.ajax({
      url: "sentiments/index",
      method: "GET",
      data: {input}
    })
  )

};
