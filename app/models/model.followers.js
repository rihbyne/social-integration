var mongoose = require('mongoose');
var usr_followers_schema = mongoose.Schema({
    user  :   		{type: String , ref:"User"},
    usr_followers:  {type:String},
    follower_since:  {type:Date}
})

module.exports = mongoose.model('User_follwers', usr_followers_schema);

