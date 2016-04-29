// Packages
var util = require('util');
var async = require('async');
var express = require('express');
var router = express.Router(); // get an instance of the express Router

// Pages
var post_model = require('../app/models/postSchema.js');
User = require('../app/models/userSchema.js'),
user_final_followers_schema = require('../app/models/followersSchema.js');


// //Get all post and other details
// var home_userdetails = function(req, res) {
//         request.get({

//             url: 'http://localhost:4000/req.user._id/getuserdetails',
//             headers: {
//                 "content-type": "application/json"
//             }

//         }, function optionalCallback(err, body) {

//             // res.render('pages/about', {
//             //     userdetails: userdetails,
//             //     user: req.user
//             // });
//             // res.render('pages/about', {
//             //     userdetails:body,
//             //     user: req.user
//             // })
//              res.json({
//                 userdetails:JSON.parse(body.body),
//                 user: req.user
//             })
//             // res.json({
//             //     Following_result: { data001: result , data002: JSON.parse(body.body) } 
//             //     // Following_result: [dk_f_list]
//             // })

//         })
//     } // Get Detailsvar getuserdetails = function(req, res) { 
var getuserdetails = function(req, res) { 

    var userdetails = new Array();
    var user_id         = req.user._id;
    
    async.parallel([
        allpost,
        tweetcount,
        trends,
        following,
        followers
    ], function (err, results){

        console.info(userdetails);
        res.render('pages/about', {
            userdetails : userdetails,
            user: req.user
        });

    });
    
    function allpost(callback) {
    
        post_model.post
        .find({posted_by: user_id})
        .sort({created_at: -1})
        .lean()
        .exec(function(err, allpost) {

            if (err)
                res.send(err);
            
            // console.info(allpost);

            async.each(allpost,
                                   
                function(singlepost, callback) {

                    post_model.post_like
                    .count({post_id: singlepost._id})
                    .lean()
                    .exec(function(err, countPostLikes){
                        if (err) {
                            res.send(err)
                        };
                        // console.info(countPostLikes);
                        if (countPostLikes !== 0) {
                            singlepost.postLikeCount = countPostLikes;
                            // console.info(singlepost);
                        }   
                        else{
                            singlepost.postLikeCount = 0;
                        }   
                        // console.info(singlepost);
                        callback();
                    })
                    
                },
                // 3rd param is the function to call when everything's done
                function(err) {
                    // All tasks are done now
                    console.info(allpost);
                    userdetails.allpost = allpost
                    callback(null, userdetails);
                  
                }

            );
            
                        
        }); 

    }

    function tweetcount(callback) {

        var totalCount;
        
        post_model.post
        .count({'posted_by': user_id.toString()})
        .lean()
        .exec(function(err, tweetcount){

            if (err)
                res.send(err);
            
            post_model.post_retweet
            .count({ret_user_id : user_id})
            .lean()
            .exec(function(err, retweetcount){
                if (err)
                res.send(err);

            console.info(tweetcount+''+retweetcount);
            var totalCount = tweetcount+retweetcount;

            console.log('Total count ',totalCount); 
            userdetails.tweetcount = totalCount            
            callback(null, userdetails);

            });


        })
        
    }

    function trends(callback) {

        post_model.trends.find().sort({count: -1}).limit(5).exec(function(err, results){

            if (err) {
                res.send(err);
            };

            userdetails.trends = results
            callback(null, userdetails);

        });
    }
    
    function following(callback) {
    
        user_final_followers_schema
        .count({$and:[{following_id : user_id},{follow_status:true}]})
        .exec(function(err, followingcount){
               
            if (err)
                res.send(err);
               
            userdetails.followingcount = followingcount
            callback(null, userdetails);        

        });

    }
    
    function followers(callback) {
    
        user_final_followers_schema
        .count({$and:[{user_id : user_id},{follow_status:true}]})
        .exec(function(err, followercount){
               
            if (err)
                res.send(err);
               
            userdetails.followerCount = followercount
            callback(null, userdetails);        

        });

    }

};


var Trendsdk = function(req, res) {

    post_model.trends
        .find()
        .sort({
            count: -1
        })
        .limit(5)
        .exec(function(err, results) {

            if (err) {
                res.send(err);
            };
            var TD = results
            res.json({
                trends_data: results
            });

        });
};

//Get all post 
// var getpost = function(req, res) {

//     post_model.post
// 	.find()
// 	.exec(function(err, allpost) {
//         if (err)
//             res.send(err);

//         res.json({
//             posts: allpost
//         });
//     });

// };

//Get single post of user
var getsinglepost = function(req, res) { // get a post 
    console.log('Show single post');
    var post_title = req.params.post_title;
    console.log(post_title);
    // get the post and check for errors

    post_model.post.findOne({
        post_title: post_title
    }).exec(function(err, singlepost) {
        if (err)
            res.send(err);
        if (singlepost) {
            res.json({
                posts: singlepost
            });
        } else {
            res.json('No Post Found')
        }

    });

};

//Get all post of user
var getuserposts = function(req, res) { // get a post 
    var finalObj = new Array;
    var finalObj1;
    console.log('Show all posts for single user');

    var username = req.params.user; // find posts of user and check for errors

    console.log('user ', req.params.user);

    //find id of user from user collection
    User
        .find({
            username: username
        })
        .exec(function(err, userdata) {

            if (err)
                res.send(err);

            else if (userdata.length !== 0) {
                userid = userdata[0]._id;
                // console.log(userid);

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

                        if (err)
                            res.send(err);

                        else if (result.length == 0) {
                            res.json({
                                message: 'No post found'
                            });
                        } else {

                            //show recent 10 retweeted post
                            // if (result[0].tweet_count !== 0) {      //check tweet count if not zero then proceed

                            // console.info('Retweet count', result[0].tweet_count);

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

                                    console.info('\n\n', finalObj1);
                                    // sortOut(finalObj1, function(){

                                    // var finalObjResult = JSON.stringify(finalObjResult);

                                    // console.info('\n\n', finalObjResult);

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

    console.log('Show single posts for single user');

    var post_id = req.params.post_id;
    var user = req.params.user; // find posts of user and check for errors

    console.log('post_id', post_id);
    console.log('post_user', user);

    // find posts of user and check for errors
    post_model.post
    .find({_id: post_id})
    .exec(function(err, userposts) {
        if (err)
            res.send(err);
            res.json({
                posts: userposts
            });
        });

};

//Set new post
var setpost = function(req, res) { // create a post 

    console.log('Add post');

    var username = req.body.username; // get the post name (comes from the request)
    var post_title = req.body.post_title; // get the post name (comes from the request)
    var post_description = req.body.post_description; // get the post name (comes from the request)
    var post_links = req.body.post_links;

    var mentionusers = new Array();
    var hashtags = new Array();

    var regexat = /@([^\s]+)/g;
    var regexhash = /#([^\s]+)/g;

    req.checkBody('post_description', 'Can not post empty tweet').notEmpty();

    var errors = req.validationErrors();

    if (errors) {
        // res.send('There have been validation errors: ' + util.inspect(errors), 400);
        res.status('400').json('There have been validation errors: ' + util.inspect(errors));
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

    console.log('Mention Users : ', mentionusers);
    console.log('Hash Tags : ', hashtags);

    var post = new post_model.post({

        username: username,
        post_title: post_title,
        post_description: post_description,
        created_at: Date.now(),
        last_update: Date.now()

    }); // create a new instance of the post model

    function getuserid(username, callback) {

        User
            .find({
                username: username
            })
            .exec(function(err, userdata) {

                if (err)
                    res.send(err);
                console.log(userdata);
                if (userdata.length !== 0) {

                    var data = userdata[0]._id;

                };

                callback(data);

            });

    }

    //call to getuserid function to get _id of user collection
    getuserid(username, function(data) {

        if (data == '') {

            res.json({
                message: 'User not found'
            });
            return;
        };

        post.posted_by = data;

        // save the post and check for errors
        post.save(function(err) {

            if (err)
                res.send(err);

			// user_final_followers_schema
			// .update({following_id:post.posted_by},{$set:{recent_activity:post.created_at}})
			// .lean()
			// .exec(function(err, resValue){
			
				// if (err)
					// res.send(err);
					
				// res.json({
				// 	message: 'Post created!'
				// });
                console.log('post created.');
			
			// })
			
        });

    });

    if (typeof mentionusers != "undefined" && mentionusers != null && mentionusers.length > 0) {

        var mention_users = new Array();

        for (var i = 0; i < mentionusers.length; i++) {

            mention_users[i] = mentionusers[i];

        }

        console.log(mention_users);

        var post_mention = new post_model.post_mention({
            post_id: post._id,
            posted_by: post.posted_by,
            mention_users: mention_users
        });

        post_mention.save(function(err) {
            if (err)
                res.send(err);
        });

    };

    if (typeof hashtags != "undefined" && hashtags != null && hashtags.length > 0) {

        var hashtagkd = new Array();

        for (var k = 0; k < hashtags.length; k++) {

            hashtagkd[k] = hashtags[k];
            console.log('hashtagkeyword', hashtagkd[k]);

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
                        res.send(err);
                    };
                    console.log('Trends updated');
                })

        }

        var post_hash = new post_model.post_hashtag({
            post_id: post._id,
            hashtag: hashtagkd
        });

        //find keyword if it is present update count, other wise create new trend
        post_hash.save(function(err) {
            if (err)
                res.send(err);
        });

    };

    if (typeof post_links != "undefined" && post_links != null && post_links.length > 0) {

        var post_url = new post_model.post_url({
            _id: post._id,
            post_url: post_links // posted by 
        });

        post_url.save(function(err) {
            if (err)
                res.send(err);
        });
        res.redirect('/about');

    };

    res.redirect('/about');

};

//Set users
var setuser = function(req, res) { //Create new user

    var first_name = req.body.first_name;
    var last_name = req.body.last_name;
    var email = req.body.email;
    var username = req.body.username;

    req.checkBody('first_name', 'Empty parameters').notEmpty();

    var errors = req.validationErrors();

    if (errors) {
        // res.send('There have been validation errors: ' + util.inspect(errors), 400);
        res.status('400').send('There have been validation errors: ' + util.inspect(errors));
        return;
    }

    var setuser = new User({
        first_name: first_name,
        last_name: last_name,
        email: email,
        username: username
    });

    setuser.save(function(err) {
        // if (err)
        //     res.send(err);
        res.json({
            message: 'Users Inserted'
        });

    });

}

//Get Count of post of specified user
var getuserpostcount = function(req, res) { // get a post 

    console.log('Show count of HashTag');

    var user = req.params.user;

    // show count of post and check for errors
    post_model.post.aggregate({
        $group: {
            _id: {
                posted_by: user
            },
            count: {
                $sum: 1
            }
        }
    }, function(err, postcount) {

        if (err)
            res.send(err);

        res.json({
            posts: postcount
        });

    });

};

var deletepost = function(req, res) {

    var post_id = req.body.post_id;

    post_model.post
        .findOneAndRemove({
            _id: post_id
        })
        .exec(function(err, result) {
            if (err) {
                res.send(err);
            };

            if (result !== null) {

                console.info('Post Deleted');

                res.json({
                    message: 'Post Deleted'
                });
            } else {

                console.info('No Post Found');

                res.json({
                    message: 'No Post Found'
                });
            }

        });

};

// var sortOut = function(finalObj1, res){

//     finalObj1.sort(function comp(a, b) {
//         console.info('function comp');
//         return new Date(a.created_at.date).getTime() - new Date(b.created_at.date).getTime();
//     });

// }

// var removepost = function(req, res){
//     var post_id = req.body.post_id;

// }

module.exports = ({
    getuserdetails: getuserdetails,
    // getpost : getpost,
    getsinglepost: getsinglepost,
    getuserposts: getuserposts,
    getuserpost: getuserpost,
    setpost: setpost,
    setuser: setuser,
    getuserpostcount: getuserpostcount,
    Trendsdk: Trendsdk,
    deletepost: deletepost
    // home_userdetails :home_userdetails
})