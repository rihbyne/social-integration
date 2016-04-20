var user = require('../app/models/user.js');
var async = require('async');
var post_model = require('../model/post_model.js');
var user_followers = require('../app/models/model.final_followers.js');

//Get all post
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

var getpostsrtreply = function(req, res) { // get a post 

    console.log('Show all posts for single user on process._stopProfilerIdleNotifier(); page');

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
    // .populate('posted_by like_by_users')
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
        .find({
            ret_user_id: userid
        }, {
            _id: 0
        })
        .select('post_id retweet_at')
        .populate('post_id')
        .sort({
            retweet_at: -1
        })
        .limit(10)
        .exec(function(err, retweetpostids) {

            //console.info('Retweet Post: ',retweetpostids);

            if (err)
                res.send(err);

            else if (retweetpostids.length == 0) {

                 callback(null, []);//No post found

            } else {

                async.each(retweetpostids,
                               
                    function(retweetpostid, callback) {

                        retweetpostid['post_id'].created_at = retweetpostid['retweet_at'];

                        finalObj.push(retweetpostid['post_id'])
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

}

function getReplyByUserId(callback){

    var replyResultArray = new Array;

    //use userid to find all post of users
    post_model.post
    .find({
        'post_reply.reply_by': userid
    }, {
        _id: 0
    })
    .select('posted_by post_reply')
    // .populate('posted_by like_by_users')
    .sort({
        reply_at: -1
    })
    .limit(10)
    .lean().exec(function(err, postReplyResult) {

        if (err)
            res.send(err);

        else if (postReplyResult.length == 0) {

            callback(null, []);//No post found

        } else {
            // console.info(postReplyResult);

                async.each(postReplyResult,
                               
                    function(postReplyOne, callback) {
                       console.info(postReplyOne);
                        postReplyOne['post_reply'][0]['created_at'] = postReplyOne['post_reply'][0]['reply_at'];
                        postReplyOne['post_reply'][0]['posted_by'] = postReplyOne['posted_by']  
                        // console.info(postReplyOne['post_reply'][0]);
                        replyResultArray.push(postReplyOne['post_reply'][0]);

                        // console.info(replyResultArray);
                        return callback(replyResultArray);

                    },
                    // 3rd param is the function to call when everything's done
                    function(err) {

                        // All tasks are done now
                    }

                );

            callback(null, replyResultArray);
        }

    });

}

//find id of user from user collection
var getUserId =function(username, res){

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