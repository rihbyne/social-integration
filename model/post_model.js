var mongoose        = require('mongoose');           // For Mongoose
var User = require('../model/User.js');

// Post Schema
var post = mongoose.Schema({
    
    posted_by:                       {type: String, ref:'User'},       // posted by 
    post_title:                      {type: String},        // post title 
    post_description:                {type: String},        // post description 
    tweet_count:                     {type: Number, default: 0, min: 0},
    created_at:                      {type: Date, default: Date.now},          // created date
    last_update: 				     {type: Date}           // last update date
    
}, { versionKey: false });

// Post url Schema
var post_url = mongoose.Schema({
    
    post_id:                         {type: Number},        // post Id
    post_url:                        {type: String}        // post link url 
    
}, { versionKey: false });

// post mention Schema
var post_mention = mongoose.Schema({
    
    post_id:                         {type: String, ref:"post"},        // post Id
    posted_by:                       {type: String},        // posted by 
    mention_users:					 {type: Array}        // mention users 	

}, { versionKey: false });

var post_hashtag = mongoose.Schema({

    post_id:                         {type: String, ref:'post'},
    hashtag:                         {type: Array}

}, { versionKey: false });

// post hashtag links Schema
var post_hashtag_links = mongoose.Schema({
    
    post_id:                         {type: Array},        // post Id
    post_hashtag:                    {type: String, ref:'post_hashtag'}        // posted by     

}, { versionKey: false });

// retweet Schema
var post_hashtag_links = mongoose.Schema({
    
    post_id:                         {type: Array},        // post Id
    post_hashtag:                    {type: String, ref:'post_hashtag'}        // posted by     

}, { versionKey: false });

// retweet Schema
var post_retweet_schema = mongoose.Schema({
    
    post_id:                         {type: String},        // post Id
    ret_user_id:                     {type: String}        // posted by     

}, { versionKey: false });


// Model
module.exports.post = mongoose.model('post', post);
module.exports.post_url = mongoose.model('post_url', post_url);
module.exports.post_mention = mongoose.model('post_mention', post_mention);
module.exports.post_hashtag = mongoose.model('post_hashtag', post_hashtag);
module.exports.post_hashtag_links = mongoose.model('post_hashtag_links', post_hashtag_links);
module.exports.post_retweet = mongoose.model('post_retweet', post_retweet_schema);