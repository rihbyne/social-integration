var follower = require('../app/models/model_followers.js'),
    users = require('../app/models/user.js');

var util = require('util');

//Set following
var setfollowing = function(req, res) {

    var user_id = req.body.user_id;
    var following_id = req.body.following_id;
    var follow_back;

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
    follower
    .find({
        $and: [{
            user_id: user_id
        }, {
            following_id: following_id
        }, {
            follow_status: true
        }]
    })
    .exec(function(err, result) {

        if (result.length !== 0) {


            console.info('User already following');

            res.json({
                message: 'User already following'
            })
            return;

        } else {//add new follower
            
                console.info('update follower status');
                /*update user follower status true*/
                follower
                .find({
                    $and: [{
                        user_id: following_id
                    }, {
                        following_id: user_id
                    }]
                })
                .select('follow_back')
                .exec(function(err, result){
                   
                   if (err) {

                        res.send(err)
                   };

                   if (result.length == 1) {

                        console.info(result);

                        follower
                        .update({_id: result[0]._id}, {follow_back: 'true'})
                        .exec(function(err, statusResult){
                            if (err) {
                                res.send(err);
                            };
                            console.info(statusResult);

                        })

                        follow_back = 'true';
                   }
                   else{

                        follow_back = 'false';

                   };

                   var followingModel = new follower({

                        user_id: user_id,
                        following_id: following_id,
                        follow_back: follow_back

                    });

                    followingModel.save(function(err) {
                       
                        if (err)
                            res.send(err);

                        console.info('following/followers set saved');

                    });

                });

            res.json({

                message: 'following/followers set'

            })
        }

    })

}

//Get following
var getfollowing = function(req, res) {

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

            follower
            .find({$and:[{user_id: result[0]._id},{follow_status: true}]})
            .exec(function(err, result) {
                console.info(result);
                // res.json({
                //     FollowingList: result
                // })
                    res.render('pages/following', {
                        result : result,
                        user: req.user
                    });


            })

        };

    })

}

//get follower
var getfollowers = function(req, res) {

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

            follower
            .find({$and:[{following_id: result[0]._id},{follow_status: true}]})
            .exec(function(err, result) {
                console.info(result);
                res.json({
                    FollowersList: result
                })

            })

        };

    })

}

//Unlink following
var unlink_following = function(req, res) {
 
    console.info('unlink_followings api called');
    var user_id = req.body.user_id;
    var unlink_followings = req.body.unlink_followings;

        //validation for blank variables
    req.checkBody('user_id', 'User id is mandatory').notEmpty();
    req.checkBody('unlink_followings', 'unlink_followings is mandatory').notEmpty();

    var errors = req.validationErrors();

    if (errors) {
        // res.send('There have been validation errors: ' + util.inspect(errors), 400);
        res.status('400').json('There have been validation errors: ' + util.inspect(errors));
        return;
    }

    follower
        .update({
            $and: [{
                user_id: user_id
            }, {
                following_id: unlink_followings
            }]
        }, {
            follow_status: false
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
var getCountFollower = function(req, res){

    var user_id = req.params.user_id;

    //validation for blank variables
    req.checkParams('user_id', 'User name is mandatory').notEmpty();

    var errors = req.validationErrors();

    if (errors) {
        // res.send('There have been validation errors: ' + util.inspect(errors), 400);
        res.status('400').json('There have been validation errors: ' + util.inspect(errors));
        return;
    }

    users
    .count({_id: user_id}, function (err, usercount){ 

        if(usercount>0){

            follower
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
var getCountFollowing = function(req, res){

    var following_id = req.params.following_id;

    //validation for blank variables
    req.checkParams('following_id', 'User name is mandatory').notEmpty();

    var errors = req.validationErrors();

    if (errors) {
        // res.send('There have been validation errors: ' + util.inspect(errors), 400);
        res.status('400').json('There have been validation errors: ' + util.inspect(errors));
        return;
    }

    users
    .count({_id: following_id}, function (err, usercount){ 

        if(usercount>0){

            follower
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

var getMutualFollowerYouKnow = function(req, res){

	var user_id = req.params.user_id;
	var following_id = req.params.following_id;
	var count = 0;
	
	//validation for blank variables
    req.checkParams('user_id', 'User Id is mandatory').notEmpty();
    req.checkParams('following_id', 'Following Id is mandatory').notEmpty();

    var errors = req.validationErrors();

    if (errors) {
        // res.send('There have been validation errors: ' + util.inspect(errors), 400);
        res.status('400').json('There have been validation errors: ' + util.inspect(errors));
        return;
    }
	
	follower
	.find({$and:[{user_id:user_id},{follow_status:true}]},{_id:0})
	.select('following_id')
	.lean()
	.exec(function(err, followingIds){
		
		if (err)
			res.send(err);
			
		follower
		.find({$and:[{following_id:following_id},{follow_status:true}]},{_id:0})
		.populate('user_id')
		.select('user_id')
		.lean()
		.exec(function(err, followerIds){
			
			// console.log(typeof(followerIds));
			// console.log(followerIds);
			
			var item, items;
			var i = 0;
			var users = [];
			var id = []
			for(item in followingIds)
			{				
				for (items in followerIds)
				{					
					if(followingIds[item].following_id == followerIds[items].user_id._id)
					{
						count++;
						users[i] = followerIds[items].user_id.username;
						id[i] = followerIds[items].user_id._id;
						i++
					}	
				}
			  
			}
			
			res.json({
				// FollowingIds: followingIds,
				// FollowerIds: followerIds,
				users : users,
				id : id,
				count: count
			});
		
		})
		
	})

}

module.exports = ({
    setfollowing : setfollowing,
    getfollowing : getfollowing,
    getfollowers : getfollowers,
    unlink_following : unlink_following,
    getCountFollower : getCountFollower,
    getCountFollowing : getCountFollowing,
	getMutualFollowerYouKnow : getMutualFollowerYouKnow
})

