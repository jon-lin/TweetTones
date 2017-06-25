export const htmlForModal =

`<div class="splash-modal">
  <div class='headerText'>
    <div class="splashTitle">TweetTones</div>
    <div class="splashSubtitle">Analyze the sentiment of any Twitter user's recent tweets.</div>
  </div>

  <div class='splashLogo'></div>

  <div class="inputSection">
    <div class="customInput">
      <div>Enter a Twitter username:</div>
      <input id="twitterUserInputField" class="twitterUser" type="text"></input>
      <button value='customInputButton' class="submitInput">Submit</button>
    </div>

    <span class="lineforOR">
      <span class="line"></span>
        <text id='ortextidforplainform'>or pick a user</text>
      <span class="line"></span>
    </span>

    <div class="demo-buttons">
      <div class="demo-buttons-column1">
        <button value='realDonaldTrump' class="submitDemo">Donald Trump</button>
        <button value='BarackObama' class="submitDemo">Barack Obama</button>
        <button value='HillaryClinton' class="submitDemo">Hillary Clinton</button>
      </div>
      <div class="demo-buttons-column2">
        <button value='katyperry' class="submitDemo">Katy Perry</button>
        <button value='taylorswift13' class="submitDemo">Taylor Swift</button>
        <button value='justinbieber' class="submitDemo">Justin Bieber</button>
      </div>
      <div class="demo-buttons-column3">
        <button value='KingJames' class="submitDemo">LeBron James</button>
        <button value='KDTrey5' class="submitDemo">Kevin Durant</button>
        <button value='IBMWatson' class="submitDemo">IBM Watson</button>
      </div>
    </div>
  </div>
</div>`;
