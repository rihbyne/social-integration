var mongoose        = require('mongoose');           								// For Mongoose
var post 			= require('./postSchema.js');									// For Referring post Collection

// Post Mention Schema
var post_mention = mongoose.Schema({
    
    post_id:                         {type: String, ref:"post"},        			// Post Id
    mention_users:					 {type: Array}        							// Mention Users

}, { versionKey: false });

// Retweet Mention Schema
var retweet_quote_mention = mongoose.Schema({
    
    retweet_quote_id:     			 {type: String, ref:"retweet_quote"},                    // Post Id
    mention_users:                   {type: Array}                                  // Mention Users

}, { versionKey: false });

// Reply Mention Schema
var reply_mention = mongoose.Schema({
    
    reply_id:                		 {type: String, ref:"reply"},                    // Post Id
    mention_users:                   {type: Array}                                  // Mention Users

}, { versionKey: false });

module.exports.post_mention 			= mongoose.model('post_mention', post_mention);
module.exports.retweet_quote_mention 	= mongoose.model('retweet_quote_mention', retweet_quote_mention);
module.exports.reply_mention 			= mongoose.model('reply_mention', reply_mention);
