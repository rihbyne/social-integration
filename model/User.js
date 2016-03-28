var mongoose = require('mongoose');

var User_schema = new mongoose.Schema({
    // ObjectId   _id
    W_user_id	:   {type: String, ref:'post'},          // user Id from wallet user table 
    first_name	: 	{type: String},          // First Name of User
    last_name	: 	{type: String},          // Last Name of Use
    email 		:   {type: String},
    username	: 	{type: String}

});

module.exports = mongoose.model("User", User_schema);

