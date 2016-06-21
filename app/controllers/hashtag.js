var post_model = require('../models/postSchema.js')
var hashtag_model = require('../models/hashtagSchema.js')
var log = require('../../config/logging')()
var master = require('../controllers/master.js')
// Get all post
var gethashtag = function (req, res) { // get a post 
  log.info('Show all HashTag')

  // find the hashtag and check for errors
  post_model.post_hashtag
    .find(function (err, allhashtag) {
      if (err) {
        log.error(err)
        res.send(err)
        return
      }
      res.json({
        posts: allhashtag
      })
    })
}

// Get Count of all hashtag
var allhashtagcount = function (req, res) { // get a post 

  log.info('Show count of all HashTag')

  // show count of post and check for errors
  post_model.post_hashtag.aggregate({
    $group: {
      _id: 0,
      count: {
        $sum: 1
      }
    }
  }, function (err, allhashtag) {
    if (err) {
      log.error(err)
      res.send(err)
      return
    }

    res.json({
      posts: allhashtag
    })
  })
}

// Get Count of specified hashtag
var hashtagcount = function (req, res) { // get a post 

  log.info('Show count of HashTag')

  var hashtagkeywd = req.params.hashtag
  // show count of post and check for errors
  post_model.post_hashtag.aggregate({
    $group: {
      _id: {
        hashtag: hashtagkeywd
      },
      count: {
        $sum: 1
      }
    }
  }, function (err, allhashtag) {
    if (err) {
      log.error(err)
      res.send(err)
      return
    }

    res.json({
      posts: allhashtag
    })
  })
}

// Get all post
var gethashtaglist = function (req, res) { // get a post 

  log.info('Show all HashTag')

  // find the hashtag and check for errors
  post_model.trends.find().sort({
    count: -1
  }).limit(5).exec(function (err, result) {
    log.info(result)

    if (err) {
      log.error(err)
      res.send(err)
      return
    }

    res.json({
      message: result
    })
  })
}

// Get posts of hashtag
var gethashposts = function (req, res) { // get a post 

  log.info('Show posts of hashtag')

  var hashtag = req.params.hashtag

  log.info('Hashtag : ', hashtag)

  req.checkParams('hashtag', 'hashtag').isAlpha()

  var errors = req.validationErrors()

  if (errors) {
    log.error('There have been validation errors: \n' + util.inspect(errors))
    res.status('400').json('There have been validation errors: ' + util.inspect(errors))
    return
  }

  // master.getPrivacyStatus(userid, loggedid, function (err, privacyStatus) {

  // if (err) {
  //   log.error(privacyStatus)
  //   res.send(privacyStatus)
  //   return
  // }

  async.parallel([
    callback => getPostByHashtagkd(callback),
    callback => getRetweetByHashtagkd(callback),
    callback => getReplyByHashtagkd(callback)
  ],
    function (err, result) {
      if (err) {
        log.error(result)
        res.send(result)
        return

        // if (result[0] === 0) {
        //   console.info('Own posts are zero')
        //   var hashtagePosts = result[1]
        // }

      // if (result[1] === 0) {
      //   console.info('Retweet posts are zero')
      //   var hashtagePosts = result[0]
      // }
      } else {
        var hashtagePosts = result[0].concat(result[1]).concat(result[2]); // Got two result , concent two results
        function custom_sort (a, b) {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        }

        hashtagePosts.sort(custom_sort)
      }

      res.json({
      hashtagePosts})
    }
  )

  function getPostByHashtagkd (callback) {
    log.info('get post by hashtag')

    hashtag_model.post_hashtag
      .find({
        hashtag: hashtag
      })
      .select('post_id')
      .lean()
      .exec(function (err, hashtagpost) {
        if (err) {
          log.error(err)
          res.send(err)
          return
        }

        if (hashtagpost.length !== 0) {
          var items = []
          async.forEach(hashtagpost, function (rslthashpost, cb) {
            post_model.post
              .find({_id: rslthashpost.post_id, privacy_setting: 1})
              .populate('posted_by')
              .exec(function (err, resultPost) {
                if (err) {
                  log.error(err)
                  cb()
                }
                else if (resultPost.length !== 0) {
                  // console.log(resultPost)
                  items.push(resultPost[0])
                  cb()
                }else {
                  cb()
                }
              })
          }, function (err) {
            if (err) {
              console.log('something went wrong')
              callback(null, [])
            } else {
              // console.log('Final all post', items)
              callback(null, items)
            }
          })
        } else {
          callback(null, [])
        }
      })
  }

  function getRetweetByHashtagkd (callback) {
    log.info('get retweet by hashtag')

    hashtag_model.retweet_quote_hashtag
      .find({
        hashtag: hashtag
      })
      .select('retweet_quote_id')
      .lean()
      .exec(function (err, hashtagretweet) {
        if (err) {
          log.error(err)
          res.send(err)
          return
        }

        if (hashtagretweet.length !== 0) {
          var items = []
          async.forEach(hashtagretweet, function (rslthashretweet, cb) {
            post_model.retweet_quote
            .find({_id: rslthashretweet.retweet_quote_id, privacy_setting: 1})
              .populate('ret_user_id')
              .exec(function (err, resultRetweet) {

                if (err) {
                  log.error(err)
                  cb()
                }
                else if (resultRetweet.length !== 0) {
                  // console.log(resultRetweet)
                  items.push(resultRetweet[0])
                  cb()
                }else {
                  cb()
                }
              })
          }, function (err) {
            if (err) {
              console.log('something went wrong')
              callback(null, [])
            } else {
              // console.log('Final all post', items)
              callback(null, items)
            }
          })
        } else {
          callback(null, [])
        }
      })
  }

  function getReplyByHashtagkd (callback) {
    log.info('get reply by hashtag')

    hashtag_model.reply_hashtag
      .find({
        hashtag: hashtag
      })
      .select('reply_id')
      .lean()
      .exec(function (err, hashtagreply) {
        if (err) {
          log.error(err)
          res.send(err)
          return
        }

        if (hashtagreply.length !== 0) {
          var items = []
          async.forEach(hashtagreply, function (rslthashreply, cb) {
            post_model.reply
            .find({_id: rslthashreply.reply_id, privacy_setting: 1})
              .populate('reply_user_id')
              .exec(function (err, resultReply) {

                if (err) {
                  log.error(err)
                  cb()
                }
                else if (resultReply.length !== 0) {
                  items.push(resultReply[0])
                  cb()
                }else {
                  cb()
                }
              })
          }, function (err) {
            if (err) {
              console.log('something went wrong')
              callback(null, [])
            } else {
              // console.log('Final all post', items)
              callback(null, items)
            }
          })
        } else {
          callback(null, [])
        }
      })
  }

}

module.exports = ({
  gethashtag: gethashtag,
  allhashtagcount: allhashtagcount,
  hashtagcount: hashtagcount,
  gethashtaglist: gethashtaglist,
  gethashposts: gethashposts
})
