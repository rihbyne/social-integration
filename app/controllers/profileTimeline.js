'use strict'
var user = require('../models/userSchema.js')
var post_model = require('../models/postSchema.js')
var user_followers = require('../models/followersSchema.js')
var follower = require('../models/followersSchema.js')
var master = require('./master.js')
var async = require('async')
var request = require('request')
var log = require('../../config/logging')()

// Get all post and retweet of user
var getuserhomeposts = function (req, res) { // get a post 

  log.info('Show all posts for single user on home page')

  var userid = req.body.user_id // find posts of user
  var loggedid = req.body.logged_id
  var timestamp = req.body.timestamp
  var flag = req.body.flag; // New - 1 and Old - 2 
  var profilePosts

  req.checkBody('user_id', 'Mandatory field not found').notEmpty()
  req.checkBody('logged_id', 'Mandatory field not found').notEmpty()
  req.checkBody('timestamp', 'Mandatory field not found').isInt()
  req.checkBody('flag', 'Mandatory field not found').isInt()

  var errors = req.validationErrors()

  if (errors) {
    log.warn('There have been validation errors: \n' + util.inspect(errors))
    res.status('400').json('There have been validation errors: ' + util.inspect(errors))
    return
  }

  log.info('userid, loggedid', userid + '   ' + loggedid)

  master.getPrivacyStatus(userid, loggedid, function (err, privacyStatus) {
    if (err) {
      log.error(privacyStatus)
      res.send(privacyStatus)
      return
    }

    // using async series function get all post 
    async.parallel([
      callback => getPostByUserId(userid, privacyStatus, timestamp, flag, callback),
      callback => getRetweetByUserId(userid, privacyStatus, timestamp, flag, callback),
      callback => getQuoteRetweetByUserId(userid, privacyStatus, timestamp, flag, callback)
    ],
      function (err, result) {
        log.info(result)

        if (err) {
          log.info(err)
          res.send(err)
        } else {
          var profilePosts = result[0].concat(result[1]).concat(result[2]); // Got two result , concent two results

          function custom_sort (a, b) {
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          }

          profilePosts.sort(custom_sort)

          profilePosts = profilePosts.slice(0, 10)
        }

        res.json({
          ProfilePosts: profilePosts
        })
      })
  })
}

// Get all post, retweet and reply of user
var getpostsrtreply = function (req, res) { // get a post 

  log.info('Show all posts, retweet & reply for single user')

  var userid = req.body.user_id // find posts of user
  var loggedid = req.body.logged_id
  var timestamp = req.body.timestamp
  var flag = req.body.flag; // New - 1 and Old - 2 
  var profilePosts
  var result1, result2

  log.info('userid, loggedid', userid + '   ' + loggedid)

  req.checkBody('user_id', 'Mandatory field not found').notEmpty()
  req.checkBody('logged_id', 'Mandatory field not found').notEmpty()
  req.checkBody('timestamp', 'Mandatory field not found').isInt()
  req.checkBody('flag', 'Mandatory field not found').isInt()

  var errors = req.validationErrors()

  if (errors) {
    log.warn('There have been validation errors: \n' + util.inspect(errors))
    res.status('400').json('There have been validation errors: ' + util.inspect(errors))
    return
  }

  master.getPrivacyStatus(userid, loggedid, function (err, privacyStatus) {
    if (err) {
      log.error(err)
      res.send(err)
      return
    }

    // using async series function get all post 
    async.parallel([
      callback => getPostByUserId(userid, privacyStatus, timestamp, flag, callback),
      callback => getRetweetByUserId(userid, privacyStatus, timestamp, flag, callback),
      callback => getQuoteRetweetByUserId(userid, privacyStatus, timestamp, flag, callback),
      callback => getReplyByUserId(userid, privacyStatus, timestamp, flag, callback)
    ],
      function (err, result) {

        // log.info(result)

        var profilePosts

        if (err) {
          log.info(err)
          res.send(err)
        } else {
          var profilePosts = result[0].concat(result[1]).concat(result[2]).concat(result[3]); // Got two result , concent two results

          function custom_sort (a, b) {
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          }

          profilePosts.sort(custom_sort)

          profilePosts = profilePosts.slice(0, 10)
        }

        res.json({
          PostRTReply: profilePosts
        })
      })
  })
}

// find post from userid
function getPostByUserId (userid, privacyStatus, timestamp, flag, callback) {

  /*case 1 - own user
    case 2 - following user
    case 3 - unknown user*/

  var query, privacyStatus
  
  switch (privacyStatus) {
    case 1:
      query = {
        posted_by: userid
      }
      break

    case 2:
      query = {
        posted_by: userid,
        privacy_setting: {
          $ne: 2
        }
      }
      break

    default:
      query = {
        posted_by: userid,
        privacy_setting: 1
      }

  }

  if (flag == 1) {
    query.created_at = {
      $lte: timestamp

    }
  } else if (flag == 2) {
    query.created_at = {
      $gte: timestamp

    }
  }

  // use userid to find all post of users
  post_model.post
    .find(query)
    .populate('posted_by')
    .sort({
      created_at: -1
    })
    .limit(10)
    .exec(function (err, result) {
      if (err) {
        log.error(err)
        res.send(err)
        return
      } else if (result.length == 0) {
        callback(null, []) // No post found

      } else {
        console.info(result)
        callback(null, result)
      }
    })
}

// find retweet from userid
function getRetweetByUserId (userid, privacyStatus, timestamp, flag, callback) { // simple retweet

  var query, privacyStatus

  switch (privacyStatus) {
    case 1:
      query = {
        ret_user_id: userid
      }
      break

    case 2:
      query = {
        $and: [{
          ret_user_id: userid
        }, {
          privacy_setting: {
            $ne: 2
          }
        }]
      }
      break

    default:
      query = {
        ret_user_id: userid,
        privacy_setting: 1
      }
  }

  if (flag == 1) {
    query.created_at = {
      $lte: timestamp

    }
  } else if (flag == 2) {
    query.created_at = {
      $gte: timestamp

    }
  }

  post_model.retweet
    .find(query)
    .sort({
      retweet_at: -1
    })
    .limit(10)
    .lean()
    .exec(function (err, retweets) {
      if (err) {
        log.error(err)
        res.send(err)
        return
      } else if (retweets.length == 0) {
        callback(null, []) // No post found

      } else {
        async.each(retweets,

          function (singleretweet, callback) {
            if (singleretweet.post_id !== undefined) {
              var options = [{
                path: 'post_id'
              }, {
                path: 'post_id',
                populate: {
                  path: 'posted_by'
                }
              }]
            } else if (singleretweet.retweet_quote_id !== undefined) {
              var options = [{
                path: 'retweet_quote_id'
              }, {
                path: 'post_id',
                populate: {
                  path: 'posted_by'
                }
              }]
            } else if (singleretweet.reply_id !== undefined) {
              var options = [{
                path: 'reply_id'
              }, {
                path: 'reply_id',
                populate: {
                  path: 'posted_by'
                }
              }]
            }

            post_model.retweet
              .populate(singleretweet, options, function (err, retweet) {
                callback()
              })
          }, function (err) {

            // log.info(retweets)

            return callback(null, retweets)
          })
      }
    })
}

// find quote retweet from userid
function getQuoteRetweetByUserId (userid, privacyStatus, timestamp, flag, callback) { // simple retweet

  var query, privacyStatus

  switch (privacyStatus) {
    case 1:
      query = {
        ret_user_id: userid
      }
      break

    case 2:
      query = {
        $and: [{
          ret_user_id: userid
        }, {
          privacy_setting: {
            $ne: 2
          }
        }]
      }
      break

    default:
      query = {
        ret_user_id: userid,
        privacy_setting: {
          $ne: 2
        }
      }
  }

  if (flag == 1) {
    query.created_at = {
      $lte: timestamp

    }
  } else if (flag == 2) {
    query.created_at = {
      $gte: timestamp

    }
  }

  post_model.retweet_quote
    .find(query)
    .sort({
      retweet_at: -1
    })
    .limit(10)
    .lean()
    .exec(function (err, retweets) {
      if (err) {
        log.error(err)
        res.send(err)
        return
      } else if (retweets.length == 0) {
        callback(null, []) // No post found

      } else {
        async.each(retweets,

          function (singleretweet, callback) {
            if (singleretweet.post_id !== undefined) {
              var options = [{
                path: 'post_id'
              }, {
                path: 'post_id',
                populate: {
                  path: 'posted_by'
                }
              }]
            } else if (singleretweet.retweet_quote_id !== undefined) {
              var options = [{
                path: 'retweet_quote_id'
              }, {
                path: 'retweet_quote_id',
                populate: {
                  path: 'ret_user_id'
                }
              }]
            } else if (singleretweet.reply_id !== undefined) {
              var options = [{
                path: 'reply_id'
              }, {
                path: 'reply_id',
                populate: {
                  path: 'reply_user_id'
                }
              }]
            }

            post_model.retweet
              .populate(singleretweet, options, function (err, retweet) {
                callback()
              })
          }, function (err) {

            // log.info(retweets)

            return callback(null, retweets)
          })
      }
    })
}

// find reply from userid
function getReplyByUserId (userid, privacyStatus, timestamp, flag, callback) {
  var query, privacyStatus

  switch (privacyStatus) {
    case 1:
      query = {
        reply_user_id: userid
      }
      break

    case 2:
      query = {
        $and: [{
          reply_user_id: userid
        }, {
          privacy_setting: {
            $ne: 2
          }
        }]
      }
      break

    default:
      query = {
        reply_user_id: userid,
        privacy_setting: {
          $ne: 2
        }
      }
  }

  if (flag == 1) {
    query.created_at = {
      $lte: timestamp

    }
  } else if (flag == 2) {
    query.created_at = {
      $gte: timestamp

    }
  }

  post_model.reply
    .find(query)
    .sort({
      created_at: -1
    })
    .limit(10)
    .lean()
    .exec(function (err, postReplyResult) {
      if (err) {
        log.error(err)
        res.send(err)
        return
      }
      // log.info('Reply By user: \n',postReplyResult)

      async.each(postReplyResult,

        function (singleReplyResult, callback) {
          if (singleReplyResult.post_id !== undefined) {
            var options = [{
              path: 'post_id'
            }, {
              path: 'post_id',
              populate: {
                path: 'posted_by'
              }
            }]
          } else if (singleReplyResult.retweet_quote_id !== undefined) {
            var options = [{
              path: 'retweet_quote_id'
            }, {
              path: 'retweet_quote_id',
              populate: {
                path: 'ret_user_id'
              }
            }]
          } else if (singleReplyResult.reply_id !== undefined) {
            var options = [{
              path: 'reply_id'
            }, {
              path: 'reply_id',
              populate: {
                path: 'reply_user_id'
              }
            }]
          }

          post_model.reply
            .populate(singleReplyResult, options, function (err, reply) {
              callback()
            })
        }, function (err) {
          callback(null, postReplyResult)
        })
    })
}

module.exports = ({
  getuserhomeposts: getuserhomeposts,
  getpostsrtreply: getpostsrtreply
})
