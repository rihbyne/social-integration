var user_final_followers_schema = require('../app/models/model.final_followers.js');
var express = require('express');
var router = express.Router();

var setblockuser = function(req, res) {

    var userId = req.body.userId;
    var followingId = req.body.followingId;
    var blockStatus = req.body.blockStatus;

    //Validation remaining

    user_final_followers_schema
        .find({
            $and: [{
                user_id: userId
            }, {
                following_id: followingId
            }]
        })
        .select('block')
        .exec(function(err, blcokresult) {
            if (err)
                res.send(err)
            	
            	console.info(blcokresult);

            	var blockStatus = (blcokresult[0].block == false) ? true : false;

            	user_final_followers_schema
            	.update({_id : blcokresult[0]._id}, {block: blockStatus})
            	.exec(function(err, result){

            		 if (err)
		                res.send(err)
		            	
		            	console.info(result);

            	})


        });

}

var getblockuser = function(req, res){

	var userId = req.params.userId;
    var blockStatus = req.params.blockStatus;

    //validation Remaining

    user_final_followers_schema
    .find({$and: [{user_id: userId}, {block: 'true'}]})
    .select('following_id')
    .exec(function(err, result){
    	if (err) {
    		res.send(err)
    	};
    	console.info(result);
    	res.json({
    		countOfBlockUsers: result.length,
    		listOfBlockUsers: result
    	})
    })

}

module.exports = ({
	setblockuser : setblockuser,
	getblockuser : getblockuser
});
