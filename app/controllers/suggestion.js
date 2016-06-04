var follower = require('../models/followersSchema.js'),
  users = require('../models/userSchema.js')
util = require('util'),
async = require('async'),
request = require('request') // Request Module

var ip = 'http://192.168.2.16:4000/'

// Get Suggestion
var getSuggestion = function (req, res) {
  var user_id = req.params.user_id
  var my_list = [ ]
    var i = 0
    var loop = 0

    req.checkParams('user_id', 'User Id is mandatory').notEmpty()
    var errors = req.validationErrors()

    if (errors) {
      res.status('400').json('There have been validation errors: ' + util.inspect(errors))
      return
    }

    follower
      .find({$and: [{user_id: user_id}, {follow_status: true}]}, {_id: 0})
      .select('following_id')
      .sort({'follower_since': -1})
      .limit(1)
      .exec(function (err, latestFollowed) {
        if (err)
          res.send(err)

        follower
          .find({$and: [{user_id: latestFollowed[0].following_id}, {follow_status: true}]}, {_id: 0})
          .populate('following_id')
          .limit(6)
          .lean()
          .exec(function (err, followingIds) {
            console.log(followingIds)

            if (err)
              res.send(err)

            var arrayLength = followingIds.length

            async.forEach(followingIds, function (item, cb) {
              var followerId = item.following_id._id
              var followerUsername = item.following_id.username
              var firstName = item.following_id.first_name
              var lastName = item.following_id.last_name

              if (followerId == user_id) {
                loop++
                cb()
              }else {
                follower
                  .count({$and: [{user_id: user_id}, {following_id: followerId}, {follow_status: true}]})
                  .lean()
                  .exec(function (err, check) {
                    if (err)
                      res.send(err)

                    loop++

                    if (!check) {
                      my_list[i] = {
                        id: followerId,
                        username: followerUsername,
                        firstname: firstName,
                        lastname: lastName
                      }
                      i++
                    }

                    if (loop == arrayLength) {
                      res.send(my_list)
                      return
                    }

                    cb()
                  })
              }
            })
          })
      })
  }

  // Random Suggestion
  var randomSuggestion = function (req, res) {
    follower
      .aggregate([
        { $match: {follow_status: true}},
        { $group: { '_id': '$following_id', 'follower_id': { '$push': '$user_id' }, 'count': { '$sum': 1 } } },
        { $sort: { count: -1 } }
      ])
      .limit(6)
      .exec(function (err, result) {
        if (err)
          res.send(err)

        users.populate(result, {'path': '_id'}, function (err, results) {
          if (err)
            res.send(err)

          res.send({Results: results})
        })
      })
  }

  // All Suggestion
  var allSuggestion = function (req, res) {
    var user_id = req.params.user_id
    var list_data = [ ]
      req.checkParams('user_id', 'User Id is mandatory').notEmpty()
      var errors = req.validationErrors()

      if (errors) {
        res.status('400').json('There have been validation errors: ' + util.inspect(errors))
        return
      }

      users
        .find({_id: {$ne: user_id}})
        .lean()
        .exec(function (err, results) {
          if (err)
            res.send(err)

          var arrayLength = results.length
          var loop = i = 0
          async.forEach(results, function (item, cb) {
            var following_id = item._id
            var username = item.username
            var firstName = item.first_name
            var lastName = item.last_name

            if (err)
              res.send(err)

            if (user_id == following_id) {
              loop++
              cb()
            }else {
              follower
                .count({$and: [{user_id: user_id}, {following_id: following_id}, {follow_status: true}]})
                .lean()
                .exec(function (err, total) {
                  if (err)
                    res.send(err)

                  loop++

                  if (!total) {
                    list_data[i] = {
                      id: following_id,
                      username: username,
                      firstname: firstName,
                      lastname: lastName
                    }
                    i++
                  }

                  if (loop == arrayLength) {
                    res.send(list_data)
                    return
                  }

                  cb()
                })
            }
          })
        })
    }

    // Wrapper Suggestion
    var wrapperSuggest = function (req, res) {
      var user_id = req.params.user_id
      req.checkParams('user_id', 'User Id is mandatory').notEmpty()
      var errors = req.validationErrors()

      if (errors) {
        res.status('400').json('There have been validation errors: ' + util.inspect(errors))
        return
      }

      follower
        .count({$and: [{user_id: user_id}, {follow_status: true}]})
        .exec(function (err, followingCount) {
          if (err)
            res.send(err)

          if (followingCount == 0) {
            request.get({
              url: ip + 'randomSuggestion',
              headers: {'content-type': 'application/json'}

            }, function optionalCallback (err, body) {
              var result = JSON.parse(body.body)
              res.send(result)
            })
          }else {
            request.get({
              url: ip + 'suggestion/' + user_id,
              headers: {'content-type': 'application/json'}

            }, function optionalCallback (err, body) {
              var result = JSON.parse(body.body)
              res.send(result)
            })
          }
        })
    }

    // Exports	
    module.exports = ({
      getSuggestion: getSuggestion,
      randomSuggestion: randomSuggestion,
      allSuggestion: allSuggestion,
      wrapperSuggest: wrapperSuggest
    })
