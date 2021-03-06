<div style='margin-bottom: 20px'>
  <div>
    <div>
      <h1>TweetTones</h1>
      <button style="background: #6AB2D5; border: none; border-radius: 5px; padding: 6px 6px 6px 6px"><a style="font-size: 18px; color: white; text-decoration: none" href="http://tweettones.herokuapp.com/">Live Link</a></button>
    </div>
    <div>
      <h2>Background</h2>
      <p>TweetTones is a data visualization web app that uses IBM Watson's Tone Analyzer to display a sentiment analysis of any Twitter user's most recent tweets. Built with HTML5, CSS3 and JavaScript, the app leverages jQuery and D3.js to provide a clean interface for examining tweet analyses.</p>
    </div>
    <div style='width: 565px; margin-right: 20px'>
      <h2>Features</h2>
      <ul>
        <li>Convenient browsing of any Twitter user's timeline</li>
        <li>Auto-loading of new tweets (no refresh needed to see most recent tweets)</li>
        <li>Users can load as many old tweets as they want, 20 at a time</li>
        <li>Previously fetched data are persisted to a database for faster load times on revisits</li>
        <li>All data on the page can be downloaded in JSON or CSV format</li>
        <li>Bar charts auto-update when a tweet is clicked on</li>
        <li>Scatterplot auto-updates whenever more tweets are fetched</li>
        <li>Users can zoom in on the scatterplot to look at tweets on a minute-by-minute basis</li>
        <li>Error handling if a Twitter screenname isn't found
        <li>Custom scatterplot tooltips identify tweet and date & time</li>
        <li>Responsive to all computer browser window sizings</li>
      </ul>
    </div>
  </div>
</div>

<img src="./lib/assets/TweetTonesSplashPage.png" height="500px">

## GIFs of Chart Interactivity

### When a tweet is clicked on, the bar charts update to show its sentiment data
<img src="./lib/assets/TweetTonesBarChartsDemo.gif">

### Scatterplot features zoom & pan functionality, tooltips and legend toggling
<img src="./lib/assets/TweetTonesScatterplotDemo.gif">

### Data can be downloaded in CSV format for use in Excel or Google Sheets
<img src="./lib/assets/TweetTonesCSVDemo.gif">
