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
                      <div class="splashbottom3elements">
                        <div>Search by Twitter User:</div>
                        <input class="twitterUser" type="text"></input>
                        <button class="submitInput">Submit</button>
                        <button class="submitDemo">Demo</button>
                      </div>
                    </div>`;

    let modal = new Modal(html, {
        containerEl: document.getElementById('modals-container'),
        activeClass: 'modal-active',
        onClickOutside: () => {}
    });

    modal.show();

    $('.submitInput').click(() => {
      if ($('.twitterUser').val() !== "") {
        APIUtil.fetchTweets($('.twitterUser').val())
        .then(tweets => {

          modal.hide().then(() => $('.splash-modal').css('display',' none'));
          $('#emotion-linechart').css('width', '800');
          $('#emotion-linechart').css('height', '600');
          $('#navbar').toggle();

          new TweetsProcessor(tweets);
        });
      }
    });

    $('.submitDemo').click(() => {

      APIUtil.fetchTweets('realDonaldTrump')
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
