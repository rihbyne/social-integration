var user = require('../app/models/user.js');
var async = require('async');
var post_model = require('../model/post_model.js');
var user_followers = require('../app/models/model.final_followers.js');
    //Get all post
var getuserhomeposts = function(req, res) { // get a post 

    console.log('Show all posts for single user on home page');

    var username = req.params.user; // find posts of user and check for errors

    console.log('user ', req.params.user);

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
        .select('post_id')
        .populate('post_id')
        .sort({
            retweet_at: -1
        })
        .limit(10)
        .exec(function(err, retweetpostids) {

            // console.info('Retweet Post: ',retweetpostids);

            if (err)
                res.send(err);

            else if (retweetpostids.length == 0) {

                 callback(null, []);//No post found

            } else {

                async.each(retweetpostids,
                               
                    function(retweetpostid, callback) {

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

// var getPostByUserId = function(userid, res){

//     //use userid to find all post of users
//     post_model.post
//     .find({
//         posted_by: userid
//     }, {
//         _id: 0
//     })
//     // .populate('posted_by like_by_users')
//     .sort({
//         created_at: -1
//     })
//     .limit(10)
//     .exec(function(err, result) {

//         if (err)
//             res.send(err);

//         else if (result.length == 0) {

//             return res(true, 'No post found');

//         } else {

//             return res(null, result);
//         }

//     });

// }

// var getRetweetPostsByUserId = function(userid, res) {

//     post_model.post_retweet
//     .find({
//         ret_user_id: userid
//     }, {
//         _id: 0
//     })
//     .select('post_id')
//     .populate('post_id')
//     .sort({
//         retweet_at: -1
//     })
//     .limit(10)
//     .exec(function(err, retweetpostids) {

//         if (err)
//             res.send(err);

//         else if (retweetpostids.length == 0) {

//             return res(true, 'No post found');

//         } else {

//             return res(null, retweetpostids);
//         }

//     });

// }

// var getMyFollowerids = function(userid, res){

//     user_followers
//     .find({user_id: userid})
//     .select('following_id')
//     .exec(function(err, followers){

//         if (err)
//             res.send(err);

//         else if (followers.length == 0) {

//             return res(true, 'No follower');

//         } else {

//             return res(null, followers);
//         }

//     })

// }

// var getMyFollowerPost = function(followerid, res){

//     post_model
//     .find()


// }
//show recent 10 retweeted post
// var getMyretweet = function(req, res){
            


// console.info('Retweet count', result[0].tweet_count);



// };
// }
                    

// console.info(result1);

        //Get Follower Post
        // getMyFollowerids(userid, function(err, myFollowers){

        //     if (err) {

        //         console.error(myFollowers);

        //         // res.json({
        //         //     message: result
        //         // });
        //         return;

        //     };

        //     // var userid = myFollowers
        //     //using async series function get all post 
        //     async.parallel([
        //         getPostByUserId,
        //         getRetweetPostsByUserId
        //     ],
        //     function (err, result) {
        //         if (err) {

        //             console.error(result);

        //             // res.json({
        //             //     message: result
        //             // });
        //             return;

        //         };

        //         console.info(result);
        //         // result1 = result;

        //     });

        // });


module.exports = ({
    getuserhomeposts : getuserhomeposts
})