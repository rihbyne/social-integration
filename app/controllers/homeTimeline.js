var user = require('../models/userSchema.js');
var follower = require('../models/followersSchema.js');
var post_model = require('../models/postSchema.js');
var log = require('../../config/logging')();

var homeTimeline = function(req, res) {

    log.info('home timeline api hitted');

    var userid = req.body.userid;
    var timestamp = req.body.timestamp;
    var flag = req.body.flag; // New - 1 and Old - 2 

    req.checkBody('userid', 'User id is mandatory').notEmpty();

    var errors = req.validationErrors();

    if (errors) {
        log.info('There have been validation errors: ' + util.inspect(errors));
        res.status('400').json('There have been validation errors: ' + util.inspect(errors));
        return;
    }

    //find latest following users 
    follower
        .find({
            user_id: userid,
            follow_status: true
        })
        .select('following_id count')
        .populate({
            path: 'following_id',
            select: ('_id update_at')
        })
        .sort({
            'update_at': -1
        })
        .limit(10)
        .lean()
        .exec(function(err, followingResult) {

            if (err) {

                log.error(err);
                res.send(err);
                return;
            }

            //find update time of logged user
            user
                .find({
                    _id: userid
                })
                .select('_id update_at')
                .exec(function(err, userResult) {

                    if (err) {

                        log.error(err);
                        res.send(err);
                        return;
                    }
                    //if result is not blank
                    if (userResult.length !== 0) {

                        //make array of following uses
                        followingIds = followingResult.map(function(singleFollowing) {

                            return singleFollowing.following_id._id;

                        });

                        var showPostLoggedUser = 'false';

                        //if following users avaliable
                        if (followingResult.length !== 0) {

                            if (userResult[0].update_at <= followingResult[0].following_id.update_at) {

                                followingResult[followingResult.length++] = userResult[0];

                                console.info(followingResult);

                                var showPostLoggedUser = 'true';
                            }

                            log.info(userResult[0].update_at + '' + followingResult[0].following_id.update_at);

                        } else {

                            followingIds.push(userResult[0]._id);

                        }

                        log.info('show post logged user: ', showPostLoggedUser);

                        //async call for post, retweet, quote, reply
                        async.parallel([
                                callback => getPostByUserId(showPostLoggedUser, userid, timestamp, flag, callback),
                                callback => getRetweetByUserId(showPostLoggedUser, userid, timestamp, flag, callback),
                                callback => getQuoteRetweetByUserId(showPostLoggedUser, userid, timestamp, flag, callback),
                                callback => getReplyByUserId(showPostLoggedUser, userid, timestamp, flag, callback)
                            ],
                            function(err, result) {

                                if (err) {

                                    log.info(err);
                                    res.send(err);

                                } else {

                                    //Make one homeposts array
                                    var homePosts = result[0].concat(result[1]).concat(result[2]).concat(result[3]); //Got two result , concent two results

                                    //date wise sort
                                    function custom_sort(a, b) {
                                        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                                    }

                                    homePosts.sort(custom_sort);

                                    homePosts = homePosts.slice(0, 10);
                                    // log.info(homePosts);
                                    res.json(homePosts);

                                }

                            })

                    } else {
                        log.info('user not found');
                        res.send('user not found');
                    }

                });

        })

}

//find post from userid
function getPostByUserId(showPostLoggedUser, userid, timestamp, flag, callback) {

    // log.info(showPostLoggedUser);
    if (showPostLoggedUser) {

        var query = {

            $or: [{
                posted_by: {
                    $in: followingIds
                },
                privacy_setting: {
                    $ne: 2
                }
            }, {
                posted_by: userid
            }]

        }

    } else {

        var query = {
            posted_by: {
                $in: followingIds
            },
            privacy_setting: {
                $ne: 2
            }

        }

    }

    if (flag == 1) {

        query.created_at = {
            $lte: timestamp

        }

    } else if (flag == 2) {

        query.created_at = {
            $gte: timestamp

        }

    };

    //use userid to find all post of users
    post_model.post
        .find(query)
        .populate('posted_by')
        .sort({
            created_at: -1
        })
        .limit(10)
        .exec(function(err, result) {

            if (err) {

                log.error(err);
                res.send(err);
                return

            } else if (result.length == 0) {

                callback(null, []); //No post found

            } else {

                console.info(result);
                callback(null, result);

            }

        });

}

//find retweet from userid
function getRetweetByUserId(showPostLoggedUser, userid, timestamp, flag, callback) { //simple retweet

    if (showPostLoggedUser) {

        var query = {

            $or: [{

                ret_user_id: {
                    $in: followingIds
                },
                privacy_setting: {
                    $ne: 2
                }

            }, {
                ret_user_id: userid
            }]

        }

    } else {

        var query = {

            ret_user_id: {
                $in: followingIds
            },
            privacy_setting: {
                $ne: 2
            }

        }

    }

    if (flag == 1) {

        query.created_at = {
            $lte: timestamp

        }

    } else if (flag == 2) {

        query.created_at = {
            $gte: timestamp

        }

    };

    post_model.retweet
        .find(query)
        .populate('ret_user_id')
        .sort({
            retweet_at: -1
        })
        .limit(10)
        .lean()
        .exec(function(err, retweets) {

            if (err) {

                log.error(err);
                res.send(err);
                return

            } else if (retweets.length == 0) {

                callback(null, []); //No post found

            } else {

                async.each(retweets,

                    function(singleretweet, callback) {

                        if (singleretweet.post_id !== undefined) {

                            var options = [{
                                path: 'post_id'
                            }, {
                                path: 'post_id',
                                populate: {
                                    path: 'posted_by'
                                }
                            }];

                        } else if (singleretweet.retweet_quote_id !== undefined) {

                            var options = [{
                                path: 'retweet_quote_id',
                                path: 'ret_user_id'
                            }, {
                                path: 'retweet_quote_id',
                                populate: {
                                    path: 'ret_user_id'
                                }
                            }];

                        } else if (singleretweet.reply_id !== undefined) {

                            var options = [{
                                path: 'reply_id'
                            }, {
                                path: 'reply_id',
                                populate: {
                                    path: 'reply_user_id'
                                }
                            }];

                        };

                        post_model.retweet
                            .populate(singleretweet, options, function(err, retweet) {

                                callback();

                            });


                    }, function(err) {

                        // log.info(retweets);

                        return callback(null, retweets);

                    });

            }

        });

}

//find quote retweet from userid
function getQuoteRetweetByUserId(showPostLoggedUser, userid, timestamp, flag, callback) { //simple retweet

    if (showPostLoggedUser) {

        var query = {

            $or: [{
                ret_user_id: {
                    $in: followingIds
                },
                privacy_setting: {
                    $ne: 2
                }

            }, {
                ret_user_id: userid
            }]

        }

    } else {

        var query = {
            ret_user_id: {
                $in: followingIds
            },
            privacy_setting: {
                $ne: 2
            }

        }

    }

    if (flag == 1) {

        query.created_at = {
            $lte: timestamp

        }

    } else if (flag == 2) {

        query.created_at = {
            $gte: timestamp

        }

    };

    post_model.retweet_quote
        .find(query)
        .populate('ret_user_id')
        .sort({
            retweet_at: -1
        })
        .limit(10)
        .lean()
        .exec(function(err, retweets) {

            if (err) {
                log.error(err);
                res.send(err);
                return
            } else if (retweets.length == 0) {

                callback(null, []); //No post found

            } else {

                async.each(retweets,

                    function(singleretweet, callback) {

                        if (singleretweet.post_id !== undefined) {

                            var options = [{
                                path: 'post_id'
                            }, {
                                path: 'post_id',
                                populate: {
                                    path: 'posted_by'
                                }
                            }];

                        } else if (singleretweet.retweet_quote_id !== undefined) {

                            var options = [{
                                path: 'retweet_quote_id'
                            }, {
                                path: 'retweet_quote_id',
                                populate: {
                                    path: 'ret_user_id'
                                }
                            }];

                        } else if (singleretweet.reply_id !== undefined) {

                            var options = [{
                                path: 'reply_id'
                            }, {
                                path: 'reply_id',
                                populate: {
                                    path: 'reply_user_id'
                                }
                            }];

                        };

                        post_model.retweet
                            .populate(singleretweet, options, function(err, retweet) {

                                callback();

                            });


                    }, function(err) {

                        // log.info(retweets);
                        return callback(null, retweets);

                    });

            }

        });

}

//find reply from userid
function getReplyByUserId(showPostLoggedUser, userid, timestamp, flag, callback) {

    if (showPostLoggedUser) {

        var query = {

            $or: [{

                reply_user_id: {
                    $in: followingIds
                },
                privacy_setting: {
                    $ne: 2
                }
            }, {
                reply_user_id: userid
            }]

        }

    } else {

        var query = {

            reply_user_id: {
                $in: followingIds
            },
            privacy_setting: {
                $ne: 2
            }
        }

    }

    if (flag == 1) {

        query.created_at = {
            $lte: timestamp

        }

    } else if (flag == 2) {

        query.created_at = {
            $gte: timestamp

        }

    };
    
    post_model.reply
        .find(query)
        .populate('reply_user_id')
        .sort({
            created_at: -1
        })
        .limit(10)
        .lean()
        .exec(function(err, postReplyResult) {

            if (err) {
                log.error(err);
                res.send(err);
                return
            }
            // log.info('Reply By user: \n',postReplyResult);

            async.each(postReplyResult,

                function(singleReplyResult, callback) {

                    if (singleReplyResult.post_id !== undefined) {

                        var options = [{
                            path: 'post_id'
                        }, {
                            path: 'post_id',
                            populate: {
                                path: 'posted_by'
                            }
                        }];

                    } else if (singleReplyResult.retweet_quote_id !== undefined) {

                        var options = [{
                            path: 'retweet_quote_id'
                        }, {
                            path: 'retweet_quote_id',
                            populate: {
                                path: 'ret_user_id'
                            }
                        }];

                    } else if (singleReplyResult.reply_id !== undefined) {

                        var options = [{
                            path: 'reply_id'
                        }, {
                            path: 'reply_id',
                            populate: {
                                path: 'reply_user_id'
                            }
                        }];

                    };

                    post_model.reply
                        .populate(singleReplyResult, options, function(err, reply) {

                            callback();

                        });

                }, function(err) {

                    callback(null, postReplyResult);

                });

        })

};

module.exports = ({
    homeTimeline: homeTimeline
})