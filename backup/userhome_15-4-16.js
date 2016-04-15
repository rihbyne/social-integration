var user = require('../model/User.js');
var async = require('async');
var post_model = require('../model/post_model.js');
var user_followers = require('../app/models/model.final_followers.js');
    //Get all post
module.exports.getuserhomeposts = function(req, res) { // get a post 

    console.log('Show all posts for single user on home page');

    var user_id = req.params.user; // find posts of user and check for errors

    console.log('user_id ', user_id);

    // post_model
    // .post
    // .find({posted_by : user_id})
    // // .populate('posted_by')
    // .populate({
    //     path: 'posted_by',
    //     // Get friends of friends - populate the 'friends' array for every friend
    //     populate: { path: '_id' }
    // })
    // .exec(function(err, result){
    //     console.info(result);
    // })

    user
    .findById("570f9900b5b84a78098b22dc")
    .populate('post_description')
    .exec(function(err, result){
        console.info(result);
    })

}
                    