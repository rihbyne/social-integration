var user = require('../models/userSchema.js');
var post_model = require('../models/postSchema.js');
var user_followers = require('../models/followersSchema.js');
var master = require('./master.js');
var async = require('async');
var request = require('request');

// to get details @logged in user home page using same API for ejs
var loggednin_home_userdetails = function(req, res) {
   
    console.log('Show all posts for single user on home page');
    var username_param = req.user.username 
    console.log('user name default is ' +username_param)
    var username = username_param; // find posts of user and check for errors

    var result1, result2;

    //Get My Post
    master.getUserId(username, function(err, userid , user_details_all){

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


            res.render('pages/index.ejs', {
                ProfilePosts: profilePosts ,
                pro_user: user_details_all , 
                user : req.user
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

    console.log('Show all posts for single user on home page');

    var username = req.params.username; // find posts of user and check for errors

    console.log('user ', req.params.username);

    var result1, result2;

    //Get My Post
    master.getUserId(username, function(err, userid , user_details_all){

        if (err) {
            
            console.info(userid);

            res.json({
                Error: userid
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

            }
            else{

                var profilePosts = result[0].concat(result[1]);//Got two result , concent two results
                    function custom_sort(a, b) {
                        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                    }

                profilePosts.sort(custom_sort);
                
            };

            // console.info(result[0]+''+result[1]);

            res.json({
                ProfilePosts: profilePosts 
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

                        var options = [
                        {
                            path: 'post_id'
                        },
                        {
                          path: 'post_id',
                          populate: {path: 'posted_by'}
                        }];

                    }
                    else if (singleretweet.retweet_quote_id !== undefined) {

                        var options = [{
                            path: 'retweet_quote_id'
                        },
                        {
                          path: 'post_id',
                          populate: {path: 'posted_by'}
                        }];
                        
                    }
                    else if (singleretweet.reply_id !== undefined) {

                        var options = [{
                            path: 'reply_id'
                        },
                        {
                          path: 'reply_id',
                          populate: {path: 'posted_by'}
                        }];
                        
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
                    
                    var options = [{
                            path: 'post_id'
                        },
                        {
                          path: 'post_id',
                          populate: {path: 'posted_by'}
                        }];

                }
                else if (singleReplyResult.retweet_quote_id !== undefined) {

                    var options = [{
                        path: 'retweet_quote_id'
                    },{
                      path: 'retweet_quote_id',
                      populate: {path: 'ret_user_id'}
                    }];

                }
                else if (singleReplyResult.reply_id !== undefined) {

                    var options = [{
                        path: 'reply_id'
                    },{
                      path: 'reply_id',
                      populate: {path: 'reply_user_id'}
                    }];
                    
                };

                post_model.reply
                .populate(singleReplyResult, options, function (err, reply) {

                    callback();

                });

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

                        var options = [{
                            path: 'post_id'
                        },{
                            path: 'post_id', 
                            populate:{path: 'posted_by'}}
                        ];

                    }
                    else if (singleretweet.retweet_quote_id !== undefined) {

                        var options = [{
                            path: 'retweet_quote_id'
                        }, {
                            path: 'retweet_quote_id', 
                            populate:{path: 'ret_user_id'}}
                        ];
                        
                    }
                    else if (singleretweet.reply_id !== undefined) {

                        var options = [{
                            path: 'reply_id'
                        },{
                            path: 'reply_id', 
                            populate:{path: 'reply_user_id'}}
                        ];
                        
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
    getpostsrtreply : getpostsrtreply,
    loggednin_home_userdetails:loggednin_home_userdetails
    // getRetweetByUserId:getRetweetByUserId
})