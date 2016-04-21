var mongoose = require('mongoose');

var user_final_followers_schema = mongoose.Schema({
    user_id: {
        type: String,
        ref: "User",
        required: [true, 'Why no user_id?']
    },
    following_id: {
        type: String,
        required: [true, 'Why no following_id?']
    },
    follower_since: {
        type: Date,
        default: Date.now
    },
    block: {
        type: Boolean,
        date: {
            type: Date,
            default: Date.now
        }
    },
    mute: {
        type: Boolean,
        date: {
            type: Date,
            default: Date.now
        }
    },
    following_status: {
        type: Boolean,
        default: false
    }
}, {
    versionKey: false
});

module.exports = mongoose.model('user_final_followers_schema', user_final_followers_schema);