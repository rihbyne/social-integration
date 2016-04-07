var post_model = require('../model/post_model.js');
var express = require('express');
var router = express.Router(), // get an instance of the express Router
	User = require('../app/models/user.js'),
    followers_data = require('../app/models/model.followers'),
    followers_data = require('../app/models/model.following');


var util = require('util');
var async = require('async');

//Get all post
module.exports.getuserdetails = function(req, res) { // get a post 
    console.log('Show user details');

    var userdetails = new Array();
    var userid = req.user._id;

    function allpost(callback) {
        // save the bear and check for errors

        post_model.post.find({posted_by: userid}).sort({created_at: -1}).exec(function(err, allpost) {

            if (err)
                res.send(err);
            // console.info(allpost);
            
            userdetails.allpost = allpost
            console.log('allpost', userdetails);
            // console.log(userdetails);
       
        }); 
    
        callback(null, userdetails);
    }

    function tweetcount(callback) {

        console.log('tweetcount ',userid);
            console.log( 'string user id  '+userid.toString());

        post_model.post
        .aggregate([

            {$match: {'posted_by': userid.toString()}}, 


            {$group: { _id: '$posted_by', count: {$sum: 1}}}
        ])
        
        .exec(function(err, tweetcount){

            if (err)
                res.send(err);

            // console.info(tweetcount);
             if (tweetcount.length == 0) {

                tweetcount = new Array();
                tweetcount[0] = {count:0};

            }

            userdetails.tweetcount = tweetcount            

        });

        callback(null, userdetails);
    }

    function trends(callback) {

        post_model.trends.find().sort({count: -1}).limit(5).exec(function(err, results){

            // console.log(results);

            if (err) {
                res.send(err);
            };

            userdetails.trends = results
            // res.json({
            //     message: results
            // });

            callback(null, userdetails);

        });
    }

    async.parallel([
        allpost,
        tweetcount,
        trends
    ], function (err, results){
        //after 5 seconds, results will be [1, 2]
        console.log(userdetails);

        res.render('pages/about', {
            userdetails : userdetails,
            user: req.user
        });
       // res.send(userdetails, req.user);
       // res.end();
    });

};


//Get all post
module.exports.getpost = function(req, res) { // get a post 
    console.log('Show all post');

    // save the bear and check for errors
    post_model.post.find(function(err, allpost) {
        if (err)
            res.send(err);

        res.json({
            posts: allpost
        });
    });

};

//Get single post
module.exports.getsinglepost = function(req, res) { // get a post 
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

//Get posts of hashtag
module.exports.gethashposts = function(req, res) { // get a post 

    console.log('Show posts of hashtag');

    var hashtag = req.params.hashtag;

    console.log('Hashtag : ', hashtag);
    // get the post and check for errors
    
    post_model.post_hashtag
    .find({
        hashtag: hashtag
    })
    .populate('post_id')
    .exec(function(err, hashs) {

        if (err)
            res.send(err);

        // res.json(hashs);

        res.render('pages/hashtag', {
            hashtags : hashs,
            hashtagelement: hashtag
        });

    });

};

//Get all post
module.exports.getuserposts = function(req, res) { // get a post 
    
    console.log('Show all posts for single user');
    
    var username = req.params.user;   // find posts of user and check for errors

    console.log('user ',req.params.user);

    //find id of user from user collection
    User
    .find({username: username})
    .exec(function(err, userdata) {

        if (err)
            res.send(err);
        
        else if(userdata.length !== 0)
        {
            userid = userdata[0]._id;
            // console.log(userid);

            //use userid to find all post of users
            post_model.post
            .find({posted_by: userid})
            .populate('posted_by like_link')
            .exec(function(err, result){

                if (err)
                    res.send(err);

                else if(result.length == 0)
                {
                    res.json({
                        message: 'No post found'
                    });
                }
                else{

                    res.json({
                        posts: result
                    });
                }
               

            });

        }
        else{
            res.json({
                message: 'No user found'
            })
        }

    });

};

//Get single post of user
module.exports.getuserpost = function(req, res) { // get a post 

    console.log('Show single posts for single user');

    var post_id = req.params.post_id;
    var user = req.params.user;   // find posts of user and check for errors

    console.log('post_id', post_id);
    console.log('post_user', user);

    // find posts of user and check for errors
    post_model.post
    .find({
        _id: post_id
    })
    .exec(function(err, userposts) {
        if (err)
            res.send(err);

        res.json({
            posts: userposts
        });
    });

};

//Get all post
module.exports.gethashtag = function(req, res) { // get a post 
    console.log('Show all HashTag');

    // find the hashtag and check for errors
    post_model.post_hashtag.find(function(err, allhashtag) {

        if (err)
            res.send(err);

        res.json({
            posts: allhashtag
        });

    });

};

//Set new post
module.exports.setnewpost = function(req, res) { // create a post 

    console.log('Add post');

    var username   = req.body.username; // get the post name (comes from the request)
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

    console.log('Mention Users : ', mentionusers);
    console.log('Hash Tags : ', hashtags);

    var post = new post_model.post({

        post_title: post_title,
        post_description: post_description,
        created_at: Date.now(),
        last_update: Date.now()

    }); // create a new instance of the post model

    function getuserid(username, callback){

        User
            .find({username: username})
            .exec(function(err, userdata){

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
    getuserid(username, function(data){

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

            // res.json({
            //     message: 'Post created!'
            // });

        });

    });
    
    if (typeof mentionusers != "undefined" && mentionusers != null && mentionusers.length > 0) {

        var mention_users = new Array();

        for(var i = 0; i < mentionusers.length; i++) {

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
           console.log('hashtagkeyword',hashtagkd[k]);

           post_model.trends
           .findOneAndUpdate({keyword: hashtags[k]}, {$inc: {count: +1}, updated_at: Date.now()}, {upsert: true, setDefaultsOnInsert: true}, function(err, result){

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

    };

    res.redirect('/about');

};

//Set users
module.exports.setuser = function(req, res){ //Create new user

    var W_user_id = req.body.W_user_id;
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
        W_user_id : W_user_id,
        first_name : first_name,
        last_name : last_name,
        email : email,
        username : username
    });

    setuser.save(function(err) {
        if (err)
            res.send(err);
        res.json({
            message: 'Users Inserted'
        });

    });

}

//Get Count of all hashtag
module.exports.allhashtagcount = function(req, res) { // get a post 

    console.log('Show count of all HashTag');

    // show count of post and check for errors
    post_model.post_hashtag.aggregate(
        {$group: 
         { _id: 0, count: { $sum: 1 } } 
    },function(err, allhashtag) {

        if (err)
            res.send(err);

        res.json({
            posts: allhashtag
        });

    });

};

//Get Count of specified hashtag
module.exports.hashtagcount = function(req, res) { // get a post 

    console.log('Show count of HashTag');

    var hashtagkeywd = req.params.hashtag;
    // show count of post and check for errors
    post_model.post_hashtag.aggregate({
        $group: 
            { _id: {
                hashtag: hashtagkeywd
                }, count: { 
        $sum: 1 
            } 
        } 
    },function(err, allhashtag) {

        if (err)
            res.send(err);

        res.json({
            posts: allhashtag
        });

    });

};

//Get Count of post of specified user
module.exports.getuserpostcount = function(req, res) { // get a post 

    console.log('Show count of HashTag');

    var user = req.params.user;

    // show count of post and check for errors
    post_model.post.aggregate({
        $group: 
            { _id: {
                posted_by: user
                }, count: { 
        $sum: 1 
            } 
        } 
    },function(err, postcount) {

        if (err)
            res.send(err);

        res.json({
            posts: postcount
        });

    });

};

//Set users
module.exports.setretweet = function(req, res) { //Create new user

    var post_id = req.body.post_id;
    var retweetuserid = req.body.retweet_user_id;
    var tweetstatus = req.body.tweetstatus;

    console.log('Retweet Api hitted');
    console.log(req.body.tweetstatus);
    console.log(req.body.post_id);
    console.log(req.body.retweet_user_id);

    post_model.post_retweet.find({
        post_id: post_id,
        ret_user_id: retweetuserid
    }).exec(function(err, retweetdata) {

        if (retweetdata.length !== 0) {

            console.log('You can not retweet on your own post');
            return;

            res.json({
                message: 'You can not retweet twice for same post'
            });
           

        } else {

            post_model.post.find({
                _id: post_id
            }).exec(function(err, postdata) {

                console.log('postdata', postdata);

                if (postdata[0] !== '') {

                    if (postdata[0].posted_by == retweetuserid) {

                        console.log('You can not retweet on your own post');
                        return;
                        // res.json({
                        //     message: 'You can not retweet on your own post'
                        // });

                    } else {

                        if (tweetstatus == 1) {

                            var retweet = new post_model.post_retweet({
                                post_id: post_id,
                                ret_user_id: retweetuserid
                            });

                            retweet.save(function(err) {

                                if (err)
                                    res.send(err);

                                post_model.post
                                    .findByIdAndUpdate(post_id, {
                                        $inc: {
                                            tweet_count: 1
                                        }
                                    })
                                    .exec(function(err, result) {

                                        console.log('query execuated', result);

                                        if (err) {
                                            res.send(err);
                                        };

                                    })

                                // res.json({
                                //     message: 'User retweeted'
                                // });
                                res.render('pages/profile');

                            });

                        } else if (tweetstatus == 2) {

                            post_model.post
                                .findByIdAndUpdate(post_id, {
                                    $inc: {
                                        tweet_count: -1
                                    }
                                })
                                .exec(function(err, result) {

                                    console.log('query execuated', result);
                                    if (err) {
                                        res.send(err);
                                    };

                                })

                            res.json({
                                message: 'Remove tweet'
                            });

                        }
                    }

                }

            });
        }

    })

}

//Get all post
module.exports.gethashtaglist = function(req, res) { // get a post 
    console.log('Show all HashTag');

    // find the hashtag and check for errors
    post_model.trends.find().sort({count: -1}).limit(5).exec(function(err, result){

        console.log(result);

        if (err) {
            res.send(err);
        };

        res.json({
            message: result
        });

    });

};

//Set postlike
module.exports.setlike = function(req, res) { //Create new user

    var post_id = req.body.post_id;
    var like_user_id = req.body.like_user_id;
    var likestatus = req.body.likestatus;   //
    var like_user_name= req.body.like_user_name;

    console.log('Like Api hitted');
    console.log('Like Status: ', req.body.likestatus);
    console.log('Post Id: ', req.body.post_id);
    console.log('Like User Id: ', req.body.like_user_id);

    post_model.post_like.find({
        post_id: post_id,
        like_user_id: like_user_id
    }).exec(function(err, likedata) {

        if (likedata.length !== 0) {

            console.log('You can not like twice for same post');
            console.log('Make it unlike. changed like status');
            // res.json({
            //     message: 'You can not like twice for same post'
            // });
           likestatus = 2; // chanaged lke status
        } 

        post_model.post.find({
            _id: post_id
        }).exec(function(err, postdata) {

            console.log('postdata\n', postdata);

            if (postdata.length !== 0) {

                // if (postdata[0].posted_by == like_user_id) {

                //     console.log('You can not like on your own post');
                //     return;
                //     // res.json({
                //     //     message: 'You can not retweet on your own post'
                //     // });

                // } else {

                        if (likestatus == 1) {

                            var likeModel = new post_model.post_like({
                                post_id: post_id,
                                like_user_id: like_user_id,
                                like_user_name: like_user_name
                            });

                            likeModel.save(function(err) {

                                if (err)
                                    res.send(err);
                                console.log('_id of like', likeModel._id);
                                post_model.post
                                    .findByIdAndUpdate(post_id, {
                                        $inc: {
                                            like_count: 1
                                        }, 
                                        $push: {"like_link": likeModel._id}
                                        
                                        
                                    })
                                    .exec(function(err, result) {

                                        console.log('New like added and modified like count \n', result);

                                        if (err) {
                                            res.send(err);
                                        };

                                    })

                                // res.json({
                                //     message: 'User retweeted'
                                // });
                                res.render('pages/profile');

                            });

                        } else if (likestatus == 2) {
                              
                                post_model.post_like
                                .find({$and: [{post_id : post_id}, {like_user_id : like_user_id}]})
                                .remove()
                                .exec(err, function(err, result) {

                                    console.log('Unlike document removed');
                                   
                                    if (err) {
                                        res.send(err);
                                        return;
                                    };

                                    if (result !== '') {

                                        post_model.post
                                        .findByIdAndUpdate(post_id, {
                                            $inc: {
                                                like_count: -1
                                            }
                                        })
                                        .exec(function(err, result) {

                                            console.log('Like count decrease by 1', result);
                                           
                                            if (err) {
                                                res.send(err);
                                                return;
                                            };

                                            res.json({
                                                 message: 'Remove Like'
                                            });

                                        })
                                    
                                    };


                                })

                        // }

                }
            }

        });
        
    });

}