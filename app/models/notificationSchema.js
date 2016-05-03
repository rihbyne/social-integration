var mongoose        = require('mongoose');           								// For Mongoose

// Notification Schema
var notification = mongoose.Schema({
    
    notification_message :			 	{type: String},								// Message
	notification_user :					{type: Array},								// {username:username, user_id:user_id}
	post_id	:							{type: String},								// Post Id
	retweet_id	:						{type: String},								// Retweet Id
	reply_id	:						{type: String},								// Reply Id
    created_at :                      	{type: Date, default: Date.now},          	// Created date
    
}, { versionKey: false });