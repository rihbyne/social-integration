var mention_model = require('../models/mentionSchema.js')
var post_model = require('../models/postSchema.js')
var async = require('async')
var log = require('../../config/logging')()

// Get mentionuser's post
var getmentionuser = function (req, res) { // get a post 

  log.info("Show mention user's post")

  var mention_user = req.params.mention_user

  req.checkParams('mention_user', 'mention_user').isAlpha()

  var errors = req.validationErrors()

  if (errors) {
    log.error('There have been validation errors: \n' + util.inspect(errors))
    res.status('400').json({message:'validation error'})
    return
  }

  async.parallel([
    getPostByMentionUser,
    getRetweetByMentionUser,
    getReplyByMentionUser
  ],
    function (err, result) {
      // log.info(result)
      if (err) {
        log.info(err)
        res.send(err)
      } else {
        var mentionUserPosts = result[0].concat(result[1]).concat(result[2]); // Got two result , concent two results

        function custom_sort (a, b) {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        }

        mentionUserPosts.sort(custom_sort)
      }

      log.info(mentionUserPosts)
      res.json({
      mentionUserPosts})
    }
  )

  function getPostByMentionUser (callback) {
    log.info('get post by mention user')

    mention_model.post_mention
      .find({
        mention_users: mention_user
      })
      .select('post_id')
      .lean()
      .exec(function (err, mentionspost) {
        if (err) {
          log.error(err)
          res.send(err)
          return
        }
        else{
          if (mentionspost.length !== 0) {
            var items = []
            async.forEach(mentionspost, function (rsltmentionspost, cb) {
              post_model.post
                .find({_id: rsltmentionspost.post_id, privacy_setting: 1})
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
        }
      })
  }

  function getRetweetByMentionUser (callback) {
    log.info('get retweet by mention user')

    mention_model.retweet_quote_mention
      .find({
        mention_users: mention_user
      })
      .select('retweet_quote_id')
      .lean()
      .exec(function (err, mentionsretweet) {
        if (err) {
          log.error(err)
          res.send(err)
          return
        }
        else{
          if (mentionsretweet.length !== 0) {
            var items = []
            async.forEach(mentionsretweet, function (rsltmentionsretweet, cb) {
              post_model.retweet_quote
                .find({_id: rsltmentionsretweet.retweet_quote_id, privacy_setting: 1})
                .populate('ret_user_id')
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
                log.error('something went wrong')
                callback(null, [])
              } else {
                // console.log('Final all post', items)
                callback(null, items)
              }
            })
          } else {
            callback(null, [])
          }
        }
      })
  }

  function getReplyByMentionUser (callback) {
    log.info('get reply by mention user')

    mention_model.reply_mention
      .find({
        mention_users: mention_user
      })
      .select('reply_id')
      .lean()
      .exec(function (err, mentionsreply) {
        if (err) {
          log.error(err)
          res.send(err)
          return
        }
        else{
          // console.log('mentionREply',mentionsreply)
          if (mentionsreply.length !== 0) {
            var items = []
            async.forEach(mentionsreply, function (rsltmentionsreply, cb) {
              post_model.reply
                .find({_id: rsltmentionsreply.reply_id, privacy_setting: 1})
                .populate('reply_user_id')
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
        }
      })
  }
}

module.exports = ({
  getmentionuser: getmentionuser
})
