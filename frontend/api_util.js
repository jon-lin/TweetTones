export const APIUtil = {

  fetchTweets: () => (
    $.ajax({
      url: "tweets/index",
      method: "GET",
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
