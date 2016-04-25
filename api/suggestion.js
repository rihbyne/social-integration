var follower 	= require('../app/models/model_followers.js'),
    users 		= require('../app/models/user.js')
	util 		= require('util'),
	async		= require('async');
	
// var getSuggestion1 = function(req,res){

    // var user_id = req.params.user_id;
	
    // req.checkParams('user_id', 'User Id is mandatory').notEmpty();

    // var errors = req.validationErrors();

    // if (errors) {
        // res.status('400').json('There have been validation errors: ' + util.inspect(errors));
        // return;
    // }
	
	// follower
	// .find({$and:[{user_id : user_id},{follow_status:true}]})
	// .select('following_id')
	// .sort({"follower_since":-1})
	// .limit(3)
	// .exec(function(err, followingIds){
	
		// if(err)
			// res.send(err);
			
		// async.forEach(followingIds, function (item, cb) {
			
			// var followerId = item.following_id;
			
			// follower
			// .find({$and:[{user_id : followerId},{follow_status:true}]})
			// .select('following_id')
			// .sort({"follower_since":-1})
			// .limit(5)
			// .exec(function(err, suggestIds){
				
				// if(err)
				// res.send(err);
				
				// console.log(suggestIds);
				// cb();
			
			// })
		
		// })
		
	// })
// }
	
	
var getSuggestion = function(req, res){

	var user_id = req.params.user_id;
	
    req.checkParams('user_id', 'User Id is mandatory').notEmpty();

    var errors = req.validationErrors();

    if (errors) {
        res.status('400').json('There have been validation errors: ' + util.inspect(errors));
        return;
    }

	follower
	.find({$and:[{user_id : user_id},{follow_status:true}]},{_id:0})
	.select('following_id')
	.sort({"follower_since":-1})
	.limit(1)
	.exec(function(err, latestFollowed){
				
		if(err)
			res.send(err);
		
		follower
		.find({$and:[{user_id : latestFollowed[0].following_id},{follow_status:true}]},{_id:0})
		.select('following_id')
		.sort({"follower_since":-1})
		.exec(function(err, followingIds){
			
			if(err)
				res.send(err);	
						
			console.log(followingIds);
		
		})
	})
}	
	
var randomSuggestion = function(req, res){

	follower
	.aggregate([
		{ $group : { "_id" : "$following_id", "follower_id" : { "$push" : "$user_id" }, "count" : { "$sum" : 1 } } },
		{ $sort: { count: -1 } }
	])
	.limit(6)
	.exec(function(err, result){
		
		if(err)
			res.send(err);
		
		users.populate(result, {"path" : "_id"}, function(err, results){
		
			if(err)
				res.send(err);
			
			res.send({Results:results})
		
		})
		
	})	
	
}
	
	
module.exports = ({
    getSuggestion : getSuggestion,
	randomSuggestion : randomSuggestion
})