import { APIUtil } from './api_util.js';
import Modal from 'modal-js';

$(document).ready(
  () => {
    let html =  `<div class="splash-modal">
                    <div class="splashTitle">TweetTones</div>
                    <div class="splashSubtitle">Gauge the emotional contours of tweets, hundreds at a time</div>
                    <img src='/tweettones.png' class='splashLogo'/>
                    <div class="splashbottom3elements">
                      <div>Search by Twitter User:</div>
                      <input type="text"></input>
                      <button class="submitInput">Submit</button>
                      <button class="submitDemo">Demo</button>
                    </div>
                </div>`;

    let modal = new Modal(html, {
        containerEl: document.getElementById('modals-container'),
        activeClass: 'modal-active',
    });

    $('.submitInput').click((e) => {
      modal.hide()
      .then( )
      .then(() => $('.splash-modal').css('display',' none'))
    })

    modal.show()
  }
);



// onClickOutside: console.log('hey')
// modal.show();
// modal.hide();

// modal.show(); // show the modal
 // hide the modal

// $("<form><label>Search by Twitter User.<input type=\"text\"></input></label></form>").append('.inner')
// let hello = () => {
//   console.log("hi")
// }
//
// $( "h2" ).append(modal(
// { title: 'Delete object'
// // , content: 'Are you sure you want to delete this object?'
// , input: { type: 'text' }
// , clickOutsideToClose: true
// , className: 'modal'
// })
// .on('confirm', hello))

// , buttons:
//   [ { text: 'Don’t delete', event: 'cancel', keyCodes: [ 27 ] }
//   , { text: 'Delete', event: 'confirm', className: 'button-danger', iconClassName: 'icon-delete' }
//   ]

//
// APIUtil.fetchTweets().then( (result) => {
//     console.log(result)
//
//     let tweetTexts = result.map((tweetObj) => {
//         return tweetObj.text
//     });
//
//
//     // tweetTexts.forEach((text) => {
//     //   APIUtil.fetchSentiments(text).then((sentiment) => document.write(sentiment))
//     // });
//
//     APIUtil.fetchSentiments(tweetTexts[0]).then(
//       (sentiment) => document.write(
//         sentiment["document_tone"]["tone_categories"][0]["tones"][0]["tone_name"] + " " + sentiment["document_tone"]["tone_categories"][0]["tones"][0]["score"]
//       )
//     );
//
//   }
// );
