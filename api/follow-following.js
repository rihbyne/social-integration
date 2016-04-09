var post_followers = require('../app/models/model.followers.js');
var users = require('../model/User.js');

var util = require('util');

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

        console.info(result[0]._id);

        // res.json({
        //     message: result
        // })

        if (result[0]._id) {

            post_followers
            .find({user: result[0]._id})
            .exec(function(err, result){
                console.info(result);
                res.json({
                    message: result
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
    post_followers.
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

        	var followerModel = new post_followers({
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

// module.exports.unlink_follower = function(req, res){

// console.info('Unlink');
    
//     var user_name = req.body.user_name;
//     var unlink_follower = req.body.unlink_follower;

//     post_followers
//     .find($and:[{user: user_id}, {follower: unlink_follower}])
//     .remove().exec(funtion(err, result));

//     console.info('Removed follower');
// }