var mongoose        = require('mongoose');           								// For Mongoose
var User 			= require('../models/userSchema.js');							// For Referring User Collection

// Post Schema
var post = mongoose.Schema({
    
    posted_by:                       {type: String, ref:'User'},       				// Posted By (User Id From user Colloction) 
    post_description:                {type: String},        						// Post Description 
    retweet_count:                   {type: Number, default: 0, min: 0},			// Retweet Count
    like_count:                      {type: Number, default: 0, min: 0},			// Post Like Count
    post_type :                      {type: Number, default: 1},
    created_at:                      {type: Date, default: Date.now},          		// created date
    
}, { versionKey: false });

// Post Url Schema
var post_url = mongoose.Schema({
    
    post_id:                         {type: Number},        						// Post Id
    post_url:                        {type: String}        							// Post Link Url 
    
}, { versionKey: false });

// Retweet Schema (Simple)
var retweet_schema = mongoose.Schema({
    
    post_id:                         {type: String, ref:'post'},                 	// Post Id
	retweet_quote_id:				 {type: String, ref:'retweet_quote'},			// Retweet Quote Id (Mongoose Id of Retweet Quote Document on which retweet is made[Retweet on Retweet Quote])
	reply_id:						 {type: String, ref:'reply'},					// Reply Id (Mongoose Id of Reply document on which retweet is Made)
    ret_user_id:                     {type: String, ref:'User'},                             	// User Id Who Retweeted (User Id From user Colloction) 						
    retweet_type :                   {type: Number, default: 1},                  
    created_at :                     {type: Date, default: Date.now}				// Time of Retweet Made
	
}, { versionKey: false });

// Retweet Schema (Quote)
var retweet_quote_schema = mongoose.Schema({
    
    post_id:                         {type: String, ref:'post'},                 	// Post Id
	retweet_quote_id:				 {type: String, ref:'retweet_quote'},			// Retweet Quote Id (Mongoose Id of Retweet Quote Document on which retweet quote is made[Retweet Quote on Retweet Quote])
	reply_id:						 {type: String, ref:'reply'},					// Reply Id (Mongoose Id of Reply document on which retweet is Made)
    ret_user_id:                     {type: String, ref:'User'},                    // User Id Who Retweeted (User Id From user Colloction) 
    retweet_count:                   {type: Number, default: 0, min: 0},			// Number of Retweets Made on this 
    like_count:                      {type: Number, default: 0, min: 0},			// Number of Likes on this
    retweet_quote:                   {type: String},								// String of Message		
    post_type :                      {type: Number, default: 2},					
    retweet_type :                   {type: Number, default: 2},                 
    created_at :                     {type: Date, default: Date.now}				// Time of Retweet Made

}, { versionKey: false });

// Post Like Schema
var post_like_schema = mongoose.Schema({
    
    post_id:                         {type: String, ref:'post'},        			// Post Id
    like_user_id:                    {type: String, ref:'User'}	        						// User Id From user Colloction)

}, { versionKey: false });

// ReTweet Like Schema
var retweet_like_schema = mongoose.Schema({
    
    retweet_quote_id:                {type: String, ref:'retweet_quote'},        			// Retweet Quote Id
    like_user_id:                    {type: String, ref:'User'}	        						// User Id From user Colloction)

}, { versionKey: false });

// Reply Like Schema
var reply_like_schema = mongoose.Schema({
    
    reply_id:                        {type: String, ref:'reply'},        			// Reply Id
    like_user_id:                    {type: String, ref:'User'}	        						// User Id From user Colloction)

}, { versionKey: false });

// Trends Schema
var trends = mongoose.Schema({
    
    keyword:                         {type: String},        						// Post Id
    count:                           {type: Number},        						// Count of Trends Mentioned in Post (by #)  
    created_at:                      {type: Date, default: Date.now},          		// Created date
    updated_at:                      {type: Date, default: Date.now}           		// last update date

}, { versionKey: false });

// Reply Schema
var reply_schema = mongoose.Schema({

    post_id :                        {type: String, ref:'post'},  					// Post Id
	retweet_quote_id:				 {type: String, ref:'retweet_quote'},			// Retweet Id (Moongoose Id of retweet Document on which reply is Made)
	reply_id:						 {type: String, ref:'reply'},					// Reply Id (Mongoose Id of Reply Document on which Replay is made[Reply on Reply])
    reply_user_id :                  {type: String, ref:'User'},   								// User Id Who replied on post
    reply_msg :                      {type: String},  								// String of Reply Message
    retweet_count:                   {type: Number, default: 0, min: 0},			// Number of Retweets Made on this 	
    like_count:                      {type: Number, default: 0, min: 0},			// Number of Likes on this
    post_type :                      {type: Number, default: 3},  
    created_at :                     {type: Date, default: Date.now}          		// Time of Reply
	
}, { versionKey: false });

// var post_type_schema = mongoose.Schema({
//     post :  {type: Number},
//     retweet : {type: Number},
//     post : {type: Number}
// }

// Models
module.exports.post 				= mongoose.model('post', post);
module.exports.post_url 			= mongoose.model('post_url', post_url);
module.exports.post_like 			= mongoose.model('post_like', post_like_schema);
module.exports.retweet_like 		= mongoose.model('retweet_like', retweet_like_schema);
module.exports.reply_like 			= mongoose.model('reply_like', reply_like_schema);
module.exports.retweet 				= mongoose.model('retweet', retweet_schema);
module.exports.retweet_quote 		= mongoose.model('retweet_quote', retweet_quote_schema);
module.exports.trends 				= mongoose.model('trends', trends);
module.exports.reply 				= mongoose.model('reply', reply_schema);