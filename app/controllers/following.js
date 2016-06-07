// Packages
var util = require('util')
var async = require('async')
var request = require('request')

// Pages
var follower = require('../models/followersSchema.js')
var users = require('../models/userSchema.js')
var postSchema = require('../models/postSchema.js')
var log = require('../../config/logging')()
var master = require('./master.js')

// Set following
var setfollowing = function (req, res) {
  var user_id = req.body.user_id // User Id
  var following_id = req.body.following_id // Following Id

  // validation for blank variables
  req.checkBody('user_id', 'User id is mandatory').notEmpty()
  req.checkBody('following_id', 'following_id is mandatory').notEmpty()

  var errors = req.validationErrors()

  if (errors) {
    log.warn('There have been validation errors: \n' + util.inspect(errors))
    res.status('400').json('There have been validation errors: ' + util.inspect(errors))
    return
  }

  // validation for the same profile followes
  if (user_id === following_id) {
    log.info('You can not follow your own profile')
    res.json({
      message: 'You can not follow your own profile'
    })
    return
  }

  // check following status
  master.isFollowing(user_id, following_id, function (err, result) {
    log.info('user status: ', result)

    if (err) {
      res.send(result)
      log.info(result)
      return
    }

    else if (result == 'following') {
      res.json({
        message: 'User is already following'
      })
    }else {
      // add or update database as result
      followingModel(result, user_id, following_id, function (err, followingModelResult) {
        if (err) {
          res.send(result)
          log.info(result)
          return
        }

        // update follow back status
        updateFollowBack(user_id, following_id, function (err, followBackStatus) {
          if (err) {
            res.send(result)
            log.info(result)
            return
          }else {
            res.json({
              message: 'following/followers set'
            })
          }
        })
      })
    }
  })
}

// //Get following
var getfollowing = function (req, res) {
  var user_name = req.params.user_name

  // validation for blank variables
  req.checkParams('user_name', 'User name is mandatory').notEmpty()

  var errors = req.validationErrors()

  if (errors) {
    // res.send('There have been validation errors: ' + util.inspect(errors), 400)
    res.status('400').json('There have been validation errors: ' + util.inspect(errors))
    return
  }

  // check user exist or not
  users
    .find({
      username: user_name
    })
    .select('_id')
    .exec(function (err, result) {
      if (err) {
        log.error(err)
        res.send(err)
        return
      }

      if (result.length !== 0) {
        follower
          .find({
            user_id: result[0]._id,
            follow_status: true,
            following_id: {
              $ne: process.env.SUPERUSERID
            }
          })
          .populate('user_id following_id')
          .exec(function (err, result) {
            log.info(result)

            if (err) {
              log.error(err)
              res.send(err)
              return
            }

            res.json({
              FollowingList: result
            })
          })
      }
    })
}

// get follower
var getfollowers = function (req, res) {
  var user_name = req.params.user_name
  // validation for blank variables
  req.checkParams('user_name', 'User name is mandatory').notEmpty()
  var errors = req.validationErrors()
  if (errors) {
    // res.send('There have been validation errors: ' + util.inspect(errors), 400)
    res.status('400').json('There have been validation errors: ' + util.inspect(errors))
    return
  }
  users
    .find({
      username: user_name
    })
    .select('_id')
    .lean()
    .exec(function (err, result) {
      if (result.length !== 0) {
        follower
          .find({
            following_id: result[0]._id,
            follow_status: true
          })
          .populate('following_id user_id')
          .lean()
          .exec(function (err, followerResult) {
            if (err) {
              log.error(err)
              res.send(err)
              return
            }

            res.json({
              FollowersList: followerResult
            })
          })
      }
    })
}

// Unlink following
var unlink_following = function (req, res) {
  log.info('unlink_followings api called')

  var user_id = req.body.user_id
  var unlink_following = req.body.unlink_following

  // validation for blank variables
  req.checkBody('user_id', 'User id is mandatory').notEmpty()
  req.checkBody('unlink_following', 'unlink_following is mandatory').notEmpty()

  var errors = req.validationErrors()

  if (errors) {
    // res.send('There have been validation errors: ' + util.inspect(errors), 400)
    res.status('400').json('There have been validation errors: ' + util.inspect(errors))
    return
  }

  if (unlink_following == process.env.SUPERUSERID) {
    log.info('You can not unfollow searchtrade user')
    res.send('You can not unfollow searchtrade user')
    return
  }

  follower
    .update({
      user_id: user_id,
      following_id: unlink_following
    }, {
      follow_status: false,
      follow_back: false
    })
    .exec(function (err, result) {
      if (err) {
        log.info('found err' + err)
        res.send(err)
      } else {
        follower
          .update({
            following_id: user_id,
            user_id: unlink_following

          }, {
            follow_back: false
          })
          .exec(function (err, result) {
            if (err) {
              log.info('found err' + err)
            } else {
              res.json({
                message: 'Removed following'
              })
              log.info('Removed following')
            }
          })
      }
    })
}

// Get Count of Follwer
var getFollowerCount = function (req, res) {
  var user_id = req.params.user_id

  // validation for blank variables
  req.checkParams('user_id', 'User name is mandatory').notEmpty()

  var errors = req.validationErrors()

  if (errors) {
    // res.send('There have been validation errors: ' + util.inspect(errors), 400)
    res.status('400').json('There have been validation errors: ' + util.inspect(errors))
    return
  }

  // check if user exist or not
  users
    .count({
      _id: user_id
    }, function (err, usercount) {
      if (err) {
        log.error(err)
        res.send(err)
        return
      }

      if (usercount > 0) {
        follower
          .count({
            following_id: user_id,
            follow_status: true
          }, function (err, followercount) {
            if (err) {
              log.error(err)
              res.send(err)
              return
            }

            log.info('Count is ' + followercount)

            res.json({
              FollowerCount: followercount
            })
          })
      } else {
        res.json({
          Result: 'No user with this id'
        })
      }
    })
}

// Get Count of Follwing
var getFollowingCount = function (req, res) {
  var user_id = req.params.user_id

  // validation for blank variables
  req.checkParams('user_id', 'User name is mandatory').notEmpty()

  var errors = req.validationErrors()

  if (errors) {
    // res.send('There have been validation errors: ' + util.inspect(errors), 400)
    res.status('400').json('There have been validation errors: ' + util.inspect(errors))
    return
  }

  users
    .count({
      _id: user_id
    }, function (err, usercount) {
      if (err) {
        log.error(err)
        res.send(err)
        return
      }

      if (usercount > 0) {
        follower
          .count({
            user_id: user_id,
            follow_status: true,
            following_id: {
              $ne: process.env.SUPERUSERID
            }
          }, function (err, followingcount) {
            if (err) {
              log.error(err)
              res.send(err)
              return
            }

            log.info('Count is ' + followingcount)

            res.json({
              Followingcount: followingcount
            })
          })
      } else {
        res.json({
          Result: 'No user with this id'
        })
      }
    })
}

var getMutualFollowerYouKnow = function (req, res) {
  var user_id = req.params.user_id
  var following_id = req.params.following_id
  var count = 0
  // validation for blank variables
  req.checkParams('user_id', 'User Id is mandatory').notEmpty()
  req.checkParams('following_id', 'Following Id is mandatory').notEmpty()
  var errors = req.validationErrors()
  if (errors) {
    // res.send('There have been validation errors: ' + util.inspect(errors), 400)
    res.status('400').json('There have been validation errors: ' + util.inspect(errors))
    return
  }
  follower
    .find({
      $and: [{
        user_id: user_id
      }, {
        follow_status: true
      }]
    }, {
      _id: 0
    })
    .select('following_id')
    .lean()
    .exec(function (err, followingIds) {
      if (err) {
        log.error(err)
        res.send(err)
      }

      follower
        .find({
          $and: [{
            following_id: following_id
          }, {
            follow_status: true
          }]
        }, {
          _id: 0
        })
        .populate('user_id')
        .select('user_id')
        .lean()
        .exec(function (err, followerIds) {
          if (err) {
            log.error(err)
            res.send(err)
          }
          var item, items
          var i = 0
          var users = []
          var id = []
          for (item in followingIds) {
            for (items in followerIds) {
              if (followingIds[item].following_id == followerIds[items].user_id._id) {
                count++
                users[i] = followerIds[items].user_id.username
                id[i] = followerIds[items].user_id._id
                i++
              }
            }
          }
          res.json({
            // FollowingIds: followingIds,
            // FollowerIds: followerIds,
            users: users,
            id: id,
            count: count
          })
        })
    })
}

function updateFollowBack (user_id, following_id, callback) {
  log.info('Update Follow Back api hitted')
  follower
    .find({$or: [{
        user_id: following_id,
        following_id: user_id,
        follow_status: 'true'
      }, {user_id: user_id,
        following_id: following_id,
        follow_status: 'true'
    }]})
    .lean()
    .select('follow_back')
    .exec(function (err, result) {
      if (err) {
        log.error(err)
        res.send(err)
        return
      }
      console.log('Result update follow back', result)
      if (result.length !== 0) {
        log.info(result)
        if (result.length == 2) {
          var query = {$or: [{
              _id: result[0]._id
            }, {
              _id: result[1]._id
          }]}

          /*update user follower status true*/
          follower
            .update(query, {
              follow_back: 'true'
            }, {multi: true})
            .exec(function (err, statusResult) {
              if (err) {
                log.error(err)
                res.send(err)
                return
              }
              callback(null, true)
              log.info(statusResult)
            })
        }else {
          callback(null, false)
        }
      } else {
        callback(null, false)
      }
    })
}

function followingModel (result, user_id, following_id, callback) {
  if (result == 'newUser') {
    var followingModel = new follower({
      user_id: user_id,
      following_id: following_id,
      follow_back: false
    })

    followingModel.save(function (err) {
      if (err) {
        log.error(err)
        res.send(err)
        return
      }

      log.info('following/followers set saved')
    })
  } else if (result == 'oldFollowing') {
    follower
      .update({
        user_id: user_id,
        following_id: following_id,
        follow_status: false
      }, {
        follow_status: true
      })
      .exec(function (err, result) {
        if (err) {
          log.error(err)
          res.send(err)
          return
        }

        log.info('following/followers update')
      })

    log.info('update following')
  }
  callback(null, result)
}

module.exports = ({
  setfollowing: setfollowing,
  getfollowing: getfollowing,
  getfollowers: getfollowers,
  unlink_following: unlink_following,
  getFollowerCount: getFollowerCount,
  getFollowingCount: getFollowingCount,
  getMutualFollowerYouKnow: getMutualFollowerYouKnow

// followLatestPost : followLatestPost
})
