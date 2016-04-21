var mongoose = require('mongoose');

var user_final_followers_schema = mongoose.Schema({
    user_id: {  //logged in user id
        type: String,
        ref: "User",
        required: [true, 'Why no user_id?']
    },
    following_id: { //following/follower id
        type: String,
        required: [true, 'Why no following_id?']
    },
    follower_since: { //following from
        type: Date,
        default: Date.now
    },
    block: { //for user post block
        type: Boolean,
        date: {
            type: Date,
            default: Date.now
        }
    },
    mute: { //for notification mute
        type: Boolean,
        date: {
            type: Date,
            default: Date.now
        }
    },
    follow_back: { // follow back status
        type: Boolean,
        default: false //by default user will not follow other user
    },
    follow_status: { //unlink follow status
        type: Boolean,
        default: true // by defalult user will link with other user
    },
}, {
    versionKey: false
});

module.exports = mongoose.model('user_final_followers_schema', user_final_followers_schema);