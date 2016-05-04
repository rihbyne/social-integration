var user = require('../models/userSchema.js');
var post_model = require('../models/postSchema.js');
var user_followers = require('../models/followersSchema.js');
var master = require('./master.js');
var async = require('async');

//Get all post and retweet of user
var getuserhomeposts = function(req, res) { // get a post 

    console.log('Show all posts for single user on home page');

    var username = req.params.username; // find posts of user and check for errors

    console.log('user ', req.params.username);

    var result1, result2;

    //Get My Post
    master.getUserId(username, function(err, userid){

        if (err) {
            
            console.info(userid);

            res.json({
                Result: userid
                // PostRTReply : result
            });

            return;
        };
        console.info(userid);

        //using async series function get all post 
        async.parallel([
            getPostByUserId,
            getRetweetByUserId,
            getQuoteRetweetByUserId
        ],
        function (err, result) {
                
            console.info(result);

            var profilePosts;

            if (err) {

                if (result[0] === 0) {
                    console.info('Own posts are zero');
                    var profilePosts = result[1]
                }

                if (result[1] === 0) {
                    console.info('Retweet posts are zero');
                    var profilePosts = result[0]
                }
                // res.json({
                //     message: result
                // });
                // return;

            }
            else{

                var profilePosts = result[0].concat(result[1]);//Got two result , concent two results
                    function custom_sort(a, b) {
                        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                    }

                profilePosts.sort(custom_sort);
                
            };

            // console.info(result[0]+''+result[1]);

            // res.render('pages/user_profile_home.ejs', {
            //     user: req.user , // get the user out of session and pass to template
            //     ProfilePosts: profilePosts
            // });

            res.json({
                ProfilePosts: profilePosts,
                user:req.user
            });


        });

    });

}

//Get all post, retweet and reply of user
var getpostsrtreply = function(req, res) { // get a post 

    console.log('Show all posts, retweet & reply for single user');

    var username = req.params.username; // find posts of user and check for errors

    console.log('user ', req.params.username);

    var result1, result2;

    //Get My Post
    master.getUserId(username, function(err, userid){

        if (err) {
            
            console.info(userid);

            res.json({
                Result: userid
                // PostRTReply : result
            });

            return;
        };
        console.info(userid);

        //using async series function get all post 
        async.parallel([
            getPostByUserId,
            getRetweetByUserId,
            getQuoteRetweetByUserId,
            getReplyByUserId
        ],
        function (err, result) {
                
            //console.info(result);

            var profilePosts;

            if (err) {

                if (result[0] === 0) {
                    console.info('Own posts are zero');
                    var profilePosts = result[1]
                }

                if (result[1] === 0) {
                    console.info('Retweet posts are zero');
                    var profilePosts = result[0]
                }
                // res.json({
                //     message: result
                // });
                // return;

            }
            else{

                var profilePosts = result[0].concat(result[1]).concat(result[2]).concat(result[3]);//Got two result , concent two results
               
                function custom_sort(a, b) {
                    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                }

                profilePosts.sort(custom_sort);
                
            };

            // console.info(result[0]+''+result[1]);

            res.json({
                PostRTReply: profilePosts
                // PostRTReply : result
            });

        });

    });

}

//find post from userid
function getPostByUserId(callback){

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

            callback(null, []);//No post found

        } else {

            callback(null, result);
        }

    });

}

//find retweet from userid
function getRetweetByUserId(callback){//simple retweet

    post_model.retweet
    .find({ret_user_id: userid})
    .sort({retweet_at: -1})
    .limit(10)
    .lean()
    .exec(function(err, retweets){

        if (err)
            res.send(err);

        else if (retweets.length == 0) {

             callback(null, []);//No post found

        } 
        else{

            async.each(retweets, 

                function(singleretweet, callback){

                    if (singleretweet.post_id !== undefined) {

                        var options = {
                            path: 'post_id',
                            model: 'post'
                        };

                    }
                    else if (singleretweet.retweet_quote_id !== undefined) {

                        var options = {
                            path: 'retweet_quote_id',
                            model: 'retweet_quote'
                        };
                        
                    }
                    else if (singleretweet.reply_id !== undefined) {

                        var options = {
                            path: 'reply_id',
                            model: 'reply'
                        };
                        
                    };

                    post_model.retweet
                    .populate(singleretweet, options, function (err, retweet) {

                        callback();

                    });
                        

                }, function(err){
                
                // console.info(retweets);

                return callback(null, retweets);

            });

        }

    });
}

//find reply from userid
function getReplyByUserId(callback){

    post_model.reply 
    .find({reply_user_id : userid})
    .sort({created_at: -1})
    .limit(5)
    .lean()
    .exec(function(err, postReplyResult){
        if (err) {
            res.send(err)
        };
        // console.info('Reply By user: \n',postReplyResult);

        async.each(postReplyResult, 

            function(singleReplyResult, callback){

                if (singleReplyResult.post_id !== undefined) {
                    
                    var options = {
                        path: 'post_id',
                        model: 'post'
                    };

                }
                else if (singleReplyResult.retweet_quote_id !== undefined) {

                    var options = {
                        path: 'retweet_quote_id',
                        model: 'retweet_quote'
                    };
                }
                else if (singleReplyResult.reply_id !== undefined) {

                    var options = {
                        path: 'reply_id',
                        model: 'reply'
                    };
                    
                };
                console.info(singleReplyResult);
                post_model.reply
                .populate(singleReplyResult, options, function (err, reply) {

                    callback();

                });
                // if (singlepostReplyResult.post_id == null) {

                //     console.info('this post is not available');
                //     singlepostReplyResult.post_id = 'This post is not available';

                // };

        }, function(err){
            
            callback(null, postReplyResult);

        });

    })

};

//find quote retweet from userid
function getQuoteRetweetByUserId(callback){//simple retweet

    post_model.retweet_quote
    .find({ret_user_id: userid})
    .sort({retweet_at: -1})
    .limit(10)
    .lean()
    .exec(function(err, retweets){

        if (err)
            res.send(err);

        else if (retweets.length == 0) {

             callback(null, []);//No post found

        } 
        else{

            async.each(retweets, 

                function(singleretweet, callback){

                    if (singleretweet.post_id !== undefined) {

                        var options = {
                            path: 'post_id',
                            model: 'post'
                        };

                    }
                    else if (singleretweet.retweet_quote_id !== undefined) {

                        var options = {
                            path: 'retweet_quote_id',
                            model: 'retweet_quote'
                        };
                        
                    }
                    else if (singleretweet.post_id !== undefined) {

                        var options = {
                            path: 'reply_id',
                            model: 'reply'
                        };
                        
                    };

                    post_model.retweet
                    .populate(singleretweet, options, function (err, retweet) {

                        callback();

                    });
                        

                }, function(err){
                
                // console.info(retweets);

                return callback(null, retweets);

            });

        }

    });
}

module.exports = ({
    getuserhomeposts : getuserhomeposts,
    getpostsrtreply : getpostsrtreply
    // getRetweetByUserId:getRetweetByUserId
})