var promise = require('bluebird');

var options = {
  promiseLib: promise
};

var pgp = require('pg-promise')(options);
var prod_database = process.env.DATABASE_URL;
var connectionString = prod_database ? prod_database : 'postgres://localhost:5432/tweettones';
var db = pgp(connectionString);

function getTweetByID(req, res, next) {
  let tweetId = req.params.id;
  db.one('select * from tweettones where id = $1', tweetId)
    .then(data => res.json(data))
    .catch(err => res.json({error: 'No result found'}));
}

function storeTweet(req, res, next) {
  console.log(req.data);
  db.none('insert into tweettones(id, timestamp, body, emotion_tone, language_tone, social_tone)' +
      'values(${id}, ${timestamp}, ${body}, ${emotion_tone}, ${language_tone}, ${social_tone})',
    req.body)
    .then(function () {
      res.status(200)
        .json({
          status: 'success',
          message: 'Inserted one tweet'
        });
    })
    .catch(function (err) {
      return next(err);
    });
}

// function updateCup(req, res, next) {
//   db.none('update cups set name=$1, material=$2, display=$3 where id=$4',
//     [req.body.name, req.body.material, req.body.display,
//       parseInt(req.params.id)])
//     .then(function () {
//       res.status(200)
//         .json({
//           status: 'success',
//           message: 'Updated cup'
//         });
//     })
//     .catch(function (err) {
//       return next(err);
//     });
// }
//
// function removeCup(req, res, next) {
//   var cupID = parseInt(req.params.id);
//   db.result('delete from cups where id = $1', cupID)
//     .then(function (result) {
//       /* jshint ignore:start */
//       res.status(200)
//         .json({
//           status: 'success',
//           message: `Removed ${result.rowCount} cup`
//         });
//       /* jshint ignore:end */
//     })
//     .catch(function (err) {
//       return next(err);
//     });
// }

module.exports = {getTweetByID, storeTweet};

//   updateCup: updateCup,
//   removeCup: removeCup
