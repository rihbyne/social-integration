"use strict";
var user = require('../models/userSchema.js');
var post_model = require('../models/postSchema.js');
var user_followers = require('../models/followersSchema.js');
var follower = require('../models/followersSchema.js');
var master = require('./master.js');
var async = require('async');
var request = require('request');
var log = require('../../config/logging')();

// to get details @logged in user home page using same API for ejs
var loggednin_home_userdetails = function(req, res) {

    log.info('Show all posts for single user on home page');
    var username_param = req.user.username;
    log.info('user name default is ' + username_param);
    var username = username_param; // find posts of user and check for errors

    var result1, result2;

    //Get My Post
    master.getUserId(username, function(err, userid, user_details_all) {

        if (err) {

            log.info(userid);

            res.json({
                Result: userid
                // PostRTReply : result
            });

            return;
        };
        log.info(userid);

        //using async series function get all post 
        async.parallel([
                getPostByUserId,
                getRetweetByUserId,
                getQuoteRetweetByUserId
            ],
            function(err, result) {

                log.info(result);

                var profilePosts;

                if (err) {

                    if (result[0] === 0) {
                        log.info('Own posts are zero');
                        var profilePosts = result[1]
                    }

                    if (result[1] === 0) {
                        log.info('Retweet posts are zero');
                        var profilePosts = result[0]
                    }
                    // res.json({
                    //     message: result
                    // });
                    // return;
                } else {

                    var profilePosts = result[0].concat(result[1]); //Got two result , concent two results
                    function custom_sort(a, b) {
                        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                    }

                    profilePosts.sort(custom_sort);

                };


                res.render('pages/index.ejs', {
                    ProfilePosts: profilePosts,
                    pro_user: user_details_all,
                    user: req.user
                });
                // res.json({
                //     ProfilePosts: profilePosts ,
                //     pro_user: user_details_all , 
                //     user : req.user
                // });

            });

    });

}

//Get all post and retweet of user
var getuserhomeposts = function(req, res) { // get a post 

    log.info('Show all posts for single user on home page');

    var userid = req.body.user_id; // find posts of user
    var loggedid = req.body.logged_id;

    log.info('userid, loggedid', userid + '   ' + loggedid);

    master.getPrivacyStatus(userid, loggedid, function(err, privacyStatus) {

        if (err) {
            log.error(err);
            res.send(err);
        };

        //using async series function get all post 
        async.parallel([
                callback => getPostByUserId(userid, privacyStatus, callback),
                callback => getRetweetByUserId(userid, privacyStatus, callback),
                callback => getQuoteRetweetByUserId(userid, privacyStatus, callback)
            ],
            function(err, result) {

                log.info(result);

                var profilePosts;

                if (err) {

                    if (result[0] === 0) {
                        log.info('Own posts are zero');
                        var profilePosts = result[1]
                    }

                    if (result[1] === 0) {
                        log.info('Retweet posts are zero');
                        var profilePosts = result[0]
                    }

                } else {

                    var profilePosts = result[0].concat(result[1]).concat(result[2]); //Got two result , concent two results
                    function custom_sort(a, b) {
                        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                    }

                    profilePosts.sort(custom_sort);

                };

                res.json({
                    ProfilePosts: profilePosts
                });

            });

    })


}

//Get all post, retweet and reply of user
var getpostsrtreply = function(req, res) { // get a post 

    log.info('Show all posts, retweet & reply for single user');

    var userid = req.body.user_id; // find posts of user
    var loggedid = req.body.logged_id;

    var result1, result2;

    log.info('userid, loggedid', userid + '   ' + loggedid);

    master.getPrivacyStatus(userid, loggedid, function(err, privacyStatus) {

        if (err) {
            log.error(err);
            res.send(err);
        };

        //using async series function get all post 
        async.parallel([
                callback => getPostByUserId(userid, privacyStatus, callback),
                callback => getRetweetByUserId(userid, privacyStatus, callback),
                callback => getQuoteRetweetByUserId(userid, privacyStatus, callback),
                callback => getReplyByUserId(userid, privacyStatus, callback)
            ],
            function(err, result) {

                //log.info(result);

                var profilePosts;

                if (err) {

                    if (result[0] === 0) {
                        log.info('Own posts are zero');
                        var profilePosts = result[1]
                    }

                    if (result[1] === 0) {
                        log.info('Retweet posts are zero');
                        var profilePosts = result[0]
                    }

                } else {

                    var profilePosts = result[0].concat(result[1]).concat(result[2]).concat(result[3]); //Got two result , concent two results

                    function custom_sort(a, b) {
                        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                    }

                    profilePosts.sort(custom_sort);

                };

                // log.info(result[0]+''+result[1]);

                res.json({
                    PostRTReply: profilePosts
                    // PostRTReply : result
                });

            });

    });

}

//find post from userid
function getPostByUserId(userid, privacyStatus, callback) {

    var query, privacyStatus;

    switch (privacyStatus) {

        case 1:
            query = {
                posted_by: userid
            }
            break;

        case 2:
            query = {
                $and: [{
                    posted_by: userid
                }, {
                    privacy_setting: {
                        $ne: 2
                    }
                }]
            }
            break;

        default:
            query = {
                posted_by: userid,
                privacy_setting: 1
            }

    }

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
function getRetweetByUserId(userid, privacyStatus, callback) { //simple retweet

    var query, privacyStatus;

    switch (privacyStatus) {
        case 1:
            query = {
                ret_user_id: userid
            }
            break;
        case 2:
            query = {
                $and: [{
                    ret_user_id: userid
                }, {
                    privacy_setting: {
                        $ne: 2
                    }
                }]
            }
            break;
        default:
            query = {
                ret_user_id: userid,
                privacy_setting: 1
            }
    }

    post_model.retweet
        .find(query)
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
                                path: 'post_id',
                                populate: {
                                    path: 'posted_by'
                                }
                            }];

                        } else if (singleretweet.reply_id !== undefined) {

                            var options = [{
                                path: 'reply_id'
                            }, {
                                path: 'reply_id',
                                populate: {
                                    path: 'posted_by'
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
function getQuoteRetweetByUserId(userid, privacyStatus, callback) { //simple retweet

    var query, privacyStatus;

    switch (privacyStatus) {
        case 1:
            query = {
                ret_user_id: userid
            }
            break;
        case 2:
            query = {
                $and: [{
                    ret_user_id: userid
                }, {
                    privacy_setting: {
                        $ne: 2
                    }
                }]
            }
            break;
        default:
            query = {
                ret_user_id: userid,
                privacy_setting: 1
            }
    }

    post_model.retweet_quote
        .find(query)
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
function getReplyByUserId(userid, privacyStatus, callback) {

    var query, privacyStatus;

    switch (privacyStatus) {
        case 1:
            query = {
                reply_user_id: userid
            }
            break;
        case 2:
            query = {
                $and: [{
                    reply_user_id: userid
                }, {
                    privacy_setting: {
                        $ne: 2
                    }
                }]
            }
            break;
        default:
            query = {
                reply_user_id: userid,
                privacy_setting: 1
            }
    }

    post_model.reply
        .find(query)
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
    getuserhomeposts: getuserhomeposts,
    getpostsrtreply: getpostsrtreply,
    loggednin_home_userdetails: loggednin_home_userdetails
    // getRetweetByUserId:getRetweetByUserId
})