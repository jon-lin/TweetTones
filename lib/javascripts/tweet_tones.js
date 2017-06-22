import TweetsProcessor from './tweets_processor.js';
import TweetsProcessorDEV from './tweets_processor_DEV.js'
import Modal from 'modal-js';
import '../styles/styles.css';

$(document).ready(
  () => {
      let html =   `<div class="splash-modal">
                        <div class="splashTitle">TweetTones</div>
                        <div class="splashSubtitle">Analyze the sentiment of any Twitter user's recent tweets.</div>
                        <img src='./tweettones.png' class='splashLogo'/>

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

      let errors = {
        blankField: `Twitter username can't be blank!`,
        usernameNotFound: `Twitter username not found!`
      }

      let handleError = errorMsg => {
        $('.customInput').append(
          `<div class='errorMessage'>${errorMsg}</div>`
        );

        setTimeout(() => $('.errorMessage').remove(), 2000);
      }

      let modal = new Modal(html, {
          containerEl: document.getElementById('modals-container'),
          activeClass: 'modal-active',
          onClickOutside: () => {}
      });

      let fetchTweets = searchTerm => {
          if (!process.env.keys) {
            modal.hide().then(() => $('.splash-modal').css('display','none'));
            $('#navbar').toggle();
            new TweetsProcessorDEV();
            return;
          }

          $.ajax('/tweets', { data: { screen_name: searchTerm } })
            .then(tweets => {
                if (tweets.errors) {
                  handleError(errors.usernameNotFound);
                } else {
                  modal.hide().then(() => $('.splash-modal').css('display','none'));
                  $('#navbar').toggle();

                  new TweetsProcessor(tweets);
                }
              });
        }

      let processTweets = (e) => {
          let searchTerm,
              submittedInput = $('.twitterUser').val(),
              targetValue = e.currentTarget.value,
              targetType = e.currentTarget.type

          if (targetValue === 'customInputButton' || targetType === 'text') {
            submittedInput ? (searchTerm = submittedInput) : handleError(errors.blankField)
            if (!submittedInput) { return; }
          } else {
            searchTerm = targetValue;
          }

          fetchTweets(searchTerm);
        }

      $('body').addClass('spinning');

      $('#navbar').toggle();

      $('.twitterUser').on('keypress', e => {
        if (e.which === 13) { processTweets(e); }
      });

      $('.submitInput, .submitDemo').click(e => processTweets(e));

      modal.show();
    }
);
