var mongoose = require('mongoose')
, Schema = mongoose.Schema;
var post_model = require('./post_model.js');

var User_schema = new mongoose.Schema({

    // _id 		: 	{type: Schema.Types.ObjectId, ref:'post'},
    first_name	: 	{type: String},          // First Name of User
    last_name	: 	{type: String},          // Last Name of Use
    email 		:   {type: String},
    username	: 	{type: String, ref:'post'}

}, { versionKey: false });

module.exports = mongoose.model("User_old", User_schema);

