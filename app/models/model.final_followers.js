var mongoose = require('mongoose');

var user_final_followers_schema = mongoose.Schema({
        user_id: {
            type: String,
            ref: "User"
        },
        following_id: {
            type: String
        },
        follower_since: {
            type: Date, Default: Date.now
        }
    },
    {
        versionKey: false
    });

module.exports = mongoose.model('user_final_followers_schema', user_final_followers_schema);

