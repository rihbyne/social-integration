var mongoose = require('mongoose');
var usr_following_schema = mongoose.Schema({
    user: {
        type: String,
        ref: "User"
    },
    following: {
        type: String
    },
    following_since: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('User_following', usr_following_schema);