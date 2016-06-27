var postModel = require('../models/postSchema.js') // Including postModel File
var async = require('async')
var master = require('./master.js')
var notificationModel = require('../models/notificationSchema.js')
var log = require('../../config/logging')()

var Promise = require('bluebird')
// Set Post Like
var setLike = function (req, res) {

  log.info('Set like api hitted')

  var post_id = req.body.post_id
  var retweet_quote_id = req.body.retweet_quote_id
  var reply_id = req.body.reply_id
  var like_user_id = req.body.like_user_id
  var type = req.body.type
  var postId

  log.info('Post Id', post_id)
  log.info('Post Type', type)
  log.info('Like user id', like_user_id)
  log.info('Reply id', reply_id)
  log.info('Retweet Quote id', retweet_quote_id)

  req.checkBody('type', 'post type').notEmpty()
  req.checkBody('type', 'post type must be integer').isInt().gte(1).lte(3)
  req.checkBody('like_user_id', 'like_user_id').notEmpty()


  var errors = req.validationErrors()

  if (errors) {
    log.warn('There have been validation errors: \n' + util.inspect(errors))
    res.status('400').json({message:'validation error'})
    return
  }
  // blank validation
  if (type == 1) { // post

    collectionName = postModel.post
    postId = post_id
  } else if (type == 2) { // retweet

    collectionName = postModel.retweet_quote
    postId = retweet_quote_id
  } else if (type == 3) { // reply

    collectionName = postModel.reply
    postId = reply_id
  }

  collectionName
    .find({
      _id: postId
    })
    .lean()
    .exec(function (err, likeResult) {
      if (err) {
        log.error(err)
        res.send(err)
        return
      }

      if (likeResult.length !== 0) {
        if (type == 1 || type == '1') // Post Selected
        {
          // To Like or unlike Post (check whether it is already liked or not)
          postModel.post_like
            .find({
              post_id: post_id,
              like_user_id: like_user_id
            })
            .lean()
            .exec(function (err, likedata) {
              if (err) {
                log.error(err)
                res.send(err)
                return
              }

              // Post is Already liked by the same user
              if (likedata.length !== 0) {
                log.info('Make it unlike.')

                postModel.post_like
                  .findOneAndRemove({
                    $and: [{
                      post_id: post_id
                    }, {
                      like_user_id: like_user_id
                    }]
                  })
                  .lean()
                  .exec(function (err, result) {
                    if (err) {
                      log.error(err)
                      res.send(err)
                      return
                    }

                    log.info('Post Unliked', result)
                    res.status(201).json({message:'Post Unliked Successfully'})
                  })
              }
              // Set Like for Post
              else {
                var likeModel = new postModel.post_like({
                  post_id: post_id,
                  like_user_id: like_user_id
                })

                likeModel.save(function (err) {
                  if (err) {
                    log.error(err)
                    res.send(err)
                    return
                  }
                  log.info('Post Like')
                  res.status(201).json({message:'Post Liked Successfully'})
                })
              }

              setLikeCount(post_id, 1, function (result) {
                log.info(result)
              })
            })
        }

        if (type == 2 || type == '2') // Retweet Selected
        {
          // To Like or unlike Retweet (check whether it is already liked or not)
          postModel.retweet_like
            .find({
              retweet_quote_id: retweet_quote_id,
              like_user_id: like_user_id
            })
            .lean()
            .exec(function (err, likedata) {
              if (err) {
                log.error(err)
                res.send(err)
                return
              }

              // Retweet is Already liked by the same user
              if (likedata.length !== 0) {
                log.info('Make it unlike.')

                postModel.retweet_like
                  .findOneAndRemove({
                    $and: [{
                      retweet_quote_id: retweet_quote_id
                    }, {
                      like_user_id: like_user_id
                    }]
                  })
                  .lean()
                  .exec(function (err, result) {
                    if (err) {
                      log.error(err)
                      res.send(err)
                      return
                    }

                    log.info('Retweet Unliked', result)
                    res.status(201).json({message:'Retweet Unliked Successfully'})
                  })
              }
              // Set Like for Retweet
              else {
                var likeModel = new postModel.retweet_like({
                  retweet_quote_id: retweet_quote_id,
                  like_user_id: like_user_id
                })

                likeModel.save(function (err) {
                  if (err) {
                    log.error(err)
                    res.send(err)
                    return
                  }

                  log.info('Retweet Like')
                  res.status(201).json({message:'Retweet Liked Successfully'})
                })
              }

              setLikeCount(retweet_quote_id, 2, function (result) {
                log.info(result)
              })
            })
        }

        if (type == 3 || type == '3') // Reply Selected
        {
          // To Like or unlike Reply (check whether it is already liked or not)
          postModel.reply_like
            .find({
              reply_id: reply_id,
              like_user_id: like_user_id
            })
            .lean()
            .exec(function (err, likedata) {

              // Reply is Already liked by the same user
              if (likedata.length !== 0) {
                log.info('Make it unlike.')

                postModel.reply_like
                  .findOneAndRemove({
                    $and: [{
                      reply_id: reply_id
                    }, {
                      like_user_id: like_user_id
                    }]
                  })
                  .lean()
                  .exec(function (err, result) {
                    if (err) {
                      log.error(err)
                      res.send(err)
                      return
                    }
                    log.info('Reply Unliked', result)
                    res.status(201).json({message:'Reply Unliked Successfully'})
                  })
              }
              // Set Like for Reply
              else {
                var likeModel = new postModel.reply_like({
                  reply_id: reply_id,
                  like_user_id: like_user_id
                })

                likeModel.save(function (err) {
                  if (err) {
                    log.error(err)
                    res.send(err)
                    return
                  }
                  log.info('Reply Like')
                  res.status(201).json({message:'Reply Liked Successfully'})
                })
              }

              setLikeCount(reply_id, 3, function (result) {
                log.info(result)
              })
            })
        }
      } else {
        res.status().json('No post found')
        return
      }
    })
}

// Get post of liked by user
var getLikeByUser = function (req, res) { // get new like
  log.info('Get Like by user api hitted')
  var username = req.params.username
  log.info('username', username)
  master.getUserId(username, function (err, user_id) {
    if (err) {
      log.error(user_id)
      res.send(user_id)
      return
    }

    async.parallel([

      likeCount,
      postLike,
      retweetLike,
      replyLike

    ], function (err, results) {
      if (err) {
        log.error(err)
        res.send(err)
        return
      }

      var likePosts = results[1].concat(results[2]).concat(results[3]); // Got two result , concent two results

      log.info(likePosts)

      function custom_sort (a, b) {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }

      likePosts.sort(custom_sort)

      res.json({likeCount : results[0], likePosts: likePosts})
    })

    function likeCount (callback) {
      async.parallel([
        likePostCount,
        likeQuoteRetweetCount,
        likeReplyCount]

        , function (err, result) {
          if (err) {
            log.err(err)
            callback(true, 'something went wrong')
          }
          var likePostsCount = result[0] + result[1] + result[2]
          console.log(likePostsCount)
          callback(null, likePostsCount)
        })

      log.info('like callbackount function hitted')

      function likePostCount (cb) {
        postModel.post_like.count({like_user_id: user_id})
          .exec(function (err, results) {
            if (err) {
              log.info(results)
              cb(err, results)
            }
            cb(null, results)
          })
      }
      function likeQuoteRetweetCount (cb) {
        postModel.retweet_like.count({like_user_id: user_id})
          .exec(function (err, results) {
            if (err) {
              log.info(results)
              cb(err, results)
            }
            cb(null, results)
          })
      }
      function likeReplyCount (cb) {
        postModel.reply_like.count({like_user_id: user_id})
          .exec(function (err, results) {
            if (err) {
              log.info(results)
              cb(err, results)
            }
            cb(null, results)
          })
      }
    }

    function postLike (callback) {
      var option = [{
        path: 'post_id'
      }, {
        path: 'post_id',
        populate: {
          path: 'posted_by'
        }
      }]

      postModel.post_like
        .find({
          like_user_id: user_id
        })
        .limit(10)
        .populate(option)
        .exec(function (err, userPostLikeResult) {
          if (err) {
            log.error(err)
            res.send(err)
            return
          }
          callback(null, userPostLikeResult)
        })
    }

    function retweetLike (callback) {
      var option = [{
        path: 'retweet_quote_id'
      }, {
        path: 'retweet_quote_id',
        populate: {
          path: 'ret_user_id'
        }
      }]

      postModel.retweet_like
        .find({
          like_user_id: user_id
        })
        .populate(option)
        .exec(function (err, userRetweetLikeResult) {
          if (err) {
            log.error(err)
            res.send(err)
            return
          }
          callback(null, userRetweetLikeResult)
        })
    }

    function replyLike (callback) {
      var option = [{
        path: 'reply_id'
      }, {
        path: 'reply_id',
        populate: {
          path: 'reply_user_id'
        }
      }]

      postModel.reply_like
        .find({
          like_user_id: user_id
        })
        .populate(option)
        .exec(function (err, userRetweetLikeResult) {
          if (err) {
            log.error(err)
            res.send(err)
            return
          }

          callback(null, userRetweetLikeResult)
        })
    }
  })
}

// Update Count of likes For Post/Retweet/Reply
var setLikeCount = function (id, type, res) {

  // For Post
  if (type == 1 || type == '1') {
    postModel.post_like
      .count({
        post_id: id
      })
      .lean()
      .exec(function (err, postLikeCount) {
        if (err) {
          log.error(err)
          res.send(err)
          return
        }

        postModel.post
          .findOneAndUpdate({
            _id: id
          }, {
            like_count: postLikeCount
          })
          .exec(function (err, postUpdateResult) {
            if (err) {
              log.error(err)
              res.send(err)
              return
            }
            res(postUpdateResult)
          })
      })

    return
  }

  // For Retweet
  if (type == 2 || type == '2') {
    postModel.retweet_like
      .count({
        retweet_quote_id: id
      })
      .lean()
      .exec(function (err, retweetLikeCount) {
        if (err) {
          log.error(err)
          res.send(err)
          return
        }

        postModel.retweet_quote
          .findOneAndUpdate({
            _id: id
          }, {
            like_count: retweetLikeCount
          })
          .exec(function (err, retweetUpdateResult) {
            if (err) {
              log.error(err)
              res.send(err)
              return
            }

            res(retweetUpdateResult)
          })
      })

    return
  }

  // For Reply
  if (type == 3 || type == '3') {
    postModel.reply_like
      .count({
        reply_id: id
      })
      .lean()
      .exec(function (err, replyLikeCount) {
        if (err) {
          log.error(err)
          res.send(err)
          return
        }

        postModel.reply
          .findOneAndUpdate({
            _id: id
          }, {
            like_count: replyLikeCount
          })
          .exec(function (err, replytUpdateResult) {
            if (err) {
              log.error(err)
              res.send(err)
              return
            }

            res(replytUpdateResult)
          })
      })

    return
  }
}

// Get Retweets of single post
var getlike = function (req, res) {
  var post_id = req.params.post_id
  var post_type = req.params.post_type
  var query, collectionName

  if (post_type == 1) {
    collectionName = postModel.post_like
    query = {
      post_id: post_id
    }
  } else if (post_type == 2) {
    collectionName = postModel.retweet_like
    query = {
      retweet_quote_id: post_id
    }
  } else if (post_type == 3) {
    collectionName = postModel.reply_id
    query = {
      reply_id: post_id
    }
  } else {
    log.info('wrong post type')
    res.json({
      Result: 'No post_type found'
    })
    return
  }

  collectionName
    .find(query)
    .select('like_user_id')
    .populate('like_user_id')
    .lean()
    .exec(function (err, getRetweetResult) {
      if (err) {
        log.error(err)
        res.send(err)
        return
      }

      log.info(getRetweetResult.length)
      log.info(getRetweetResult)

      res.json({
        count: getRetweetResult.length,
        likeinfo: getRetweetResult
      })
    })
}
module.exports = ({
  getlike: getlike,
  getLikeByUser: getLikeByUser,
  setLike: setLike,
  setLikeCount: setLikeCount
})
