## Tweet Tones

### Background

Tweet Tones is a data visualization web app that displays a sentiment analysis of a Twitter user's most recent tweets.

Written in JavaScript and HTML5, the app uses multiple APIs and web technologies to provide a clean interface for looking at tweet analyses.

### Functionality & MVP  

Users will be able to:

- [ ] Select a specific Twitter user by entering a screen name upon opening the app
- [ ] Pick a default Twitter user if they don't want to enter a screen name
- [ ] Use left/right arrow keys and/or click to rotate through a carousel of recent tweets (tweets should be embedded in the page)
- [ ] Update the sentiment analysis displayed on the page as different tweets are selected

This project will also include:

- [ ] An "About" modal providing more info about IBM Watson's Tone Analyzer and Tweet Tones
- [ ] A production README

Bonuses:
- [ ] Charts will dynamically rearrange themselves depending on the data (ex: the dominant emotion of a given tweet always moves to the top row of the chart)
- [ ] Allow users to put in any string of text for sentiment analysis instead of fetching tweets
- [ ] Give users the ability to put in additional search parameters (i.e. tweets within a certain time range, containing a certain keyword, etc.)

### Wireframes

This single-page app will have a "splash" modal; an "about" modal; a home page with tweets and sentiment analyses; and links to my Github and LinkedIn.

User controls will include left/right arrow keys and clicking.

![wireframes](https://github.com/jclin2013/TweetTones/blob/master/tweet_tones_splash.png)

![wireframes](https://github.com/jclin2013/TweetTones/blob/master/tweet_tones_homepage.png)

### Architecture and Technologies

This project will be implemented with the following technologies:

- `JavaScript` for AJAX requests and app logic,
- `HTML5` and `CSS3` for carousel animation, page layout,
- `jQuery` for mouse and keyboard event listening
- `Chart.js` for displaying sentiment analysis data
- APIs supplied by Twitter and IBM Watson's Tone Analyzer

### Implementation Timeline

**Day 1**: Setup a splash modal form that allows a user to enter a screen name when the page loads.

- Give the user the option to pick a default Twitter user (Donald Trump)
- Write an AJAX request to fetch that Twitter user's most recent tweets; handle any errors
- Get successfully fetched tweets to display on the page
- Write AJAX requests to generate sentiment analyses of the tweets; handle any errors
- Get successful analyses to display on the page

**Day 2**: Create a carousel that the user can rotate through to select a tweet and its analysis

- Style the carousel
- Get acquainted with Chart.js; use it to display data in a smooth and polished way
- Create and style the 'About' modal
- Add links to Github and LinkedIn

**Day 3**: Make charts change the order of their contents as a user rotates through tweets based on dominant emotions

- Write the app's production README
- Implement any remaining styling
- Create seed data that will load even if AJAX requests are unsuccessful
