var user = require('../app/models/userSchema.js');
var post_model = require('../app/models/postSchema.js');
var user_followers = require('../app/models/followersSchema.js');
var async = require('async');

//Get all post and retweet of user
var getuserhomeposts = function(req, res) { // get a post 

    console.log('Show all posts for single user on home page');

    var username = req.params.username; // find posts of user and check for errors

    console.log('user ', req.params.username);

    var result1, result2;

    //Get My Post
    getUserId(username, function(userid){

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
    getUserId(username, function(userid){

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

                var profilePosts = result[0].concat(result[1]).concat(result[2]);//Got two result , concent two results
               
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

                        var options = {
                            path: 'post_id',
                            model: 'post'
                        };

                    post_model.retweet
                    .populate(singleretweet, options, function (err, retweet) {

                        callback();

                    });
                        

                }, function(err){
                
                console.info(retweets);

                return callback(null, retweets);

            });

        }

    });
}

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

                if (singleReplyResult.post_id !== 'undefined') {

                    var options = {
                        path: 'post_id',
                        model: 'post'
                    };

                }
                else if (singleReplyResult.retweet_quote_id !== 'undefined') {

                    var options = {
                        path: 'retweet_quote_id',
                        model: 'retweet_quote'
                    };
                    
                }
                else if (singleReplyResult.reply_id !== 'undefined') {

                    var options = {
                        path: 'reply_id',
                        model: 'reply'
                    };
                    
                };

                post_model.reply
                .populate(singleReplyResult, options, function (err, retweet) {

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

//find id of user from user collection
var getUserId = function(username, res){

    user
    .find({
        username: username
    }).
    select('_id')
    .exec(function(err, userdata) {

        if (err)
            res.send(err);

        else if (userdata.length !== 0) {

            userid = userdata[0]._id;

            return res(userid);
        }

    });

}

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
                    console.info(singleretweet);
                    if (singleretweet.post_id !== 'undefined') {

                        var options = {
                            path: 'post_id',
                            model: 'post'
                        };

                    }
                    else if (singleretweet.retweet_quote_id !== 'undefined') {

                        var options = {
                            path: 'retweet_quote_id',
                            model: 'retweet_quote'
                        };
                        
                    }
                    else if (singleretweet.post_id !== 'undefined') {

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
                
                console.info(retweets);

                return callback(null, retweets);

            });

        }

    });
}
// var getRetweetByUserId = function(req, res){
// var userid = req.params.userid;

//     post_model.post_retweet
//     .find({ret_user_id: userid})
//     .sort({retweet_at: -1})
//     .limit(10)
//     .lean()
//     .exec(function(err, retweets){

//         if (err)
//             res.send(err);

//         else if (retweets.length == 0) {

//              callback(null, []);//No post found

//         } 
//         else{

//             async.each(retweets, 

//                 function(singleretweet, callback){

//                     if (singleretweet.retweet_type == '1') {

//                         var options = {
//                             path: 'post_id',
//                             model: 'post'
//                         };

//                     }
//                     else if(singleretweet.retweet_type == '2'){

//                         var options = {
//                             path: 'post_id',
//                             model: 'post_retweet'
//                         };

//                     }

//                     singleretweet['created_at'] = singleretweet.retweet_at;

//                     post_model.post_retweet
//                     .populate(singleretweet, options, function (err, retweet) {

//                         // finalObj.push(singleretweet)
//                         callback();

//                     });
                        

//                 }, function(err){
                
//                 console.info(retweets);
//                 // callback(null, retweets);
//                 return callback(retweets);

//             });

//         }

//     });

// }

module.exports = ({
    getuserhomeposts : getuserhomeposts,
    getpostsrtreply : getpostsrtreply
    // getRetweetByUserId:getRetweetByUserId
})