var post_model = require('../models/postSchema.js')
var master = require('./master.js')
var log = require('../../config/logging')()

var setretweet = function (req, res) {
  log.info('Retweet Api hitted')

  var post_id = req.body.post_id
  var post_type = req.body.post_type
  var ret_user_id = req.body.ret_user_id
  var retweet_type = req.body.retweet_type
  var retweet_msg = req.body.retweet_quote
  var collectionName, message, userIdFrom, query_2
  var privacy_setting = req.body.privacy_setting

  log.info('Post Id', post_id)
  log.info('Post Type', post_type)
  log.info('Retweet User Id', ret_user_id)
  log.info('Retweet Type', retweet_type)
  log.info('Retweet Quote', retweet_msg)

  req.checkBody('post_type', 'post type').notEmpty().isInt()
  req.checkBody('ret_user_id', 'ret_user_id').notEmpty()
  req.checkBody('retweet_type', 'retweet_type').notEmpty().isInt()
  req.checkBody('post_id', 'post id').notEmpty()
  req.checkBody('privacy_setting', 'privacy setting').notEmpty()

  if (retweet_type == 2) { // check retweet quote is not empty if post type 2

    req.checkBody('retweet_quote', 'Can not post empty tweet').notEmpty()
    req.checkBody('retweet_type', '0 to 300 characters required').len(0, 300)
  }

  var errors = req.validationErrors()

  if (errors) {
    log.error('There have been validation errors: \n' + util.inspect(errors))
    res.status('400').json('There have been validation errors: ' + util.inspect(errors))
    return
  }

  var query_1 = {
    _id: post_id
  }

  // Decide collectionName and query_1 to find post, retweet quote or reply exist or not
  if (post_type == 1) { // if post

    collectionName = post_model.post
    message = 'User retweeted on post'

    query_2 = {
      _id: post_id,
      posted_by: ret_user_id
    }
    query_3 = {
      post_id: post_id,
      ret_user_id: ret_user_id
    }
  } else if (post_type == 2) { // if retweet

    query_2 = {
      _id: post_id,
      ret_user_id: ret_user_id
    }
    query_3 = {
      retweet_quote_id: post_id,
      ret_user_id: ret_user_id
    }
  } else if (post_type == 3) { // if reply        

    collectionName = post_model.reply
    message = 'User retweeted on reply'
    query_2 = {
      _id: post_id,
      reply_user_id: ret_user_id
    }
    query_3 = {
      reply_id: post_id,
      ret_user_id: ret_user_id
    }
  }

  if (retweet_type == 2) { // code for quote retweet

    if (post_type == 2) {
      collectionName = post_model.retweet_quote
      message = 'User quote retweeted on quote retweet'
    }

    master.userExistence(ret_user_id, function (err, userResult) {
      if (err) {
        log.info(userResult)
        res.send(userResult)
        return
      }

      log.info(userResult)

      master.isValidPost(collectionName, query_1, function (err, validPostResult) {
        if (err) {
          log.info(validPostResult)
          res.send(validPostResult)
          return
        }

        log.info(validPostResult)

        master.isPostOwner(collectionName, query_2, function (err, postOwnerResult) {
          if (err) {
            log.info(postOwnerResult)
            res.send(postOwnerResult)
            return
          }

          log.info(postOwnerResult)

          // save new quote retweet
          var retweet_quote = new post_model.retweet_quote({
            ret_user_id: ret_user_id,
            retweet_quote: retweet_msg,
            privacy_setting: privacy_setting

          })

          if (post_type == 1) {
            retweet_quote.post_id = post_id
          } else if (post_type == 2) {
            retweet_quote.retweet_quote_id = post_id
          } else if (post_type == 3) {
            retweet_quote.reply_id = post_id
          }

          var mentionusers = []
          var hashtags = []

          var regexat = /@([^\s]+)/g
          var regexhash = /#([^\s]+)/g

          while (match_at = regexat.exec(retweet_quote)) {
            mentionusers.push(match_at[1])
          }

          while (match_hash = regexhash.exec(retweet_quote)) {
            hashtags.push(match_hash[1])
          }

          // while (match_url = regexat.exec(post_description)) {
          //     urls.push(match_url[1])
          // }

          retweet_quote.save(function (err) {
            if (err) {
              log.error(err)
              res.send(err)
              return
            }

            master.hashtagMention(2, retweet_quote, mentionusers, hashtags, function (err, result) {
              if (err) {
                log.error(err)
                res.send(err)
                return
              }

              res.json({
                message: message
              })

              log.info('Retweet Saved.')
            })
          })
        })
      })
    })
  } else if (retweet_type == 1) { // code for simple retweet

    if (post_type == 2) { // simple retweet
      collectionName = post_model.retweet_quote
      message = 'User retweeted On Retweet'
    }

    master.userExistence(ret_user_id, function (err, userResult) {
      if (err) {
        log.info(userResult)
        res.send(userResult)
        return
      }

      log.info(userResult)

      master.isValidPost(collectionName, query_1, function (err, validPostResult) {
        if (err) {
          log.info(validPostResult)
          res.send(validPostResult)
          return
        }

        log.info(validPostResult)

        master.isPostOwner(collectionName, query_2, function (err, postOwnerResult) {
          if (err) {
            log.info(postOwnerResult)
            res.send(postOwnerResult)
            return
          }

          log.info(postOwnerResult)

          // check already simple retweeted or not
          post_model.retweet
            .find(query_3)
            .lean()
            .exec(function (err, retweetResult) {
              if (err) {
                log.error(err)
                res.send(err)
                return
              }

              if (retweetResult.length == 0) { // save new simple tweet

                var retweet = new post_model.retweet({
                  ret_user_id: ret_user_id,
                  privacy_setting: privacy_setting

                })

                if (post_type == 1) {
                  retweet.post_id = post_id
                } else if (post_type == 2) {
                  retweet.retweet_quote_id = post_id
                } else if (post_type == 3) {
                  retweet.reply_id = post_id
                }

                retweet.save(function (err) {
                  if (err) {
                    log.error(err)
                    res.send(err)
                    return
                  }

                  // increment simple retweet count
                  setretweetcount(post_id, post_type, collectionName, function () {
                    log.info(message)

                    res.json({
                      message: message
                    })
                  })
                })
              } else { // remove old simple retweet

                post_model.retweet
                  .remove(query_3)
                  .exec(function (err, result) {
                    if (err) {
                      log.error(err)
                      res.send(err)
                      return
                    }

                    // increment simple retweet count
                    setretweetcount(post_id, post_type, collectionName, function () {
                      log.info('Retweet document removed')

                      res.json({
                        message: 'Retweet document removed'
                      })
                    })
                  })
              }
            })
        })
      })
    })
  }
}

// Get Retweets of single post
var getretweet = function (req, res) {
  log.info('Get retweet api hitted')
  var post_id = req.params.post_id
  var post_type = req.params.post_type
  var query

  log.info('post id', post_id)
  log.info('post type', post_type)

  if (post_type == 1) {
    var query = {
      post_id: post_id
    }
  } else if (post_type == 2) {
    var query = {
      retweet_quote_id: post_id
    }
  } else if (post_type == 3) {
    var query = {
      reply_id: post_id
    }
  } else {
    log.info('wrong post type')
    res.json({
      Result: 'No post_type found'
    })
    return
  }

  post_model.retweet
    .find(query)
    .select('ret_user_id')
    .populate('ret_user_id')
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
        retweetinfo: getRetweetResult
      })
    })
}

// update count of retweet in post
var setretweetcount = function (post_id, post_type, collectionName, res) {
  var query

  if (post_type == 1) {
    query = {
      post_id: post_id
    }
  } else if (post_type == 2) {
    query = {
      retweet_quote_id: post_id
    }
  } else if (post_type == 3) {
    query = {
      reply_id: post_id
    }
  } else {
    log.info('collectionName is blank')
    return
  }

  if (collectionName !== '') {
    post_model.retweet
      .count(query)
      .lean()
      .exec(function (err, retweetCount) {
        collectionName
          .findOneAndUpdate({
            _id: post_id
          }, {
            retweet_count: retweetCount
          })
          .exec(function (err, postUpdateResult) {
            if (err) {
              log.error(err)
              res.send(err)
              return
            }

            // log.info(postUpdateResult)
            res(null, postUpdateResult)
          })
      })
  }
}

var deleteRetweet = function (req, res) {
  log.info('Delete retweet api hitted')

  var retweet_quote_id = req.body.retweet_quote_id
  var ret_user_id = req.body.ret_user_id

  log.info('retweet quote id', retweet_quote_id)
  log.info('retweet user id', ret_user_id)

  req.checkBody('retweet_quote_id', 'retweet_quote_id').notEmpty()
  req.checkBody('ret_user_id', 'ret_user_id').notEmpty()

  var errors = req.validationErrors()

  if (errors) {
    log.warn('There have been validation errors: \n' + util.inspect(errors))
    res.status('400').json('There have been validation errors: ' + util.inspect(errors))
    return
  }

  master.userExistence(ret_user_id, function (err, result) {
    if (err) {
      log.error(result)
      res.send(result)
      return
    }

    var collectionName = post_model.retweet_quote
    var query = {_id: retweet_quote_id}

    master.isValidPost(collectionName, query, function (err, validPostResult) {
      if (err) {
        log.error(validPostResult)
        res.send(validPostResult)
        return
      }

      var query = {_id: retweet_quote_id, ret_user_id: ret_user_id}

      master.isValidUser(collectionName, query, function (err, isPostOwnerResult) {
        if (err) {
          log.error(isPostOwnerResult)
          res.json(isPostOwnerResult)
          return
        }else {
          post_model.retweet_quote
            .findOneAndRemove({
              _id: retweet_quote_id,
              ret_user_id: ret_user_id
            })
            .lean()
            .exec(function (err, result) {
              if (err) {
                log.error(err)
                res.json(err)
                return
              }

              if (result == null || result == undefined || result == '') {
                log.error('Can not delete retweet')
                res.json('Can not delete retweet')
                return
              } else {
                log.info('Quote retweet Deleted Successfully')
                res.json({msg:'Quote retweet Deleted Successfully'})
              }
            })
        }
      })
    })
  })
}

module.exports = {
  getretweet: getretweet,
  setretweet: setretweet,
  deleteRetweet: deleteRetweet
}
