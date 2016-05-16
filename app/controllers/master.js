var user = require('../models/userSchema.js');
var post_model = require('../models/postSchema.js');
var mention_model = require('../models/mentionSchema.js');
var hashtag_model = require('../models/hashtagSchema.js');
var follower = require('../models/followersSchema.js');
var log = require('../../config/logging')()

//find id of user from username
var getUserId = function(username, res) {

    user
        .find({
            username: username
        })
        .select('_id')
        .lean()
        .exec(function(err, userdata) {

            if (err) {
                log.error(err);
                res.send(err);

            } else if (userdata.length !== 0) {

                userid = (userdata[0]._id).toString();
                return res(null, userid);

            } else {

                return res(true, 'No user found');
            }

        });

}

var getusername = function(id, res) {

    user
        .find({
            _id: id
        })
        .select('username')
        .exec(function(err, userdata) {

            if (err) {
                log.error(err);
                res.send(err);
            } else if (userdata.length !== 0) {

                username = userdata[0].username;

                return res(null, username);
            } else {

                return res(true, 'No user found');
            }

        });

}

var hashtagMention = function(type, post, mentionusers, hashtags, res) {

    console.info(post._id);

    if (typeof mentionusers != "undefined" && mentionusers != null && mentionusers.length > 0) {

        var mention_users = new Array();

        for (var i = 0; i < mentionusers.length; i++) {

            mention_users[i] = mentionusers[i];

        }

        if (type == 1) {

            var mention = new mention_model.post_mention({
                post_id: post._id,
                mention_users: mention_users
            });

        } else if (type == 2) {

            var mention = new mention_model.retweet_quote_mention({
                retweet_quote_id: post._id,
                mention_users: mention_users
            });

        } else if (type == 3) {

            var mention = new mention_model.reply_mention({
                reply_id: post._id,
                mention_users: mention_users
            });

        }

        mention.save(function(err) {
            if (err) {
                log.error(err);
                res.send(err);
            }
        });

    };

    if (typeof hashtags != "undefined" && hashtags != null && hashtags.length > 0) {

        var hashtagkd = new Array();

        for (var k = 0; k < hashtags.length; k++) {

            hashtagkd[k] = hashtags[k];
            log.info('hashtagkeyword', hashtagkd[k]);

            post_model.trends
                .findOneAndUpdate({
                    keyword: hashtags[k]
                }, {
                    $inc: {
                        count: +1
                    },
                    updated_at: Date.now()
                }, {
                    upsert: true,
                    setDefaultsOnInsert: true
                }, function(err, result) {

                    if (err) {
                        log.error(err);
                        res.send(err);
                    }
                    log.info('Trends updated');
                })

        }

        if (type == 1) {

            var hashtag = new hashtag_model.post_hashtag({
                post_id: post._id,
                hashtag: hashtagkd
            });

        } else if (type == 2) {

            var hashtag = new hashtag_model.retweet_quote_hashtag({
                retweet_quote_id: post._id,
                hashtag: hashtagkd
            });

        } else if (type == 3) {

            var hashtag = new hashtag_model.reply_hashtag({
                reply_id: post._id,
                hashtag: hashtagkd
            });

        }

        //find keyword if it is present update count, other wise create new trend
        hashtag.save(function(err) {
            if (err) {
                log.error(err);
                res.send(err);
            }
        });

    };

    // if (typeof post_links != "undefined" && post_links != null && post_links.length > 0) {

    //     var post_url = new post_model.post_url({
    //         _id: post._id,
    //         post_url: post_links // posted by 
    //     });

    //     post_url.save(function(err) {
    //         if (err)
    //             res.send(err);
    //     });

    // };
    return res(null, 'Post created!');

}

var isFollowing = function(user_id, following_id, callback) {

    follower
        .find({
            user_id: user_id,
            following_id: following_id,
            follow_status: 'true'
        })
        .lean()
        .exec(function(err, result) {
            if (err) {
                log.error(err);
                res.send(err);
            }
            log.info('isFollowing Result', result);
            if (result.length !== 0) {
                return callback(true); //following
            } else {
                return callback(false);
            }
        })
}

var getPrivacyStatus = function(userid, loggedid, callback) {
    //check userid and loggeduser same or not
    if (loggedid == userid) {

        privacyStatus = 1;

        callback(null, privacyStatus);

    } else {

        isFollowing(userid, loggedid, function(followResult) {

            if (followResult) {

                privacyStatus = 2;

            } else {

                privacyStatus = 3;

            }

            callback(null, privacyStatus);
            console.info('master', privacyStatus);
        });

    }

}

var updateUser = function(userid, callback) {

    user
        .findOneAndUpdate({
            _id: userid
        }, {
            update_at: new Date()
        })
        .lean()
        .exec(function(err, updateResult) {

            if (err) {
                log.error(err);
                res.send(err);
            }

            if (updateResult.length !== 0) {

                callback(null, updateResult);

            } else{

                callback(true, 'No user found to update');
                
            }

        })
}

module.exports = ({
    getUserId: getUserId,
    hashtagMention: hashtagMention,
    getusername: getusername,
    isFollowing: isFollowing,
    getPrivacyStatus: getPrivacyStatus,
    updateUser:updateUser
})