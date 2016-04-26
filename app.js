"use strict";

// Packages
var express  			= require('express');							// Framwork
var app      			= express();
var port     			= process.env.PORT || 4000;						// Port
var passport 			= require('passport');							// Used For Authentication
var flash    			= require('connect-flash');						// For Flash Messages
var expressValidator 	= require('express-validator');					// For validation
var bodyParser          = require('body-parser');						// To Accept Post Request
var path                = require('path');
var morgan       		= require('morgan');							// Request To The Console
var bformat = require('bunyan-format');
var cookieParser 		= require('cookie-parser');						// Read cookies (needed for auth)
var session      		= require('express-session');

var log = require('./config/logging')()

require('dotenv').config() //loads project specific process.env settings from .env
require('./app/models/db') //initialize db collections and its data

// Pages
var server              = require('http').Server(app);
var notificationschema  = require('./model/notification_model.js');
var notification        = require('./api/notification.js');  
var mailer              = require('./api/mail.js');                     // Mail Functionality
var routeDirectMsgApi = require('./app/routes/api_direct_msg')

// Middleware
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(expressValidator());
app.use(cookieParser());
app.use(session({
	secret: 'searchtrade',
	resave: true,
	saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session
app.use(express.static(path.join(__dirname, '/public')));
app.use(express.static(path.join(__dirname, '/node_modules')));

app.set('view engine', 'ejs');  
require('./config/passport.js')(passport); // pass passport for configuration


// routes ======================================================================
require('./app/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport

//============ direct messaging router====================
app.use('/api/direct_messages', routeDirectMsgApi)

// launch ======================================================================
app.listen(port);
console.log('Connected To server at port ' + port);
