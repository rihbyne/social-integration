// Packages
var util = require('util');
var async = require('async');
var express = require('express');
var router = express.Router(); // get an instance of the express Router
var log = require('../../config/logging')();

// Pages
var master = require('./master.js');
var user_model = require('../models/userSchema.js');
var post_model = require('../models/postSchema.js');
var User = require('../models/userSchema.js');
var notificationModel = require('../models/notificationSchema.js');
var user_followers = require('../models/followersSchema.js');

var getuserdetails = function(req, res) {

    var userdetails = new Array();
    var user_id = req.user._id;

    async.parallel([
        allpost,
        tweetcount,
        trends,
        following,
        followers
    ], function(err, results) {

        log.info(userdetails);
        res.render('pages/about', {
            userdetails: userdetails,
            user: req.user
        });

    });

    function allpost(callback) {

        post_model.post
            .find({
                posted_by: user_id
            })
            .sort({
                created_at: -1
            })
            .lean()
            .exec(function(err, allpost) {

                if (err) {
                    log.error(err);
                    res.send(err);
                }

                // log.info(allpost);

                async.each(allpost, function(singlepost, callback) {

                        post_model.post_like
                            .count({
                                post_id: singlepost._id
                            })
                            .lean()
                            .exec(function(err, countPostLikes) {

                                if (err) {
                                    log.error(err);
                                    res.send(err);
                                }
                                // log.info(countPostLikes);
                                if (countPostLikes !== 0) {
                                    singlepost.postLikeCount = countPostLikes;
                                    // log.info(singlepost);
                                } else {
                                    singlepost.postLikeCount = 0;
                                }
                                // log.info(singlepost);
                                callback();
                            })

                    },
                    // 3rd param is the function to call when everything's done
                    function(err) {
                        // All tasks are done now
                        log.info(allpost);
                        userdetails.allpost = allpost
                        callback(null, userdetails);

                    });

            });

    }

    function tweetcount(callback) {

        async.parallel([

                function(callback) {
                    // show count of post and check for errors
                    post_model.post
                        .count({
                            posted_by: user_id
                        })
                        .exec(function(err, postcount) {


                            if (err) {
                                log.error(err);
                                res.send(err);
                            }

                            callback(null, postcount);

                        });

                },
                function(callback) {

                    // show count of post and check for errors
                    post_model.retweet_quote
                        .count({
                            ret_user_id: user_id
                        })
                        .exec(function(err, retweetcount) {

                            if (err) {
                                log.error(err);
                                res.send(err);
                            }

                            callback(null, retweetcount);

                        });

                },
                function(callback) {

                    // show count of post and check for errors
                    post_model.reply
                        .count({
                            reply_user_id: user_id
                        })
                        .exec(function(err, replycount) {

                            if (err) {
                                log.error(err);
                                res.send(err);
                            }

                            callback(null, replycount);

                        });

                }
            ],
            function(err, result) {

                var sumArray = function() {
                    // Use one adding function rather than create a new one each
                    // time sumArray is called
                    function add(a, b) {
                        return a + b;
                    }

                    return function(arr) {
                        return arr.reduce(add);
                    };
                }();

                var allCount = sumArray(result);

                userdetails.tweetcount = allCount
                callback(null, userdetails);
                // res.json({count : allCount});

            }

        )

    }

    function trends(callback) {

        post_model.trends.find().sort({
            count: -1
        }).limit(5).exec(function(err, results) {

            if (err) {
                log.error(err);
                res.send(err);
            };

            userdetails.trends = results
            callback(null, userdetails);

        });

    }

    function following(callback) {

        user_followers
            .count({
                $and: [{
                    following_id: user_id
                }, {
                    follow_status: true
                }]
            })
            .exec(function(err, followingcount) {

                if (err) {
                    log.error(err);
                    res.send(err);
                }

                userdetails.followingcount = followingcount
                callback(null, userdetails);

            });

    }

    function followers(callback) {

        user_followers
            .count({
                $and: [{
                    user_id: user_id
                }, {
                    follow_status: true
                }]
            })
            .exec(function(err, followercount) {

                if (err) {
                    log.error(err);
                    res.send(err);
                }

                userdetails.followerCount = followercount
                callback(null, userdetails);

            });

    }

};


var trend = function(req, res) {

    post_model.trends
        .find()
        .sort({
            count: -1
        })
        .limit(5)
        .exec(function(err, results) {

            if (err) {
                log.error(err);
                res.send(err);
            }

            var TD = results
            res.json({
                trends_data: results
            });

        });
};

//Get single post of user
var getsinglepost = function(req, res) { // get a post 
    log.info('Show single post');
    var post_title = req.params.post_title;
    log.info(post_title);
    // get the post and check for errors

    post_model.post.findOne({
        post_title: post_title
    }).exec(function(err, singlepost) {
        if (err) {
            log.error(err);
            res.send(err);
        }

        if (singlepost) {
            res.json({
                posts: singlepost
            });
        } else {
            log.info('No post found')
            res.json('No Post Found')
        }

    });

};

//Get all post of user
var getuserposts = function(req, res) { // get a post 

    var finalObj = new Array;
    var finalObj1;

    log.info('Show all posts for single user');

    var username = req.params.username; // find posts of user and check for errors

    log.info('user ', req.params.user);

    //find id of user from user collection
    User
        .find({
            username: username
        })
        .exec(function(err, userdata) {

            if (err) {
                log.error(err);
                res.send(err);
            } else if (userdata.length !== 0) {
                userid = userdata[0]._id;
                // log.info(userid);

                //use userid to find all post of users
                post_model.post
                    .find({
                        posted_by: userid
                    }, {
                        _id: 0
                    })
                    .populate('posted_by')
                    .sort({
                        created_at: -1
                    })
                    .limit(10)
                    .exec(function(err, result) {

                        if (err) {
                            log.error(err);
                            res.send(err);
                        } else if (result.length == 0) {
                            res.json({
                                message: 'No post found'
                            });
                        } else {

                            //show recent 10 retweeted post
                            // if (result[0].tweet_count !== 0) {      //check tweet count if not zero then proceed

                            // log.info('Retweet count', result[0].tweet_count);
                            post_model.post_retweet
                                .find({
                                    ret_user_id: userid
                                }, {
                                    _id: 0
                                })
                                .select('post_id')
                                .populate('post_id')
                                .sort({
                                    retweet_at: -1
                                })
                                .limit(10)
                                .exec(function(err, retweetpostids) {

                                    async.each(retweetpostids,

                                        function(retweetpostid, callback) {

                                            finalObj.push(retweetpostid['post_id'])

                                        },
                                        // 3rd param is the function to call when everything's done
                                        function(err) {
                                            // All tasks are done now
                                        }
                                    );

                                    var finalObj1 = result.concat(finalObj);

                                    log.info('\n\n', finalObj1);
                                    // sortOut(finalObj1, function(){

                                    // var finalObjResult = JSON.stringify(finalObjResult);

                                    // log.info('\n\n', finalObjResult);

                                    // })

                                    res.json({
                                        posts: finalObj1
                                    });

                                })

                            // };

                        }

                    });

            } else {
                res.json({
                    message: 'No user found'
                })
            }

        });

};

//Get single post of user
var getuserpost = function(req, res) { // get a post 

    log.info('Show single posts for single user');

    var post_id = req.params.post_id;
    var user = req.params.username; // find posts of user and check for errors

    log.info('post_id', post_id);
    log.info('post_user', user);

    // find posts of user and check for errors
    post_model.post
        .find({
            _id: post_id
        })
        .exec(function(err, userposts) {
            if (err) {
                log.error(err);
                res.send(err);
            }
            res.json({
                posts: userposts
            });
        });

};

//Set new post
var setpost = function(req, res) { // create a post 

    log.info('Add post api hitted');

    var userid = req.body.userid; // get the post name (comes from the request)
    var post_description = req.body.post_description; // get the post name (comes from the request)
    var privacy_setting = req.body.privacy_setting;
    //var post_links = req.body.post_links;

    var mentionusers = new Array();
    var hashtags = new Array();

    var regexat = /@([^\s]+)/g;
    var regexhash = /#([^\s]+)/g;

    req.checkBody('userid', 'userid is empty').notEmpty();
    req.checkBody('post_description', 'Can not post empty tweet').notEmpty();
    req.checkBody('privacy_setting', 'privacy setting is empty').notEmpty();

    var errors = req.validationErrors();

    if (errors) {
        log.warn('There have been validation errors: \n' + util.inspect(errors));
        res.status('400').send('There have been validation errors: \n' + util.inspect(errors));
        return;
    }

    while (match_at = regexat.exec(post_description)) {
        mentionusers.push(match_at[1]);
    }

    while (match_hash = regexhash.exec(post_description)) {
        hashtags.push(match_hash[1]);
    }

    // while (match_url = regexat.exec(post_description)) {
    //     urls.push(match_url[1]);
    // }

    log.info('Mention Users : ', mentionusers);
    log.info('Hash Tags : ', hashtags);

    var post = new post_model.post({

        posted_by: userid,
        post_description: post_description,
        privacy_setting: privacy_setting

    }); // create a new instance of the post model

    master.updateUser(userid, function(err, updateResult){

        if (err) {
            log.error(err);
            res.send(err);
        }

        // save the post and check for errors
        post.save(function(err, result) {

            if (err) {
                log.error(err);
                res.send(err);
            }

            master.getusername(result.posted_by, function(err, username) {

                log.info('Mention Users :' + mentionusers);

                if (mentionusers != "") {

                    var notification_message = username + ' Has Mentioned you in post';

                    var notification = new notificationModel.notification({

                        notification_message: notification_message,
                        notification_user: mentionusers,
                        post_id: post._id,
                        usrname: username

                    });

                    // log.info(notification_user);
                    notification.save(function(err) {

                        if (err) {
                            log.error(err);
                            res.send(err);
                        }

                        log.info('Notification Saved');

                    })

                }

                master.hashtagMention(1, post, mentionusers, hashtags, function(err, result) {

                    if (err) {
                        log.error(err);
                        res.send(err);

                    }

                    res.json({
                        message: result
                    });

                    log.info('Post Created.');

                });

            });

        });

    });

}

//Set users
var setuser = function(req, res) { //Create new user

    var first_name = req.body.first_name;
    var last_name = req.body.last_name;
    var email = req.body.email;
    var username = req.body.username;

    req.checkBody('first_name', 'Empty parameters').notEmpty();
    req.checkBody('last_name', 'Empty parameters').notEmpty();
    req.checkBody('email', 'Empty parameters').notEmpty();
    req.checkBody('username', 'Empty parameters').notEmpty();

    var errors = req.validationErrors();

    if (errors) {
        // res.send('There have been validation errors: ' + util.inspect(errors), 400);
        res.status('400').send('There have been validation errors: \n' + util.inspect(errors));
        return;
    }

    var setuser = new user_model({
        first_name: first_name,
        last_name: last_name,
        email: email,
        username: username
    });

    setuser.save(function(err) {

        if (err) {
            log.error(err);
            res.send(err);
        }

        res.json({
            message: 'Users Inserted'
        });

    });

}

//Get Count of post of specified user
var getuserpostcount = function(req, res) { // get a post 

    log.info('Show count of HashTag');

    var username = req.params.username;

    master.getUserId(username, function(err, userid) {

        if (err) {

            log.info(userid);

            res.json({
                Result: userid
                // PostRTReply : result
            });

            return;
        };
        log.info(userid);

        async.parallel([

                function(callback) {
                    // show count of post and check for errors
                    post_model.post
                        .count({
                            posted_by: userid
                        })
                        .exec(function(err, postcount) {

                            if (err) {
                                log.error(err);
                                res.send(err);
                            }

                            callback(null, postcount);

                        });

                },
                function(callback) {

                    // show count of post and check for errors
                    post_model.retweet_quote
                        .count({
                            ret_user_id: userid
                        })
                        .exec(function(err, retweetcount) {

                            if (err) {
                                log.error(err);
                                res.send(err);
                            }

                            callback(null, retweetcount);

                        });

                },
                function(callback) {

                    // show count of post and check for errors
                    post_model.reply
                        .count({
                            reply_user_id: userid
                        })
                        .exec(function(err, replycount) {

                            if (err) {
                                log.error(err);
                                res.send(err);
                            }

                            callback(null, replycount);

                        });

                }
            ],
            function(err, result) {

                var sumArray = function() {
                    // Use one adding function rather than create a new one each
                    // time sumArray is called
                    function add(a, b) {
                        return a + b;
                    }

                    return function(arr) {
                        return arr.reduce(add);
                    };
                }();

                var allCount = sumArray(result);

                res.json({
                    count: allCount
                });

            }

        )

    });

}

var deletepost = function(req, res) {

    var post_id = req.body.post_id;
    var posted_by = req.body.posted_by;

    req.checkBody('post_id', 'post_id').notEmpty();
    req.checkBody('posted_by', 'posted_by').notEmpty();

    var errors = req.validationErrors();

    if (errors) {
        log.warn('There have been validation errors: \n' + util.inspect(errors));
        res.status('400').json('There have been validation errors: ' + util.inspect(errors));
        return;
    }

    post_model.post
        .findOneAndRemove({
            _id: post_id,
            posted_by: posted_by
        })
        .exec(function(err, result) {
            if (err) {
                log.error(err);
                res.send(err);
            };

            if (result !== null) {

                log.info('Post Deleted');

                res.json({
                    message: 'Post Deleted'
                });
            } else {

                log.info('No Post Found');

                res.json({
                    message: 'No Post Found'
                });
            }

        });

};


//Get all post 
// var getpost = function(req, res) {

//     post_model.post
//  .find()
//  .exec(function(err, allpost) {
//         if (err)
// log.error(err);
//             res.send(err);

//         res.json({
//             posts: allpost
//         });
//     });

// };

module.exports = ({
    getuserdetails: getuserdetails,
    getsinglepost: getsinglepost,
    getuserposts: getuserposts,
    getuserpost: getuserpost,
    setpost: setpost,
    setuser: setuser,
    getuserpostcount: getuserpostcount,
    trend: trend,
    deletepost: deletepost
    // getpost : getpost,
    // home_userdetails :home_userdetails
})