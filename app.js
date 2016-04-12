"use strict";

var mongo               = require('./config/mongo.js');
var notificationschema  = require('./model/notification_model.js');
var express             = require('express');
var app                 = require('express')();
var expressValidator 	= require('express-validator');
var server              = require('http').Server(app);
var bodyParser          = require('body-parser');
var notification        = require('./api/notification.js');  
var mailer              = require('./api/mail.js');                     // Mail Functionality
var post 		        = require('./api/post.js');  
var follow              = require('./api/follow-following.js');  
var mention             = require('./api/mention.js');  
var hashtag             = require('./api/hashtag.js');  
var like                = require('./api/like.js');  
var retweet             = require('./api/retweet.js');  
var path                = require('path');  


app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(expressValidator());

app.use(express.static(path.join(__dirname, '/public')));
app.use(express.static(path.join(__dirname, '/node_modules')));

app.set('view engine', 'ejs');  

// app.get('/', function (req, res) {
//   res.sendFile(__dirname + '/index.html');
// });

app.post('/secure/sendVerificationEmail', notification.sendVerificationEmail);
app.post('/secure/sendforgotpassword', notification.sendforgotpassword);
app.post('/secure/changePassEmail', notification.changePassEmail);
app.post('/secure/resettedConfirmation', notification.resettedConfirmation);
app.post('/secure/sendMail', mailer.sendPHPmail);
app.post('/secure/getNotificationStatus', mailer.getNotificationStatus);



// about page 
app.get('/about', post.getuserdetails);

// user preferance page 
app.get('/user_preferance', function(req, res) {
    res.render('pages/user_preferance');
});

app.get('/', function(req, res) {
    // save the bear and check for errors
    var drinks = [
        { name: 'Bloody Mary', drunkness: 3 },
        { name: 'Martini', drunkness: 5 },
        { name: 'Scotch', drunkness: 10 }
    ];
    var tagline = "Any code of your own that you haven't looked at for six or more months might as well have been written by someone else.";

    res.render('pages/index', {
        drinks: drinks,
        tagline: tagline
    });

});


// profile
app.get('/profile', function(req, res) {
    res.render('pages/profile');
});

// mention
app.get('/mention/:mention_user', mention.getmentionuser);

// hashtag
app.get('/hashtag/:hashtag',hashtag.gethashposts);

// login
app.get('/login', function(req, res) {
    res.render('pages/login');
});
// register
app.get('/register', function(req, res) {
    res.render('pages/register');
});


app.get('/getpost', post.getpost); 									// Get all post

app.get('/getpost/post/:post_title', post.getsinglepost); 			// Get post by post title

app.get('/getpost/:user', post.getuserposts); 						// Get post by username
app.get('/getpost/count/:user', post.getuserpostcount); 				// Get post count by username
app.get('/getpost/:user/:post_id', post.getuserpost); 				// Get single post of user

app.get('/getpost/user/mention/:mention_user', mention.getmentionuser); // Get post of user by mention user

app.get('/hashtag/count', hashtag.allhashtagcount); // Get the count of all hashtag
app.get('/hashtag/count/:hashtag', hashtag.hashtagcount); 			 	// Get the count of specifiedhashtag
app.post('/hashtags', hashtag.gethashtag); 								// Get all hashtag keyword 		
app.post('/gethashtaglistcount', hashtag.gethashtaglist);                    // Get all hashtag keyword          
	
app.get('/hashtags/:hashtag', hashtag.gethashposts);					// Get post from hashtag

app.post('/setuser', post.setuser); 									// Set new user 
app.post('/setnewpost', post.setnewpost); 							// Set new post
app.post('/setretweet', retweet.setretweet); 							// Set new user 
app.post('/setlike', like.setlike);                                  // Set like

app.post('/setfollower', follow.setfollower);                          // Set follower
app.get('/:user_name/follower', follow.getfollower);                          // Set follower
app.post('/unlink_follower', follow.unlink_follower);                          // Set follower

app.post('/setfollowing', follow.setfollowing);                          // Set follower
app.get('/:user_name/following', follow.getFollowing);                          // Set follower
app.post('/unlink_following', follow.unlink_following);                          // Set follower


server.listen(4000, function(){
	console.log('Connected To server at port 4000 with socket');
});

