var mongoose 		= require('mongoose');				// For Mongoose
var User 			= require('./user.js');				// For Referring User Collection

var userfollowersSchema = mongoose.Schema({
    
	user_id: 		{ type: String, ref: "User", required: [true, 'Why no user_id?']},			// User Id (User Id From user Colloction) [Who is Following] 
    following_id: 	{ type: String, ref: 'User', required: [true, 'Why no following_id?']},		// User Id (User Id From user Colloction) [To Whom user_id is Following] 
    follower_since: { type: Date, default: Date.now },											// Date From user_id Started following following_id
    block: 			{ type: Boolean, date: { type: Date, default: Date.now }},					// Status That Decides user_id blocked following_id or not
    mute: 			{ type: Boolean, date: { type: Date, default: Date.now }},					// Status That Decides user_id Muted following_id or not
    follow_back: 	{ type: Boolean, default: false },											// true if following_id is also following user_id
    follow_status: 	{ type: Boolean, default: true },											// Status That decides user_id is currently following following_id or not
	
},{ versionKey: false });

module.exports = mongoose.model('user_followers', userfollowersSchema);