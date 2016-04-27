var user = require('../app/models/user.js');
var async = require('async');
var post_model = require('../app/models/post_model.js');
var user_followers = require('../app/models/model_followers.js');

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
            getRetweetPostsByUserId
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
            getRetweetPostsByUserId,
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
   
function getRetweetPostsByUserId(callback) {

    var finalObj = new Array;

        post_model.post_retweet
        .find({ret_user_id: userid}, {_id: 0})
        .select('post_id post_type retweet_at')
        .populate('post_id')
        .sort({retweet_at: -1})
        .limit(10)
        .exec(function(err, retweetpostids1) {
            console.info(retweetpostids1);
            var options = {
                path: 'post_id.posted_by',
                model: 'User'
            };

            post_model.post_retweet
            .populate(retweetpostids1, options, function (err, retweetpostids) {
                
                console.info('Retweet Post: ',retweetpostids);

                if (err)
                    res.send(err);

                else if (retweetpostids.length == 0) {

                     callback(null, []);//No post found

                } else {

                    async.each(retweetpostids,
                                   
                        function(retweetpostid, callback) {
                            // console.info(retweetpostid['post_id']);
                             
                            if (retweetpostid['post_id'] !== null) {

                                retweetpostid['post_id'].created_at = retweetpostid['retweet_at'];
                                finalObj.push(retweetpostid['post_id'])
                            }
                            
                            // console.info(finalObj);
                            return callback(finalObj);
                        },
                        // 3rd param is the function to call when everything's done
                        function(err) {

                            // All tasks are done now
                        }

                    );

                    callback(null, finalObj);
                }

            });

        });

}

function getReplyByUserId(callback){

    post_model.reply 
    .find({reply_user_id : userid})
    .populate('post_id post_owner_id')
    .sort({created_at: -1})
    .limit(5)
    .lean()
    .exec(function(err, postReplyResult){
        if (err) {
            res.send(err)
        };
        // console.info('Reply By user: \n',postReplyResult);

        async.each(postReplyResult, 

            function(singlepostReplyResult, callback){
                // console.info('single ',singlepostReplyResult);

                if (singlepostReplyResult.post_id == null) {

                    console.info('this post is not available');
                    singlepostReplyResult.post_id = 'This post is not available';

                };

                callback();

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

module.exports = ({
    getuserhomeposts : getuserhomeposts,
    getpostsrtreply : getpostsrtreply
})