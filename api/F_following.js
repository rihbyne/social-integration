var user_final_followers_schema = require('../app/models/model.final_followers.js');
var users = require('../model/User.js');

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

        }else{

        	var following_idModel = new user_final_followers_schema({
                user_id: user_id,
                following_id: following_id
            });

            following_idModel.save(function(err) {
                if (err)
                    res.send(err);
            });

            console.info('following_id saved');

            res.json({
                message: 'following_id saved'
            })
        }

    })

}