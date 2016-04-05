var mongoose = require('mongoose');

var User_schema = new mongoose.Schema({

    // _id 		: {type: String, ref:'post'},
    W_user_id	:   {type: String},          // user Id from wallet user table 
    first_name	: 	{type: String},          // First Name of User
    last_name	: 	{type: String},          // Last Name of Use
    email 		:   {type: String},
    username	: 	{type: String}

}, { versionKey: false });

module.exports = mongoose.model("User_old", User_schema);

