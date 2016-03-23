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

app.get('/secure/getpost', post.getpost); // Get all post
app.get('/secure/getpost/post/:post_title', post.getsinglepost);
app.get('/secure/getpost/user', post.getuserposts);
app.get('/secure/getpost/user/:post_user', post.getuserpost);
app.post('/secure/hashtags', post.gethashtag);
app.post('/secure/hashtags/:hashtag', post.gethashposts);
app.post('/secure/setpost', post.setpost);

server.listen(4000, function(){
	console.log('Connected To server at port 4000 with socket');
});
