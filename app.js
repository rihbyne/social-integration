"use strict";

var mongo               = require('./config/mongo.js');
var notificationschema  = require('./model/notification_model.js');
var app                 = require('express')();
var server              = require('http').Server(app);
var bodyParser          = require('body-parser');
var notification        = require('./api/notification.js');  
var mailer              = require('./api/mail.js');                     // Mail Functionality
var post 		        = require('./api/post.js');  

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.set('view engine', 'ejs');  

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

app.post('/secure/sendVerificationEmail', notification.sendVerificationEmail);
app.post('/secure/sendforgotpassword', notification.sendforgotpassword);
app.post('/secure/changePassEmail', notification.changePassEmail);
app.post('/secure/resettedConfirmation', notification.resettedConfirmation);
app.post('/secure/sendMail', mailer.sendPHPmail);
app.post('/secure/getNotificationStatus', mailer.getNotificationStatus);

app.get('/secure/getpost', post.getpost); 									// Get all post
app.get('/secure/getpost/post/:post_title', post.getsinglepost); 			// Get post by post title

app.get('/secure/getpost/:user', post.getuserposts); 						// Get post by username
app.get('/secure/getpost/:user/:post_id', post.getuserpost); 				// Get single post of user

app.get('/secure/getpost/user/mention/:mention_user', post.getmentionuser); // Get post of user by mention user

app.get('/secure/hashtag/count', post.allhashtagcount); 			    	// Get the count of all hashtag
app.get('/secure/hashtag/count/:hashtag', post.hashtagcount); 			 	// Get the count of specifiedhashtag
app.post('/secure/hashtags', post.gethashtag); 								// Get all hashtag keyword 			
app.post('/secure/hashtags/:hashtag', post.gethashposts);					// Get post from hashtag

app.post('/secure/setnewpost', post.setnewpost); 							// Set new post
app.post('/secure/setuser', post.setuser); 									// Set new user 

server.listen(4000, function(){
	console.log('Connected To server at port 4000 with socket');
});
