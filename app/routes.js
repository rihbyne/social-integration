// Packages
var express 		= require('express');
var router 			= express.Router();
var path 			= require('path');

// Pages
var notification 	= require('../api/notification.js');
var mailer 			= require('../api/mail.js');
var post 			= require('../api/post.js');
var mention 		= require('../api/mention.js');
var follow 			= require('../api/following.js');
var hashtag 		= require('../api/hashtag.js');
var like 			= require('../api/like.js');
var retweet 		= require('../api/retweet.js');
var userhome 		= require('../api/userhome.js');
var reply 			= require('../api/reply.js');
var blockuser 		= require('../api/blockuser.js');
var suggest			= require('../api/suggestion.js');

// app/routes.js
module.exports = function(app, passport) {

    app.post('/secure/sendVerificationEmail', notification.sendVerificationEmail);
    app.post('/secure/sendforgotpassword', notification.sendforgotpassword);
    app.post('/secure/changePassEmail', notification.changePassEmail);
    app.post('/secure/resettedConfirmation', notification.resettedConfirmation);
    app.post('/secure/sendMail', mailer.sendPHPmail);
    app.post('/secure/getNotificationStatus', mailer.getNotificationStatus);

    // // user preferance page 
    // app.get('/following', function(req, res) {
    //     res.render('pages/following');
    // });

    app.get('/', isLoggedIn, function(req, res) {
        // save the bear and check for errors
        var drinks = [{
            name: 'Bloody Mary',
            drunkness: 3
        }, {
            name: 'Martini',
            drunkness: 5
        }, {
            name: 'Scotch',
            drunkness: 10
        }];
        var tagline = "Any code of your own that you haven't looked at for six or more months might as well have been written by someone else.";

        res.render('pages/index', {
            drinks: drinks,
            tagline: tagline,
            user: req.user,
        });

    });


    // // profile
    // app.get('/profile', function(req, res) {
    //     res.render('pages/profile');
    // });

    // // login
    // app.get('/login', function(req, res) {
    //     res.render('pages/login');
    // });

    // register
    // app.get('/signup', function(req, res) {
    //     res.render('pages/signup');
    // });



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


    app.get('/following', isLoggedIn, function(req, res) {
        res.render('pages/following.ejs', {
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


    /*=================================================================================================*/

    app.use('/about', isLoggedIn, post.getuserdetails); 					// about page
    app.get('/mention/:mention_user', mention.getmentionuser); 				// Get Mention User Details
    app.get('/gethomepost/:username', userhome.getuserhomeposts); 			// user home timeline post API

    // app.get('/getpost', post.getpost); 										// Get all post
    app.get('/getpost/:user', post.getuserposts); 							// Get post by username
    app.get('/getpost/:user/:post_id', post.getuserpost); 					// Get single post of user
    app.get('/getpost/count/:user', post.getuserpostcount); 				// Get post count by username
    app.get('/getpost/post/:post_title', post.getsinglepost); 				// Get post by post title
    app.get('/getpost/user/mention/:mention_user', mention.getmentionuser); // Get post of user by mention user

    app.post('/hashtags', hashtag.gethashtag); 								// Get all hashtag keyword
    app.get('/hashtags/:hashtag', hashtag.gethashposts); 					// Get post from hashtag
    app.get('/hashtag/count', hashtag.allhashtagcount); 					// Get the count of all hashtag

    app.get('/hashtag/count/:hashtag', hashtag.hashtagcount); 				// Get the count of specifiedhashtag
    app.post('/gethashtaglistcount', hashtag.gethashtaglist); 				// Get all hashtag keyword

    app.post('/setuser', post.setuser); 									// Set new user

    app.post('/setnewpost', post.setpost); 									// Set new post
    app.post('/setretweet', retweet.setretweet); 							// Set new user
    app.post('/setlike', like.setlike); 									// Set like
    app.get('/like/post/:post_id', like.getLikeByPost); 					// Get like by post
    app.get('/like/user/:user_id', like.getLikeByUser); 					// Get like by User
    app.get('/getretweet/:post_id', retweet.getretweet); 					// Get Retweet by post

    app.post('/setfollowing', follow.setfollowing); 						// Set follower// dk
    app.get('/following/:user_name', follow.getfollowing); 					// Set followings
    app.get('/followers/:user_name', follow.getfollowers); 					// Set follower
    app.post('/unlink_followings_f', follow.unlink_following); 				// Set follower
    app.get('/follower/count/:user_id', follow.getCountFollower); 			// count follower
    app.get('/following/count/:following_id', follow.getCountFollowing); 	// count follower
	app.get('/following/:user_id/:following_id', follow.getMutualFollowerYouKnow);
	// app.get('/followLatestPost/:user_id', follow.followLatestPost);

    app.get('/api/Trendsdk', post.Trendsdk); 								// trend keyword
    app.get('/getreply/:post_id/:reply_user_id', reply.getreply); 			// Get reply
    app.post('/setreply', reply.setreply); 									// Set reply

    app.post('/setblockuser', blockuser.setblockuser); 						// Set block user
    app.get('/getblockuser/:userId', blockuser.getblockuser); 				// get block user

    app.get('/getpostsrtreply/:username', userhome.getpostsrtreply); 		// tweet,retweet & reply post
	
	app.get('/wrapper/:user_id', suggest.wrapperSuggest)
	app.get('/suggestion/:user_id', suggest.getSuggestion);					// Get Suggestions
	app.get('/randomSuggestion', suggest.randomSuggestion);					// Get Random Suggestions
	app.get('/allSuggestion/:user_id', suggest.allSuggestion);					// Get All Suggestions
	
	app.post('/deletepost', post.deletepost); 								// delete post
    app.post('/deletereply', reply.deletereply); 							// delete Reply

};
// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/login');
}
