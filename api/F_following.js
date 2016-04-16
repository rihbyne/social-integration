var user_final_followers_schema = require('../app/models/model.final_followers.js'),
    users = require('../app/models/user.js');


var util = require('util');

module.exports.setfollowing = function(req, res) {

    var user_id = req.body.user_id;
    var following_id = req.body.following_id;

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

        console.error('You can not follow your own profile');

        res.json({
            message: 'You can not follow your own profile'
        })

        return;
    };

    // validation for the profile if already followed 
    user_final_followers_schema.
    find({
        $and: [{
            user_id: user_id
        }, {
            following_id: following_id
        }]
    }).
    exec(function(err, result) {

        if (result.length !== 0) {


            console.info('User already following');

            res.json({
                message: 'User already following'
            })
            return;

        } else {

            var following_idModel = new user_final_followers_schema({

                user_id: user_id,
                following_id: following_id
            });

            following_idModel.save(function(err) {
                if (err)
                    res.send(err);
            });


            console.info('following/followers set saved');

            res.json({
                message: 'following/followers set'


            })
        }

    })

}

module.exports.getfollowing = function(req, res) {

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
        .select('_id')
        .exec(function(err, result) {

            // console.info(result[0]._id);

            if (result[0]._id) {

                user_final_followers_schema
                    .find({
                        user_id: result[0]._id
                    })
                    .exec(function(err, result) {
                        console.info(result);
                        res.json({
                            FollowingList: result
                        })

                    })

            };

        })

}

module.exports.getfollowers = function(req, res) {

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
        .select('_id')
        .exec(function(err, result) {

            // console.info(result[0]._id);

            if (result[0]._id) {

                user_final_followers_schema
                    .find({
                        following_id: result[0]._id
                    })
                    .exec(function(err, result) {
                        console.info(result);
                        res.json({
                            FollowersList: result
                        })

                    })

            };

        })

}

// old dk code
// module.exports.unlink_follower = function(req, res) {


//     var user_name = req.body.user_name;
//     var unlink_follower = req.body.unlink_follower;

//          //validation for blank variables
//     req.checkBody('user_name', 'User id is mandatory').notEmpty();
//     req.checkBody('unlink_follower', 'following_id is mandatory').notEmpty();

//     var errors = req.validationErrors();

//     if (errors) {
//         // res.send('There have been validation errors: ' + util.inspect(errors), 400);
//         res.status('400').json('There have been validation errors: ' + util.inspect(errors));
//         return;
//     }

//     console.info('unlink_follower api called');
//     user_final_followers_schema
//         .findOneAndRemove({
//             following_id: unlink_follower,
//             user_id: user_name
//         })
//         .exec(function(err, result) {
//             if (err) {
//                   res.json({
//                     errors: err
//                 })
//             } else {
//                 res.json({
//                     message: 'Removed follower'
//                 })
//             }
//         })
// }
module.exports.unlink_following = function(req, res) {
 
    console.info('unlink_followings api called');
    var user_name = req.body.user_name;
    var unlink_followings = req.body.unlink_followings;

        //validation for blank variables
    req.checkBody('user_name', 'User id is mandatory').notEmpty();
    req.checkBody('unlink_followings', 'unlink_followings is mandatory').notEmpty();

    var errors = req.validationErrors();

    if (errors) {
        // res.send('There have been validation errors: ' + util.inspect(errors), 400);
        res.status('400').json('There have been validation errors: ' + util.inspect(errors));
        return;
    }


    user_final_followers_schema
        .findOneAndRemove({
            user_id: user_name,
            following_id: unlink_followings
        })
        .exec(function(err, result) {
            if (err) {
                console.log("found err" + err);
            } else {
                res.json({
                    message: 'Removed following'
                })
            }
        })
}



//Get Count of Follwer
module.exports.getCountFollower = function(req, res){

    var user_id = req.params.user_id;

    //validation for blank variables
    req.checkParams('user_id', 'User name is mandatory').notEmpty();

    var errors = req.validationErrors();

    if (errors) {
        // res.send('There have been validation errors: ' + util.inspect(errors), 400);
        res.status('400').json('There have been validation errors: ' + util.inspect(errors));
        return;
    }

    user
    .count({_id: user_id}, function (err, usercount){ 

        if(usercount>0){

            user_final_followers_schema
            .count({user_id : user_id}, function(err, followercount) {
               
                if (err)
                    res.send(err);
               
                console.log('Count is ' + followercount);
                
                res.json({
                    FollowerCount: followercount
                });

            });

        }
        else{

            res.json({
                Result: 'No user with this id'
            });
        }

    }); 

}


//Get Count of Follwing
module.exports.getCountFollowing = function(req, res){

    var following_id = req.params.following_id;

    //validation for blank variables
    req.checkParams('following_id', 'User name is mandatory').notEmpty();

    var errors = req.validationErrors();

    if (errors) {
        // res.send('There have been validation errors: ' + util.inspect(errors), 400);
        res.status('400').json('There have been validation errors: ' + util.inspect(errors));
        return;
    }

    user
    .count({_id: following_id}, function (err, usercount){ 

        if(usercount>0){

            user_final_followers_schema
            .count({following_id : following_id}, function(err, followingcount) {
               
                if (err)
                    res.send(err);
               
                console.log('Count is ' + followingcount);
                
                res.json({
                    Followingcount: followingcount
                });

            });

        }
        else{

            res.json({
                Result: 'No user with this id'
            });
        }

    }); 

}

