import TweetsProcessor from './tweets_processor.js';
import Modal from 'modal-js';
import { htmlForModal } from './splash_modal.js';

$(document).ready(
  () => {
      console.log(process.env.NODE_ENV); //test process.env.NODE_ENV

      let html = htmlForModal;

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

      let spinner = () => {
          $('body').append(`
            <div class='spinner'>
              <img src="./loading.svg" />
              <div class="loadDataText">Loading data...</div>
            </div>
          `);
      }

      let fetchTweets = searchTerm => {
          spinner();

          twttr.widgets.createTimeline(
            {sourceType: "profile", screenName: searchTerm},
            document.getElementById("twitter-timeline-container")
          ).then(e => {
              if (typeof e === 'undefined') {
                $('.spinner').remove();
                handleError(errors.usernameNotFound);
              } else {
                modal.hide().then(() => $('.splash-modal').css('display','none'));
                $('#navbar').removeClass('stopflicker');

                new TweetsProcessor(e.contentDocument);
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

      $('#mainContainer').addClass('notyetloaded');

      $('.menuDropdownMenu, .arrow-up').toggle();

      $('.twitterUser').on('keypress', e => {
        if (e.which === 13) { processTweets(e); }
      });

      $('.submitInput, .submitDemo').click(e => processTweets(e));

      modal.show();
    }
);
