// Packages
var util = require('util');
var async = require('async');
var request = require('request');
// Pages
var follower 	= require('../models/followersSchema.js');
var users 		= require('../models/userSchema.js');
var master     	= require('./master.js');
var postSchema 	= require('../models/postSchema.js');
var notificationModel = require('../models/notificationSchema.js');
//Set following
var setfollowing = function(req, res) {
    var user_id = req.body.user_id; // User Id
    var following_id = req.body.following_id; // Following Id
    var follow_back;
    //validation for blank variables
    req.checkBody('user_id', 'User id is mandatory').notEmpty();
    req.checkBody('following_id', 'following_id is mandatory').notEmpty();
    var errors = req.validationErrors();
    if (errors) {
        // res.send('There have been validation errors: ' + util.inspect(errors), 400);
        res.status('400').json('There have been validation errors: ' + util.inspect(errors));
        return;
    }
    // validation for the same profile followes
    if (user_id === following_id) {
        console.log('You can not follow your own profile');
        res.json({
            message: 'You can not follow your own profile'
        })
        return;
    };
    // validation for the profile if already followed
    follower
        .find({
            $and: [{ user_id: user_id }, {
                following_id: following_id
            }, {
                follow_status: true
            }]
        })
        .exec(function(err, result) {
            if (result.length !== 0) {
                console.info('User already following');
                // res.json({
                //     message: 'User already following'
                // })
                return;
            } else { //add new follower
                console.info('update follower status');
                /*update user follower status true*/
                follower
                    .find({
                        $and: [{
                            user_id: following_id
                        }, {
                            following_id: user_id
                        }]
                    })
                    .select('follow_back')
                    .exec(function(err, result) {
                        if (err) {
                            res.send(err)
                        };
                        if (result.length == 1) {
                            console.info(result);
                            follower
                                .update({
                                    _id: result[0]._id
                                }, {
                                    follow_back: 'true'
                                })
                                .exec(function(err, statusResult) {
                                    if (err) {
                                        res.send(err);
                                    };
                                    console.info(statusResult);
                                })
                            follow_back = 'true';

                        } else {
                            follow_back = 'false';
                        };
                        isFollowing(user_id, following_id, function(result) {
                            console.info(result);
                            if (result) {

                                var followingModel = new follower({
                                    user_id: user_id,
                                    following_id: following_id,
                                    follow_back: follow_back
                                });
                                followingModel.save(function(err) {
                                    if (err)
                                        res.send(err);
                                    console.info('following/followers set saved');
									
									master.getusername(following_id, function(err, followingResult){
										
										if (err) {
											res.send(err)
										};
									
										if(followingResult !== 'No user found')
										{
											master.getusername(user_id, function(err, userResult){
										
												if (err) {
													res.send(err)
												};
													
												if(followingResult !== 'No user found')
												{
													var notification_message = followingResult+" is now following you";
											
													var notification = new notificationModel.notification({

														notification_message: notification_message,
														notification_user: userResult,
														username: followingResult
														
													});
													
													notification.save(function(err) {
												
														if (err)
															res.send(err);
															
														console.log('Notification Saved');
														
													})
												}
											})
											
										}
										
									})
									
                                });
                            } else {
                                follower
                                    .update({
                                        user_id: user_id,
                                        following_id: following_id,
                                        follow_status: false
                                    }, {
                                        follow_status: true
                                    })
                                    .exec(function(err, result) {
                                        if (err)
                                            res.send(err);
                                        console.info('following/followers update');
                                    });
                                console.info('update following');
                            }
                        });
                    });

                res.json({
                    message: 'following/followers set'
                })
                // var u_name = req.user.username
                // res.redirect('/' + u_name + '/following');
                // console.log('following/ followers set')
                // var url = req.url;
                // console.log('now url path is' +url)
            }
        })
}
var isFollowing = function(user_id, following_id, callback) {
        follower
            .find({
                user_id: user_id,
                following_id: following_id,
                follow_status: 'false'
            })
            .lean()
            .exec(function(err, result) {
                console.info(result);
                if (result.length == 0) {
                    return callback(true);
                } else {
                    return callback(false);
                }
            })
    }
    //Get following
var getfollowing = function(req, res) {
        var user_name = req.params.user_name;
        //validation for blank variables
        req.checkParams('user_name', 'User name is mandatory').notEmpty();
        var errors = req.validationErrors();
        if (errors) {
            // res.send('There have been validation errors: ' + util.inspect(errors), 400);
            res.status('400').json('There have been validation errors: ' + util.inspect(errors));
            return;
        }
        users
            .find({
                username: user_name
            })
        // .select('_id')
        // .exec(function(err, result) {
        //     // console.info(result[0]._id);
        //     if (result[0]._id) {
        //         follower
        //             .find({
        //                 $and: [{
        //                     user_id: result[0]._id
        //                 }, {
        //                     follow_status: true
        //                 }]
        //             })
        //             .populate('user_id following_id')
        //             .exec(function(err, result) {
        //                 console.info(result);
        //                 var f_list = result;
        //                 // res.json({
        //                 //     FollowingList: f_list
        //                 // })
        //                 res.render('pages/following', {
        //                     // FollowingList : ['result'],
        //                     FollowingList: f_list,
        //                     user: req.user
        //                 });
        //             })
        //     };
        // })
        .exec(function(err, result) {
            // console.info(result[0]._id);
            if (result[0]._id) {
                follower
                    .find({
                        $and: [{
                            user_id: result[0]._id
                        }, {
                            follow_status: true
                        }]
                    })
                    .populate('user_id following_id')
                    .exec(function(err, followerResult) {
                        console.info(followerResult);
                        request.get({
                            url: 'http://localhost:4000/Trendsdk',
                            headers: {
                                "content-type": "application/json"
                            }
                        }, function optionalCallback(err, body) {
                             var L_user = req.user
                            res.render('pages/following', {
                                Following_result: {
                                    data001: followerResult,
                                    // data002: JSON.parse(body.body)
                                    data002: body
                                },
                                pro_user: result,
                                user: L_user
                            });
                           
                            // res.send('pages/following', {
                            //     Following_result: {
                            //         data001: followerResult,
                            //         // data002: JSON.parse(body.body)
                            //         data002: body
                            //     },
                            //     pro_user: result,
                            //     user: L_user
                            // });
                        })
                    })
            };
        })
    }
    //get follower
var getfollowers = function(req, res) {
        var user_name = req.params.user_name;
        //validation for blank variables
        req.checkParams('user_name', 'User name is mandatory').notEmpty();
        var errors = req.validationErrors();
        if (errors) {
            // res.send('There have been validation errors: ' + util.inspect(errors), 400);
            res.status('400').json('There have been validation errors: ' + util.inspect(errors));
            return;
        }
        users
            .find({
                username: user_name
            })
        // .select('_id')
        .exec(function(err, result) {
            // console.info(result[0]._id);
            if (result[0]._id) {
                follower
                    .find({
                        $and: [{
                            following_id: result[0]._id
                        }, {
                            follow_status: true
                        }]
                    })
                    .populate('following_id user_id')
                    .exec(function(err, followerResult) {
                        // console.info(result);
                        // var f_list = result;
                        // // res.json({
                        // //     FollowersList: result
                        // // })
                        // res.render('pages/follower', {
                        //     // FollowingList : ['result'],
                        //     Followers_List: f_list,
                        //     user: req.user
                        // });
                        request.get({
                            url: 'http://localhost:4000/Trendsdk',
                            headers: {
                                "content-type": "application/json"
                            }
                        }, function optionalCallback(err, body) {
                            // res.render('pages/follower', {
                            //     Following_result: {
                            //         data001: followerResult,
                            //         data002: body
                            //     },
                            //     // Following_result: { data001: result , data002: JSON.parse(body.body) } ,
                            //     user: req.user
                            // });
                            var L_user = req.user
                            // res.send({
                            //     // Following_result: { data00201: result , data002: JSON.parse(body.body) }
                            //     Following_result: {
                            //         data001: followerResult,
                            //         data002: body
                            //     },
                            //     pro_user: result,
                            //     user: L_user
                            //     // Following_result: [dk_f_list]
                            // })
                             res.render( 'pages/follower' , {
                                // Following_result: { data00201: result , data002: JSON.parse(body.body) }
                                Following_result: {
                                    data001: followerResult,
                                    data002: body
                                },
                                pro_user: result,
                                user: L_user
                                // Following_result: [dk_f_list]
                            })
                        })
                    })
            };
        })
    }
    //Unlink following
var unlink_following = function(req, res) {
        console.info('unlink_followings api called');
        var user_id = req.body.user_id;
        var unlink_following = req.body.unlink_following;
        //validation for blank variables
        req.checkBody('user_id', 'User id is mandatory').notEmpty();
        req.checkBody('unlink_following', 'unlink_following is mandatory').notEmpty();
        var errors = req.validationErrors();
        if (errors) {
            // res.send('There have been validation errors: ' + util.inspect(errors), 400);
            res.status('400').json('There have been validation errors: ' + util.inspect(errors));
            return;
        }
        follower
            .update({
                $and: [{
                    user_id: user_id
                }, {
                    following_id: unlink_following
                }]
            }, {
                follow_status: false,
                follow_back: false
            })
            .exec(function(err, result) {
                if (err) {
                    console.log("found err" + err);
                } else {
                    follower
                        .update({
                            $and: [{
                                following_id: user_id
                            }, {
                                user_id: unlink_following
                            }]
                        }, {
                            follow_back: false
                        })
                        .exec(function(err, result) {
                            if (err) {
                                console.log("found err" + err);
                            } else {
                                // res.json({
                                //     message: 'Removed following'
                                // })
                                console.log('Removed following')
                                var u_name = req.user.username
                                res.redirect('/' + u_name + '/followers');
                            }
                        })
                }
            })
    }
    //Get Count of Follwer
var getCountFollower = function(req, res) {
        var user_id = req.params.user_id;
        //validation for blank variables
        req.checkParams('user_id', 'User name is mandatory').notEmpty();
        var errors = req.validationErrors();
        if (errors) {
            // res.send('There have been validation errors: ' + util.inspect(errors), 400);
            res.status('400').json('There have been validation errors: ' + util.inspect(errors));
            return;
        }
        users
            .count({
                _id: user_id
            }, function(err, usercount) {
                if (usercount > 0) {
                    follower
                        .count({
                            user_id: user_id
                        }, function(err, followercount) {
                            if (err)
                                res.send(err);
                            console.log('Count is ' + followercount);
                            res.json({
                                FollowerCount: followercount
                            });
                        });
                } else {
                    res.json({
                        Result: 'No user with this id'
                    });
                }
            });
    }
    //Get Count of Follwing
var getCountFollowing = function(req, res) {
    var following_id = req.params.following_id;
    //validation for blank variables
    req.checkParams('following_id', 'User name is mandatory').notEmpty();
    var errors = req.validationErrors();
    if (errors) {
        // res.send('There have been validation errors: ' + util.inspect(errors), 400);
        res.status('400').json('There have been validation errors: ' + util.inspect(errors));
        return;
    }
    users
        .count({
            _id: following_id
        }, function(err, usercount) {
            if (usercount > 0) {
                follower
                    .count({
                        following_id: following_id
                    }, function(err, followingcount) {
                        if (err)
                            res.send(err);
                        console.log('Count is ' + followingcount);
                        res.json({
                            Followingcount: followingcount
                        });
                    });
            } else {
                res.json({
                    Result: 'No user with this id'
                });
            }
        });
}
var getMutualFollowerYouKnow = function(req, res) {
        var user_id = req.params.user_id;
        var following_id = req.params.following_id;
        var count = 0;
        //validation for blank variables
        req.checkParams('user_id', 'User Id is mandatory').notEmpty();
        req.checkParams('following_id', 'Following Id is mandatory').notEmpty();
        var errors = req.validationErrors();
        if (errors) {
            // res.send('There have been validation errors: ' + util.inspect(errors), 400);
            res.status('400').json('There have been validation errors: ' + util.inspect(errors));
            return;
        }
        follower
            .find({
                $and: [{
                    user_id: user_id
                }, {
                    follow_status: true
                }]
            }, {
                _id: 0
            })
            .select('following_id')
            .lean()
            .exec(function(err, followingIds) {
                if (err)
                    res.send(err);
                follower
                    .find({
                        $and: [{
                            following_id: following_id
                        }, {
                            follow_status: true
                        }]
                    }, {
                        _id: 0
                    })
                    .populate('user_id')
                    .select('user_id')
                    .lean()
                    .exec(function(err, followerIds) {
                        // console.log(typeof(followerIds));
                        // console.log(followerIds);
                        var item, items;
                        var i = 0;
                        var users = [];
                        var id = []
                        for (item in followingIds) {
                            for (items in followerIds) {
                                if (followingIds[item].following_id == followerIds[items].user_id._id) {
                                    count++;
                                    users[i] = followerIds[items].user_id.username;
                                    id[i] = followerIds[items].user_id._id;
                                    i++
                                }
                            }
                        }
                        res.json({
                            // FollowingIds: followingIds,
                            // FollowerIds: followerIds,
                            users: users,
                            id: id,
                            count: count
                        });
                    })
            })
    }
    // var followLatestPost1 = function(req, res){
    // var user_id = req.params.user_id;
    // req.checkParams('user_id', 'User Id is mandatory').notEmpty();
    // var errors = req.validationErrors();
    // if (errors) {
    // res.status('400').json('There have been validation errors: ' + util.inspect(errors));
    // return;
    // }
    // follower
    // .find({$and:[{user_id:user_id},{follow_status:true}]})
    // .select('following_id recent_activity')
    // .sort({recent_activity:-1})
    // .limit(5)
    // .exec(function(err, result){
    // if(err)
    // res.send(err);
    // var arrayLength = result.length;
    // console.log(arrayLength);
    // var counter = 0;
    // var recentPost = [];
    // async.forEach(result, function (item, cb){
    // var followingId = item.following_id;
    // var recentActivity = item.recent_activity;
    // postSchema.post
    // .find({$and:[{posted_by:followingId},{created_at:recentActivity}]})
    // .lean()
    // .exec(function(err, output){
    // if(err)
    // res.send(err);
    // if(output!= null && output != undefined && output != "" )
    // {
    // console.log('Hello');
    // recentPost[counter]=output[0]
    // }
    // counter++;
    // if(counter==arrayLength)
    // {
    // res.send(recentPost);
    // return
    // }
    // cb();
    // })
    // })
    // })
    //}
    // var followLatestPost = function(req, res){
    // var user_id = req.params.user_id;
    // req.checkParams('user_id', 'User Id is mandatory').notEmpty();
    // var errors = req.validationErrors();
    // if (errors) {
    // res.status('400').json('There have been validation errors: ' + util.inspect(errors));
    // return;
    // }
    // }
module.exports = ({
    setfollowing: setfollowing,
    getfollowing: getfollowing,
    getfollowers: getfollowers,
    unlink_following: unlink_following,
    getCountFollower: getCountFollower,
    getCountFollowing: getCountFollowing,
    getMutualFollowerYouKnow: getMutualFollowerYouKnow,
    //followLatestPost : followLatestPost
})