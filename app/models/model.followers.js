var mongoose = require('mongoose');
var usr_followers_schema = mongoose.Schema({
    user  :   		{type: String , ref:"User"},
    usr_followers:  {type:String},
})

module.exports = mongoose.model('User_follwers', usr_followers_schema);

