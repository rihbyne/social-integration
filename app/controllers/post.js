// Packages

var util = require('util')
var async = require('async')
var express = require('express')
var router = express.Router() // get an instance of the express Router

var helpers = require('../helpers/utils')
var log = require('../../config/logging')()
var querystring = require('querystring')
var http = require('http')

// Pages
var master = require('./master.js')
var user_model = require('../models/userSchema.js')
var post_model = require('../models/postSchema.js')
var notificationModel = require('../models/notificationSchema.js')
var user_followers = require('../models/followersSchema.js')
var mentionModel = require('../models/mentionSchema.js')
var mediaUpload = require('./mediaUpload')

// Set new post
var setpost = function (req, res) {
  // create a post
  // This API will only accepts params in multipart/form-data as a Content-Type set in HTTP headers
  // rest all other Content-Types will be ignored and request will not be served.

  log.info('Set post api hitted')
  log.info(req.file)
  log.info(req.body)

  var userid = req.body.userid
  var post_description = req.body.post_description
  var privacy_setting = req.body.privacy_setting
  // var post_links = req.body.post_links

  var mentionusers = []
  var hashtags = []

  var regexat = /@([^\s]+)/g
  var regexhash = /#([^\s]+)/g

  req.checkBody('userid', 'userid is empty').notEmpty()
  req.checkBody('post_description', 'Can not post empty tweet').notEmpty()
  req.checkBody('post_description', '0 to 300 characters required').len(0, 300)
  req.checkBody('privacy_setting', 'privacy setting is empty').notEmpty()
  req.checkBody('privacy_setting', 'privacy setting must be integer').isInt().gte(1).lte(3)

  var errors = req.validationErrors()

  if (errors) {
    log.warn('There have been validation errors: \n' + util.inspect(errors))
    res.status('400').json({message:'validation error'})
    return
  }

  while (match_at = regexat.exec(post_description)) {
    mentionusers.push(match_at[1])
  }

  while (match_hash = regexhash.exec(post_description)) {
    hashtags.push(match_hash[1])
  }

  // while (match_url = regexat.exec(post_description)) {
  //     urls.push(match_url[1])
  // }

  log.info('Mention Users : ', mentionusers)
  log.info('Hash Tags : ', hashtags)

  //check for multimedia content if present here
  mediaUpload.processMedia(req, function(errData, mediadata) {
    if (errData) {
      log.error('error in process media')
      helpers.sendJsonResponse(res, errData.status, errData.content)
      return
    } else {
      log.info('process media')
      log.info('img object ->', util.inspect(mediadata))
      
      
      var post = new post_model.post({
        posted_by: userid,
        post_description: post_description,
        privacy_setting: privacy_setting,
        img_upload_ref: mediadata.content.imgObjectId
      }) // create a new instance of the post model
      
      master.updateUser(userid, function (err, updateResult) {
        if (err) {
          log.error(updateResult)
          res.send(updateResult)
          return
        }
      
        // save the post and check for errors
        post.save(function (err, result) {
          if (err) {
            log.error(err)
            res.send(err)
            return
          }

          master.getusername(result.posted_by, function (err, username) {
            log.info('Mention Users :' + mentionusers)
      
            if (mentionusers != '') {
              var notification_message = username + ' Has Mentioned you in post'
      
              var notification = new notificationModel.notification({
                notification_message: notification_message,
                notification_user: mentionusers,
                post_id: post._id,
                usrname: username
      
              })
      
              // log.info(notification_user)
              notification.save(function (err) {
                if (err) {
                  log.error(err)
                  res.send(err)
                  return
                }
      
                log.info('Notification Saved')
              })
            }
      
            master.hashtagMention(1, post, mentionusers, hashtags, function (err, result) {
              if (err) {
                log.error(err)
                res.send(err)
                return
              }

              log.info('Post Created.')
              mediadata.content.imgURL = helpers
                .assembleImgURL(post._id,
                                mediadata.content.processed_filename)
              helpers.sendJsonResponse(res, mediadata.status, mediadata.content)
              return
              //res.status(201).json({
              //  message: result
              //})
            })
          })
        })
      })
    }
  })
}

var deletepost = function (req, res) {
  log.info('Delete post api hitted')

  var post_id = req.body.post_id
  var posted_by = req.body.posted_by

  log.info('post id', post_id)
  log.info('posted by', posted_by)

  req.checkBody('post_id', 'post_id').notEmpty()
  req.checkBody('posted_by', 'posted_by').notEmpty()

  var errors = req.validationErrors()

  if (errors) {
    log.warn('There have been validation errors: \n' + util.inspect(errors))
    res.status('400').json('There have been validation errors: ' + util.inspect(errors))
    return
  }

  master.userExistence(posted_by, function (err, result) {
    if (err) {
      log.error(result)
      res.send(result)
      return
    }

    var query = {_id: post_id, posted_by: posted_by}
    var collectionName = post_model.post

    master.isValidUser(collectionName, query, function (err, isPostOwnerResult) {
      if (err) {
        log.error(isPostOwnerResult)
        res.send(isPostOwnerResult)
        return
      }else {
        post_model.post
          .findOneAndRemove(query)
          .exec(function (err, result) {
            if (err) {
              log.error(err)
              res.send(err)
              return
            }
            if (result !== null) {
              log.info('Post Deleted')

              res.json({
                message: 'Post Deleted'
              })
            } else {
              log.info('No Post Found')

              res.json({
                message: 'No Post Found'
              })
            }
          })
      }
    })

    master.getusername(posted_by, function (err, username) {
      if (err) {
        log.error(username)
        res.send(username)
        return
      }

      notificationModel.notification
        .findOneAndRemove({
          post_id: post_id,
          username: username
        })
        .exec(function (err, result) {
          if (err) {
            log.error(err)
            res.send(err)
            return
          }

          if (result !== null) {
            log.info('Notification Deleted')
          } else {
            log.info('No Notification Found')
          }
        })
    })

    mentionModel.post_mention
      .findOneAndRemove({
        post_id: post_id
      })
      .exec(function (err, result) {
        if (err) {
          log.error(err)
          res.send(err)
          return
        }

        if (result !== null) {
          log.info('Mention Document Deleted')
        } else {
          log.info('No Mention Document Found')
        }
      })
  })
}

var trend = function (req, res) {
  post_model.trends
    .find()
    .sort({
      count: -1
    })
    .limit(5)
    .exec(function (err, results) {
      if (err) {
        log.error(err)
        res.send(err)
        return
      }

      res.json({
        trends_data: results
      })
    })
}

// Get single post of user
var getsinglepost = function (req, res) { // get a post 

  log.info('Show single post')

  var post_title = req.params.post_title

  log.info(post_title)
  // get the post and check for errors

  post_model.post
    .findOne({
      post_title: post_title
    })
    .exec(function (err, singlepost) {
      if (err) {
        log.error(err)
        res.send(err)
        return
      }

      if (singlepost) {
        res.json({
          posts: singlepost
        })
      } else {
        log.info('No post found')
        res.json('No Post Found')
      }
    })
}

// Get all post of user
var getuserposts = function (req, res) { // get a post 

  var finalObj = []
  var finalObj1

  log.info('Show all posts for single user')

  var username = req.params.username // find posts of user and check for errors

  log.info('user ', req.params.user)

  // find id of user from user collection
  user_model
    .find({
      username: username
    })
    .exec(function (err, userdata) {
      if (err) {
        log.error(err)
        res.send(err)
        return
      } else if (userdata.length !== 0) {
        userid = userdata[0]._id
        // log.info(userid)
        // use userid to find all post of users
        post_model.post
          .find({
            posted_by: userid
          }, {
            _id: 0
          })
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
              res.json({
                message: 'No post found'
              })
            } else {
              post_model.post_retweet
                .find({
                  ret_user_id: userid
                }, {
                  _id: 0
                })
                .select('post_id')
                .populate('post_id')
                .sort({
                  retweet_at: -1
                })
                .limit(10)
                .exec(function (err, retweetpostids) {
                  if (err) {
                    log.error(err)
                    res.send(err)
                    return
                  }

                  async.each(retweetpostids,

                    function (retweetpostid, callback) {
                      finalObj.push(retweetpostid['post_id'])
                    },
                    function (err) {
                      // All tasks are done now
                    }
                  )

                  var finalObj1 = result.concat(finalObj)

                  log.info('\n\n', finalObj1)

                  res.json({
                    posts: finalObj1
                  })
                })
            }
          })
      } else {
        res.json({
          message: 'No user found'
        })
      }
    })
}

// Get single post of user
var getuserpost = function (req, res) { // get a post 

  log.info('Show single posts for single user')

  var post_id = req.params.post_id
  var user = req.params.username // find posts of user and check for errors

  log.info('post_id', post_id)
  log.info('post_user', user)

  // find posts of user and check for errors
  post_model.post
    .find({
      _id: post_id
    })
    .exec(function (err, userposts) {
      if (err) {
        log.error(err)
        res.send(err)
        return
      }

      res.json({
        posts: userposts
      })
    })
}

// Set users
var setuser = function (req, res) { // Create new user

  var first_name = req.body.first_name
  var last_name = req.body.last_name
  var email = req.body.email
  var username = req.body.username

  req.checkBody('first_name', 'Empty parameters').notEmpty()
  req.checkBody('last_name', 'Empty parameters').notEmpty()
  req.checkBody('email', 'Empty parameters').notEmpty()
  req.checkBody('username', 'Empty parameters').notEmpty()

  var errors = req.validationErrors()

  if (errors) {
    // res.send('There have been validation errors: ' + util.inspect(errors), 400)
    res.status('400').send('There have been validation errors: \n' + util.inspect(errors))
    return
  }

  var setuser = new user_model({
    first_name: first_name,
    last_name: last_name,
    email: email,
    username: username
  })

  setuser.save(function (err, result) {
    if (err) {
      log.error(err)
      res.send(err)
      return
    }

    // console.log(result)
    var userId = result._id.toString()

    /* setfollowing api called using curl request for superuser*/
    ;(function setFollowingSearchtradeUser () {
      user_model
        .findById(process.env.SUPERUSERID)
        .exec(function (err, result) {
          if (err) {
            log.error('no searchtrade user exist')
            return
          }

          if (result) {
            var postData = querystring.stringify({
              'user_id': userId,
              'following_id': process.env.SUPERUSERID // superuser id 

            })

            var options = {
              hostname: process.env.NODE_SERVER_IP,
              port: process.env.NODE_SERVER_PORT,
              path: '/setfollowing',
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': postData.length
              }
            }

            var req = http.request(options, (res) => {
              console.log(`STATUS: ${res.statusCode}`)
              console.log(`HEADERS: ${JSON.stringify(res.headers)}`)
              res.setEncoding('utf8')
              res.on('data', (chunk) => {
                console.log(`BODY: ${chunk}`)
              })
              res.on('end', () => {
                console.log('No more data in response.')
              })
            })

            req.on('error', (e) => {
              console.log(`problem with request: ${e.message}`)
            })

            // write data to request body
            req.write(postData)
            req.end()
          } else {
            log.error('super user is not registered')
          }
        })
    })(userId)
    /* setfollowing api called using curl request for superuser*/

    res.json({
      message: 'Users Inserted'
    })
  })
}

// Get Count of post of specified user
var getuserpostcount = function (req, res) { // get a post 

  log.info('Show count of HashTag')

  var username = req.params.username

  master.getUserId(username, function (err, userid) {
    if (err) {
      log.info(userid)

      res.json({
        Result: userid
      // PostRTReply : result
      })

      return
    }
    log.info(userid)

    async.parallel([

      function (callback) {
        // show count of post and check for errors
        post_model.post
          .count({
            posted_by: userid
          })
          .exec(function (err, postcount) {
            if (err) {
              log.error(err)
              res.send(err)
              return
            }

            callback(null, postcount)
          })
      },
      function (callback) {

        // show count of post and check for errors
        post_model.retweet_quote
          .count({
            ret_user_id: userid
          })
          .exec(function (err, retweetcount) {
            if (err) {
              log.error(err)
              res.send(err)
              return
            }

            callback(null, retweetcount)
          })
      },
      function (callback) {

        // show count of post and check for errors
        post_model.reply
          .count({
            reply_user_id: userid
          })
          .exec(function (err, replycount) {
            if (err) {
              log.error(err)
              res.send(err)
              return
            }

            callback(null, replycount)
          })
      }
    ],
      function (err, result) {
        var sumArray = function () {
          // Use one adding function rather than create a new one each
          // time sumArray is called
          function add (a, b) {
            return a + b
          }

          return function (arr) {
            return arr.reduce(add)
          }
        }()

        var allCount = sumArray(result)

        res.json({
          count: allCount
        })
      }

    )
  })
}

// Get all post 
// var getpost = function(req, res) {

//     post_model.post
//  .find()
//  .exec(function(err, allpost) {
//         if (err)
// log.error(err)
//             res.send(err)

//         res.json({
//             posts: allpost
//         })
//     })

// }

// Get all post 
// var getpost = function(req, res) {

//     post_model.post
//  .find()
//  .exec(function(err, allpost) {
//         if (err)
// log.error(err)
//             res.send(err)

//         res.json({
//             posts: allpost
//         })
//     })

// }

module.exports = ({
  getsinglepost: getsinglepost,
  getuserposts: getuserposts,
  getuserpost: getuserpost,
  setpost: setpost,
  setuser: setuser,
  getuserpostcount: getuserpostcount,
  trend: trend,
  deletepost: deletepost
// getpost : getpost,
// home_userdetails :home_userdetails
})
