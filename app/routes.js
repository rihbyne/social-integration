// Packages
var express 		= require('express');
var router 			= express.Router();
var path 			= require('path');

// Pages
var post 			= require('./controllers/post.js');
var mention 		= require('./controllers/mention.js');
var follow 			= require('./controllers/following.js');
var hashtag 		= require('./controllers/hashtag.js');
var like 			= require('./controllers/like.js');
var retweet 		= require('./controllers/retweet.js');
var userhome 		= require('./controllers/userhome.js');
var reply 			= require('./controllers/reply.js');
var blockuser 		= require('./controllers/blockuser.js');
var suggest			= require('./controllers/suggestion.js');
var notification	= require('./controllers/notification.js');

// app/routes.js
module.exports = function(app, passport) {

    // app.get('/', isLoggedIn, function(req, res) {
    //     // save the bear and check for errors
    //     var drinks = [{
				// 		name: 'Bloody Mary',
				// 		drunkness: 3
				// 	},{
				// 		name: 'Martini',
				// 		drunkness: 5
				// 	},{
				// 		name: 'Scotch',
				// 		drunkness: 10
				// 	}];
					
    //     var tagline = "Any code of your own that you haven't looked at for six or more months might as well have been written by someone else.";

    //     res.render('pages/index', {
          
    //     });

    // });
    app.get('/' ,  isLoggedIn , userhome.loggednin_home_userdetails);

    // =====================================
    // LOGIN ===============================
    // =====================================
    // show the login form
    app.get('/login', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('pages/login', {
            message: req.flash('loginMessage')
        });
    });

    // process the login form
    // app.post('/login', do all our passport stuff here);
    // process the login form
    app.post('/login', passport.authenticate('local-login', {
        successRedirect: '/profile', // redirect to the secure profile section
        failureRedirect: '/login', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));

    // =====================================
    // SIGNUP ==============================
    // =====================================
    // show the signup form
    app.get('/signup', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('pages/signup.ejs', {
            message: req.flash('signupMessage')
        });
    });

    app.get('/followers_you_follow', isLoggedIn, function(req, res) {
        res.render('pages/mutual-follow.ejs', {
            user: req.user // get the user out of session and pass to template
        });
    });


    // process the signup form
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect: '/profile', // redirect to the secure profile section
        failureRedirect: '/signup', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));

    // =====================================
    // PROFILE SECTION =====================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    app.get('/profile', isLoggedIn, function(req, res) {
        res.render('pages/profile.ejs', {
            user: req.user // get the user out of session and pass to template
        });
    });


    app.get('/followers', isLoggedIn, function(req, res) {
        res.render('pages/follower.ejs', {
            user: req.user // get the user out of session and pass to template
        });
    });
    app.get('/userhome', isLoggedIn, function(req, res) {
        res.render('pages/own_tweet.ejs', {
            user: req.user // get the user out of session and pass to template
        });
    });
    app.get('/like', isLoggedIn, function(req, res) {
        res.render('pages/user_like.ejs', {
            user: req.user // get the user out of session and pass to template
        });
    });

    // user preferance page 
    app.get('/user_preferance', function(req, res) {
        res.render('pages/user_preferance', {
            user: req.user // get the user out of session and pass to template
        });
    });

    // =====================================
    // LOGOUT ==============================
    // =====================================+
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/login');
    });

	app.get('/about', post.getuserdetails); 					// about page

   // user home tile line bind to profile EJS , changed in route/path  also
    app.get('/:username', isLoggedIn , userhome.getuserhomeposts);          // user home timeline post API


/*===========================================================================================================================*/


    // UserHome
    app.get('/gethomepost/:username', userhome.getuserhomeposts);    // user home timeline post API
    app.get('/getpostsrtreply/:username', userhome.getpostsrtreply);   // tweet,retweet & reply post
 
    // Mention
    app.get('/mention/:mention_user', mention.getmentionuser);     // Get post of user by mention user
    // app.get('/getpost/user/mention/:mention_user', mention.getmentionuser); // Get post of user by mention user

    // HashTags
    app.get('/hashtag/:hashtag', hashtag.gethashposts);      // Get post from hashtag
    app.get('/hashtag/count/:hashtag', hashtag.hashtagcount);     // Get the count of specifiedhashtag
    //app.post('/hashtags', hashtag.gethashtag);         // Get all hashtag keyword    
    //app.get('/hashtag/count', hashtag.allhashtagcount);      // Get the count of all hashtag
    //app.post('/gethashtaglistcount', hashtag.gethashtaglist);     // Get all hashtag keyword

    // Retweet
    app.post('/setretweet', retweet.setretweet);        // Set new user
    app.get('/retweet/:post_type/:post_id', retweet.getretweet);      // Get Retweet by post
    app.post('/deleteRetweet', retweet.deleteRetweet);       // delete retweet

    //Post
    app.get('/getpost/:user', post.getuserposts);        // Get post by username
    app.get('/getpost/:user/:post_id', post.getuserpost);      // Get single post of user
    app.get('/getpost/count/:user', post.getuserpostcount);     // Get post count by username
    app.post('/deletepost', post.deletepost);         // delete post
    app.post('/setuser', post.setuser);          // Set new user
    app.post('/setpost', post.setpost);          // Set new post
    app.get('/Trendsdk', post.Trendsdk);                                 // trend keyword
    
    //Following - Follower   
    app.post('/setfollowing', follow.setfollowing);                         // Set follower// dk
    app.get('/:user_name/following', isLoggedIn , follow.getfollowing);                 // Set followings
    app.get('/:user_name/followers', isLoggedIn , follow.getfollowers);  // Set follower
    app.post('/unlink_following', follow.unlink_following);     // Set follower
    app.get('/follower/count/:user_id', follow.getCountFollower);    // count follower
    app.get('/following/count/:following_id', follow.getCountFollowing);  // count follower
    app.get('/following/:user_id/:following_id', follow.getMutualFollowerYouKnow);
// app.get('/followLatestPost/:user_id', follow.followLatestPost);
   
    //Reply
    app.get('/getReply/:type/:id',reply.getReply);       // Get Reply
    app.post('/setreply', reply.setreply);          // Set reply
    app.post('/deletereply', reply.deletereply);        // delete Reply

    //Block
    app.post('/setblockuser', blockuser.setblockuser);       // Set block user
    app.get('/getblockuser/:userId', blockuser.getblockuser);     // get block user
 
    //Suggestions
    app.get('/wrapper/:user_id', suggest.wrapperSuggest)     // Decision Making Wrapper API
    app.get('/suggestion/:user_id', suggest.getSuggestion);     // Get Suggestions
    app.get('/randomSuggestion', suggest.randomSuggestion);     // Get Random Suggestions
    app.get('/allSuggestion/:user_id', suggest.allSuggestion);    // Get All Suggestions

    //Like
    app.post('/setLike', like.setLike);          // Set Like
    app.get('/like/:post_type/:post_id', like.getlike);      // Get like by reply
    // app.get('/like/post/:post_id', like.getLikeByPost);      // Get like by post
    // app.get('/like/retweet/:retweet_quote_id', like.getLikeByRetweet);   // Get like by retweet
    // app.get('/like/reply/:reply_id', like.getLikeByReply);      // Get like by reply
    app.get('/like/user/:user_id', like.getLikeByUser);      // Get like by User
    
	
	// Notification
	app.get('/notification/:username', notification.getNotification);
	
	
/*===========================================================================================================================*/

};
// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/login');
}
