var user_followers = require('../app/models/model.followers.js');
var user_following = require('../app/models/model.following.js');

// var users = require('../model/User.js');
var users = require('../app/models/user.js');


var util = require('util');


//Follwers
module.exports.getfollower = function(req, res) {

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
    .find({username: user_name})
    .select('_id')
    .exec(function(err, result){

        console.info(result);

        // res.json({
        //     message: result
        // })

        if (result[0]._id) {

            user_followers
            .find({user: result[0]._id})
            .exec(function(err, result){
                console.info(result);
                res.json({
                    FollowerList: result
                })

            })

        };
        
    })
    
}

module.exports.setfollower = function(req, res) {

    var user_id = req.body.user_id;
    var follower = req.body.follower;

    //validation for blank variables
    req.checkBody('user_id', 'User id is mandatory').notEmpty();
    req.checkBody('follower', 'follower is mandatory').notEmpty();

    var errors = req.validationErrors();

    if (errors) {
        // res.send('There have been validation errors: ' + util.inspect(errors), 400);
        res.status('400').json('There have been validation errors: ' + util.inspect(errors));
        return;
    }

    // validation for the same profile followes
    if (user_id === follower) {

        console.error('You can not follow your own profile');

        res.json({
            message: 'You can not follow your own profile'
        })

        return;
    };

    // validation for the profile if already followed 
    user_followers.
    find({
        $and: [{
            user: user_id
        }, {
            followers: follower
        }]
    }).
    exec(function(err, result) {

        if (result.length !== 0) {
            	
        	console.info('User already following');

        	res.json({
            	message: 'User already following'
        	})
        	return;

        }else{

        	var followerModel = new user_followers({
                user: user_id,
                follower: follower
            });

            followerModel.save(function(err) {
                if (err)
                    res.send(err);
            });

            console.info('follower saved');

            res.json({
                message: 'follower saved'
            })
        }

    })

}

module.exports.unlink_follower = function(req, res){

    console.info('Unlink api called');
    
    var user_name = req.body.user_name;
    var unlink_follower = req.body.unlink_follower;

    users
    .find({usernames: {$in: [user_name, unlink_follower]}})
    .select('_id')
    .exec(function(err, result){

         user_followers
        .find({$and:[{user: result[0]._id}, {follower: result[1]._id}] })
        .remove().exec(function(err, result){

            console.info('Removed follower');    

            res.json({
                message: 'Removed follower'
            })
            return;

        });

    });
    
}

//Following
module.exports.getFollowing = function(req, res){

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
    .find({username: user_name})
    .select('_id')
    .exec(function(err, result){

        console.info(result[0]._id);

        // res.json({
        //     message: result
        // })

        if (result[0]._id) {

            user_following
            .find({user: result[0]._id})
            .exec(function(err, result){
                console.info(result);
                res.json({
                    FollowingList: result
                })

            })

        };
        
    })

}

module.exports.setfollowing = function(req, res) {

    var user_id = req.body.user_id;
    var following = req.body.following;

    //validation for blank variables
    req.checkBody('user_id', 'User id is mandatory').notEmpty();
    req.checkBody('following', 'following is mandatory').notEmpty();

    var errors = req.validationErrors();

    if (errors) {
        // res.send('There have been validation errors: ' + util.inspect(errors), 400);
        res.status('400').json('There have been validation errors: ' + util.inspect(errors));
        return;
    }

    // validation for the same profile followes
    if (user_id === following) {

        console.error('You can not following your own profile');

        res.json({
            message: 'You can not following your own profile'
        })

        return;
    };

    // validation for the profile if already followed 
    user_following.
    find({
        $and: [{
            user: user_id
        }, {
            following: following
        }]
    }).
    exec(function(err, result) {

        if (result.length !== 0) {
                
            console.info('User already following');

            res.json({
                message: 'User already following'
            })
            return;

        }else{

            var followingModel = new user_following({
                user: user_id,
                following: following
            });

            followingModel.save(function(err) {
                if (err)
                    res.send(err);
            });

            console.info('following saved');

            res.json({
                message: 'following saved'
            })
        }

    })

}

module.exports.unlink_following = function(req, res){

    console.info('unlink following api called');
    
    var user_id = req.body.user_id;
    // var user_name = req.body.user_name;
    var unlink_following = req.body.unlink_following;

    // users
    // .find({usernames: {$in: [user_name, unlink_following]}})
    // .select('_id')
    // .exec(function(err, result){

    // var user_id = result[0]._id;
    // var following_id = result[1]._id;

        console.info(result);
         user_followers
        .find({$and:[{user: user_id}, {follower: unlink_following}] })
        .remove().exec(function(err, result){

            console.info('Removed following');    

            res.json({
                message: 'Removed following'
            })
            return;

        });

    // });
    
}