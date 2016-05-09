var mongoose        = require('mongoose');           								// For Mongoose
var post 			= require('./postSchema.js');									// For Post Schema
// var reply 			= require('./')

// Notification Schema
var notification = mongoose.Schema({
    
    notification_message :			 	{type: String},								// Message
	notification_user :					{type: Array},								// {username:username, user_id:user_id}
	post_id :							{type: String},								// Post Id
	retweet_id :						{type: String},								// Retweet Id
	retweet_quote_id :					{type: String},								// Retweet Quote Id
	reply_id :							{type: String, Default:""},					// Reply Id
	username :							{type: String},								// Username
    created_at :                      	{type: Date, default: Date.now},          	// Created date
    
}, { versionKey: false });

// Models
module.exports.notification 	= mongoose.model('notification', notification);