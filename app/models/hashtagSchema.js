var mongoose        = require('mongoose');           								// For Mongoose
var post 			= require('./postSchema.js');									// For Referring post Collection

// Post HashTag Schema
var post_hashtag = mongoose.Schema({

    post_id:                         {type: String, ref:'post'},					// Post Id
    hashtag:                         {type: Array}									// HashTags

}, { versionKey: false });

// Post HashTag Schema
var retweet_quote_hashtag = mongoose.Schema({

    retweet_quote_id:                {type: String, ref:'retweet_quote'},					// Post Id
    hashtag:                         {type: Array}									// HashTags

}, { versionKey: false });

// Post HashTag Schema
var reply_hashtag = mongoose.Schema({

    reply_id:                        {type: String, ref:'reply'},					// Post Id
    hashtag:                         {type: Array}									// HashTags

}, { versionKey: false });

module.exports.post_hashtag 			= mongoose.model('post_hashtag', post_hashtag);
module.exports.retweet_quote_hashtag 	= mongoose.model('retweet_quote_hashtag', retweet_quote_hashtag);
module.exports.reply_hashtag 			= mongoose.model('reply_hashtag', reply_hashtag);
