import { APIUtil } from './api_util.js';
import TweetsProcessor from './tweets_processor.js';
import Modal from 'modal-js';

$(document).ready(
  () => {
    $('#navbar').toggle();

    let html =   `<div class="splash-modal">
                      <div class="splashTitle">TweetTones</div>
                      <div class="splashSubtitle">Analyze the sentiment of any Twitter user's recent tweets.</div>
                      <img src='/tweettones.png' class='splashLogo'/>

                      <div class="inputSection">
                        <div class="customInput">
                          <div>Enter a Twitter username:</div>
                          <input class="twitterUser" type="text"></input>
                          <button value='customInput' class="submitInput">Submit</button>
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

    let modal = new Modal(html, {
        containerEl: document.getElementById('modals-container'),
        activeClass: 'modal-active',
        onClickOutside: () => {}
    });

    modal.show();

    $('.submitInput, .submitDemo').click((e) => {

      let searchTerm;

      if (e.currentTarget.value === 'customInput') {
        searchTerm = $('.twitterUser').val();
      } else if (e.currentTarget.value !== '') {
        searchTerm = e.currentTarget.value;
      }

      APIUtil.fetchTweets(searchTerm)
        .then(tweets => {
          modal.hide().then(() => $('.splash-modal').css('display',' none'));
          $('#emotion-linechart').css('width', '800');
          $('#emotion-linechart').css('height', '600');
          $('#navbar').toggle();

          new TweetsProcessor(tweets);
        });
    });

  }
);
