var user = require('../models/userSchema.js')
var post_model = require('../models/postSchema.js')
var mention_model = require('../models/mentionSchema.js')
var hashtag_model = require('../models/hashtagSchema.js')
var follower = require('../models/followersSchema.js')
var log = require('../../config/logging')()

// Get id of user from username
var getUserId = function (username, res) {
  user
    .find({
      username: username
    })
    .select('_id')
    .lean()
    .exec(function (err, userdata) {
      if (err) {
        log.error(err)
        res(err, 'something went wrong')
        return
      } else if (userdata.length !== 0) {
        userid = (userdata[0]._id).toString()
        return res(null, userid)
      } else {
        return res(true, 'No user found')
      }
    })
}

// Get username of user from id 
var getusername = function (id, res) {
  user
    .find({
      _id: id
    })
    .select('username')
    .exec(function (err, userdata) {
      if (err) {
        log.error(err)
        res(err, 'something went wrong')
        return
      } else if (userdata.length !== 0) {
        username = userdata[0].username
        return res(null, username)
      } else {
        return res(true, 'No user found')
      }
    })
}

// Save hashtag and mention -- master file code for set post, retweet and reply 
var hashtagMention = function (type, post, mentionusers, hashtags, res) {

  if (typeof mentionusers != 'undefined' && mentionusers != null && mentionusers.length > 0) {
    var mention_users = []

    for (var i = 0; i < mentionusers.length; i++) {
      mention_users[i] = mentionusers[i]
    }

    if (type == 1) {
      var mention = new mention_model.post_mention({
        post_id: post._id,
        mention_users: mention_users
      })
    } else if (type == 2) {
      var mention = new mention_model.retweet_quote_mention({
        retweet_quote_id: post._id,
        mention_users: mention_users
      })
    } else if (type == 3) {
      var mention = new mention_model.reply_mention({
        reply_id: post._id,
        mention_users: mention_users
      })
    }

    mention.save(function (err) {
      if (err) {
        log.error(err)
        res(err, 'something went wrong')
        return
      }
    })
  }

  if (typeof hashtags != 'undefined' && hashtags != null && hashtags.length > 0) {
    var hashtagkd = []

    for (var k = 0; k < hashtags.length; k++) {
      hashtagkd[k] = hashtags[k]
      log.info('hashtagkeyword', hashtagkd[k])

      post_model.trends
        .findOneAndUpdate({
          keyword: hashtags[k]
        }, {
          $inc: {
            count: +1
          },
          updated_at: Date.now()
        }, {
          upsert: true,
          setDefaultsOnInsert: true
        }, function (err, result) {
          if (err) {
            log.error(err)
            res(err, 'something went wrong')
            return
          }

          log.info('Trends updated')
        })
    }

    if (type == 1) {
      var hashtag = new hashtag_model.post_hashtag({
        post_id: post._id,
        hashtag: hashtagkd
      })
    } else if (type == 2) {
      var hashtag = new hashtag_model.retweet_quote_hashtag({
        retweet_quote_id: post._id,
        hashtag: hashtagkd
      })
    } else if (type == 3) {
      var hashtag = new hashtag_model.reply_hashtag({
        reply_id: post._id,
        hashtag: hashtagkd
      })
    }

    // find keyword if it is present update count, other wise create new trend
    hashtag.save(function (err) {
      if (err) {
        log.error(err)
        res(err, 'something went wrong')
        return
      }
    })
  }

  // if (typeof post_links != "undefined" && post_links != null && post_links.length > 0) {

  //     var post_url = new post_model.post_url({
  //         _id: post._id,
  //         post_url: post_links // posted by 
  //     })

  //     post_url.save(function(err) {
  //         if (err)
  //             res.send(err)
  //     })

  // }
  return res(null, 'Post created!')
}

// check user is following to other user
var isFollowing = function (user_id, following_id, callback) {
  follower
    .find({
      user_id: user_id,
      following_id: following_id
    })
    .lean()
    .exec(function (err, result) {
      if (err) {
        log.error(err)
        callback(err, 'something went wrong')
        return callback(true, err) // following
      }
      log.info('isFollowing Result', result)

      if (result.length !== 0) {
        if (result[0].follow_status == true) {
          return callback(null, 'following') // For following user  
        }
        else{
          return callback(null, 'oldFollowing') // For old following user
        }        
      } else {
        return callback(null, 'newUser') // For new user
      }
    })
}

/*  get privacy status of user 

    1. if user id and logged id same --privacyStatus - 1
    2. if following -- privacyStatus - 2
    3. if not following -- privacyStatus - 3
*/
var getPrivacyStatus = function (userid, loggedid, callback) {
  log.info('getPrivacyStatus api hitted')
  // check userid and loggeduser same or not
  if (loggedid == userid) {
    privacyStatus = 1
    log.info('Privacy Status -- Own user', privacyStatus)
    callback(null, privacyStatus)
  } else {
    isFollowing(loggedid, userid, function (err, followResult) {
      if (err) {
        log.error(err)
        callback(err, 'something went wrong')
        return
      }
      if (followResult == 'following') {
        privacyStatus = 2
        log.info('Privacy Status -- following', privacyStatus)
      } else{
        privacyStatus = 3
        log.info('Privacy Status -- Not following', privacyStatus)
      }

      callback(null, privacyStatus)
    })
  }
}

// update user's update_at time
var updateUser = function (userid, callback) {
  log.info('Update user api called')

  user
    .findOneAndUpdate({
      _id: userid
    }, {
      update_at: Number(new Date())
    })
    .lean()
    .exec(function (err, updateResult) {
      if (err) {
        log.error(err)
        callback(err, 'something went wrong')
      }
      else if (updateResult) {
        callback(null, updateResult)
      } else {
        callback(true, 'No user found to update')
      }
    })
}

// check user is valid or not -- same as isPostOwner -- only response is different
var isValidUser = function (collectionName, query, callback) {
  log.info('isValidUser api hitted')

  collectionName
    .find(query)
    .lean()
    .exec(function (err, postResult) {
      if (err) {
        log.error(err)
        callback(err, 'something went wrong')
        return
      }
      else if (postResult.length === 0) {
        callback(true, 'Not valid user')
        log.info('Not valid user')
      } else {
        callback(null, 'valid user')
        log.info('Valid user')
      }
    })
}

// check post, reply, retweet exist or not -- cross-side test only
var isValidPost = function (collectionName, query, callback) {
  console.info('isValidPost api hitted')

  collectionName
    .find(query)
    .lean()
    .exec(function (err, postResult) {
      if (err) {
        log.error(err)
        callback(err, 'something went wrong')
        return
      }
      else if (postResult.length == 0) {
        callback(true, 'No Post/Retweet-Quote/Reply found')
      } else {
        callback(null, 'Post/Retweet-Quote/Reply found')
      }
    })
}

// check user is owner of post or not
var isPostOwner = function (collectionName, query, callback) {
  console.info('isPostOwner api hitted')

  collectionName
    .find(query)
    .lean()
    .exec(function (err, postResult) {
      if (err) {
        log.error(err)
        callback(err, 'something went wrong')
        return
      }
      else if (postResult.length == 0) {
        callback(null, 'User is not owner of post')
        log.info('User is not owner of post')
      } else {
        callback(true, 'User is owner of post')
        log.info('User is owner of post')
      }
    })
}

// check user existence in database
var userExistence = function (userid, callback) {
  log.info('userExistence api hitted')

  user
    .find({
      _id: userid
    })
    .lean()
    .exec(function (err, postResult) {
      if (err) {
        log.error(err)
        callback(true, 'something went wrong')
      }
      else if (postResult.length == 0) {
        callback(true, 'User is not found')
      } else {
        callback(null, 'User is found')
      }
    })
}

module.exports = ({
  getUserId: getUserId,
  hashtagMention: hashtagMention,
  getusername: getusername,
  isFollowing: isFollowing,
  getPrivacyStatus: getPrivacyStatus,
  updateUser: updateUser,
  isValidUser: isValidUser,
  isValidPost: isValidPost,
  isPostOwner: isPostOwner,
  userExistence: userExistence
})
