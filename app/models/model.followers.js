var mongoose = require('mongoose');
var user_followers_schema = mongoose.Schema({
        user: {
            type: String,
            ref: "User"
        },
        follower: {
            type: String
        },
        follower_since: {
            type: Date, default: Date.now
        }
    },
    {
        versionKey: false
    });

module.exports = mongoose.model('user_followers', user_followers_schema);