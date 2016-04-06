"use strict";

var express  = require('express');
var app      = express();
var port     = process.env.PORT || 3500;


var mongo               = require('./config/mongo.js');
var notificationschema  = require('./model/notification_model.js');
// var express             = require('express');
// var app                 = require('express')();
var passport = require('passport');
var flash    = require('connect-flash');

var expressValidator 	= require('express-validator');
var server              = require('http').Server(app);
var bodyParser          = require('body-parser');
var path                = require('path');  

var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var session      = require('express-session');

app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(expressValidator());


// required for passport
app.use(session({ secret: 'searchtrade' })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session




app.use(express.static(path.join(__dirname, '/public')));
app.use(express.static(path.join(__dirname, '/node_modules')));

app.set('view engine', 'ejs');  



require('./config/passport.js')(passport); // pass passport for configuration


// routes ======================================================================
require('./app/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport


// launch ======================================================================
app.listen(port);
console.log('Connected To server at port ' + port);
