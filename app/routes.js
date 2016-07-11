// Packages
var express = require('express')
var router = express.Router()
var path = require('path')
var multer = require('multer')

var ctrlMediaUpload = require('./controllers/mediaUpload')
var upload = multer(ctrlMediaUpload.multerImageConfig)

// Pages
var post = require('./controllers/post.js')
var mention = require('./controllers/mention.js')
var follow = require('./controllers/following.js')
var hashtag = require('./controllers/hashtag.js')
var like = require('./controllers/like.js')
var retweet = require('./controllers/retweet.js')
var profileTimeline = require('./controllers/profileTimeline.js')
var reply = require('./controllers/reply.js')
var blockuser = require('./controllers/blockuser.js')
var suggest = require('./controllers/suggestion.js')
var notification = require('./controllers/notification.js')
var privacy = require('./controllers/privacy.js')
var homeTimeline = require('./controllers/homeTimeline.js')
var middleware = require('../config/middleware.js')

module.exports = function (app) {
  app.use(function (err, req, res, next) {
    console.error(err.stack)
    res.status(500).send('Something broke!')
  })

  // UserHome
  app.post('/user_timeline', profileTimeline.getuserhomeposts) // user home timeline post API
  app.post('/user_timeline/with_reply', profileTimeline.getpostsrtreply); // tweet,retweet & reply post

  // Home Timeline
  app.post('/homeTimeline', homeTimeline.homeTimeline)

  // Mention
  app.get('/mention/:mention_user', mention.getmentionuser) // Get post of user by mention user
  // app.get('/getpost/user/mention/:mention_user', mention.getmentionuser)      // Get post of user by mention user

  // HashTags
  app.get('/hashtag/:hashtag', hashtag.gethashposts) // Get post from hashtag
  app.get('/hashtag/count/:hashtag', hashtag.hashtagcount) // Get the count of specifiedhashtag
  // app.post('/hashtags', hashtag.gethashtag)                                    // Get all hashtag keyword    
  // app.get('/hashtag/count', hashtag.allhashtagcount)                           // Get the count of all hashtag
  // app.post('/gethashtaglistcount', hashtag.gethashtaglist)                     // Get all hashtag keyword

  // Retweet
  app.post('/setretweet', retweet.setretweet) // Set new user
  app.get('/retweet/:post_type/:post_id', retweet.getretweet) // Get Retweet by post
  app.delete('/deleteretweet', retweet.deleteRetweet) // delete retweet

  // Post
  // app.get('/getpost/:user', post.getuserposts)                                 // Get post by username
  app.get('/getpost/:user/:post_id', post.getuserpost) // Get single post of user
  app.get('/getpost/count/:user', post.getuserpostcount) // Get post count by username
  app.delete('/deletepost', post.deletepost) // delete post
  app.post('/setuser', post.setuser) // Set new user
  app.post('/setpost', upload.single('img_attachment'), post.setpost) // Set new post
  app.get('/trend', post.trend) // trend keyword

  // Following - Follower   
  app.post('/setfollowing', follow.setfollowing) // Set follower// dk
  app.get('/following/:user_name', follow.getfollowing) // get followings
  app.get('/followers/:user_name', follow.getfollowers) // get follower
  app.post('/unlink_following', follow.unlink_following) // unlink following
  app.get('/follower/count/:user_id', follow.getFollowerCount) // count follower
  app.get('/following/count/:user_id', follow.getFollowingCount) // count follower
  app.get('/following/:user_id/:following_id', follow.getMutualFollowerYouKnow) // Mutual Followers
  // app.get('/followLatestPost/:user_id', follow.followLatestPost)

  // Reply
  app.post('/getreply', reply.getReply) // Get Reply

  app.post('/setreply', reply.setreply) // Set reply
  app.delete('/deletereply', reply.deletereply) // delete Reply

  // Block
  app.post('/setblockuser', blockuser.setblockuser) // Set block user
  app.get('/getblockuser/:userId', blockuser.getblockuser) // get block user

  // Suggestions
  app.get('/wrapper/:user_id', suggest.wrapperSuggest) // Decision Making Wrapper API
  app.get('/suggestion/:user_id', suggest.getSuggestion) // Get Suggestions
  app.get('/randomSuggestion', suggest.randomSuggestion) // Get Random Suggestions
  app.get('/allSuggestion/:user_id', suggest.allSuggestion) // Get All Suggestions

  // Like
  app.post('/setLike', like.setLike) // Set Like
  app.get('/like/:post_type/:post_id', like.getlike) // Get like by post/retweet/reply
  app.get('/like/:username', like.getLikeByUser) // Get like by User

  // Privacy Setting
  app.put('/privacy/update', privacy.updatePrivacy) // Update Privacy

  // Notification
  app.get('/notification/:username', notification.getNotification) // Get Notification
}
