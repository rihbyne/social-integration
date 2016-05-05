var postModel 	= require('../models/postSchema.js');		// Including postModel File
var async		= require('async');
var log = require('../../config/logging')()

//Set Post Like
var setLike = function(req, res) {

    var post_id 			= req.body.post_id;
    var retweet_quote_id 	= req.body.retweet_quote_id;
    var reply_id 			= req.body.reply_id;
    var like_user_id 		= req.body.like_user_id;
	var type				= req.body.type;

	if(type==1 || type=='1')	// Post Selected
	{
		// To Like or unlike Post (check whether it is already liked or not)
		postModel.post_like
		.find({ post_id: post_id, like_user_id: like_user_id })
		.lean()
		.exec(function(err, likedata) {

			// Post is Already liked by the same user
			if (likedata.length !== 0) 
			{
				console.log('Make it unlike.');

				postModel.post_like
				.findOneAndRemove({$and:[{post_id : post_id}, {like_user_id : like_user_id}]})
				.lean()
				.exec(function(err, result) {

					if (err) {
						res.send(err);
						return;
					};

					console.log('Post Unliked', result);
					log.info('Post Unliked Successfully');
					res.redirect('/')
				})
	  
			} 
			// Set Like for Post
			else  
			{	
				var likeModel = new postModel.post_like({
					post_id: post_id,
					like_user_id: like_user_id
				});

				likeModel.save(function(err) {

					if (err)
						res.send(err);

					console.log('Post Like');
					log.info('Post Liked Successfully');					
             		res.redirect('/')
				});

			}
			
			setLikeCount(post_id, 1, function(result){
				console.log(result);
			})
			
		})
	}	
	
	if(type==2 || type=='2')	// Retweet Selected
	{
		// To Like or unlike Retweet (check whether it is already liked or not)
		postModel.retweet_like
		.find({ retweet_quote_id: retweet_quote_id, like_user_id: like_user_id })
		.lean()
		.exec(function(err, likedata) {

			// Retweet is Already liked by the same user
			if (likedata.length !== 0) 
			{
				console.log('Make it unlike.');

				postModel.retweet_like
				.findOneAndRemove({$and:[{retweet_quote_id : retweet_quote_id}, {like_user_id : like_user_id}]})
				.lean()
				.exec(function(err, result) {

					if (err) {
						res.send(err);
						return;
					};

					console.log('Retweet Unliked', result);
					res.send('Retweet Unliked Successfully');
				})
	  
			} 
			// Set Like for Retweet
			else  
			{	
				var likeModel = new postModel.retweet_like({
					retweet_quote_id: retweet_quote_id,
					like_user_id: like_user_id
				});

				likeModel.save(function(err) {

					if (err)
						res.send(err);

					console.log('Retweet Like');   
					res.send('Retweet Liked Successfully');

				});

			}
			
			setLikeCount(retweet_quote_id, 2, function(result){
				console.log(result);
			})
			
		})
	}
	
	if(type==3 || type=='3')	// Reply Selected
	{
		// To Like or unlike Reply (check whether it is already liked or not)
		postModel.reply_like
		.find({ reply_id: reply_id, like_user_id: like_user_id })
		.lean()
		.exec(function(err, likedata) {

			// Reply is Already liked by the same user
			if (likedata.length !== 0) 
			{
				console.log('Make it unlike.');

				postModel.reply_like
				.findOneAndRemove({$and:[{reply_id : reply_id}, {like_user_id : like_user_id}]})
				.lean()
				.exec(function(err, result) {

					if (err) {
						res.send(err);
						return;
					};

					console.log('Reply Unliked', result);
					res.send('Reply Unliked Successfully');
				})
	  
			} 
			// Set Like for Reply
			else  
			{	
				var likeModel = new postModel.reply_like({
					reply_id: reply_id,
					like_user_id: like_user_id
				});

				likeModel.save(function(err) {

					if (err)
						res.send(err);

					console.log('Reply Like');       
					res.send('Reply Like Successfully');					

				});

			}
			
			setLikeCount(reply_id, 3, function(result){
				console.log(result);
			})
			
		})
	}
    
}

// Get Likes On Post
var getLikeByPost = function(req, res) { 

    var post_id = req.params.post_id;

    postModel.post_like
    .find({post_id: post_id})
    .exec(function(err, postLikeResult){

        console.info(postLikeResult.length+ '\n' +postLikeResult);

        res.json({
            count: postLikeResult.length,
            likeinfo :postLikeResult
        })

    });

}

// Get Likes On Retweet
var getLikeByRetweet = function(req, res) { 

    var retweet_quote_id = req.params.retweet_quote_id;

    postModel.retweet_like
    .find({retweet_quote_id: retweet_quote_id})
    .exec(function(err, retweetLikeResult){

        console.info(retweetLikeResult.length+ '\n' +retweetLikeResult);

        res.json({
            count: retweetLikeResult.length,
            likeinfo :retweetLikeResult
        })

    });

}

// Get Likes On Reply
var getLikeByReply = function(req, res) { 

    var reply_id = req.params.reply_id;

    postModel.reply_like
    .find({reply_id: reply_id})
    .exec(function(err, replyLikeResult){

        console.info(replyLikeResult.length+ '\n' +replyLikeResult);

        res.json({
            count: replyLikeResult.length,
            likeinfo :replyLikeResult
        })

    });

}

var getLikeByUser = function(req, res) { //get new like

    var user_id = req.params.user_id;

	async.parallel([
		
		postLike,
		retweetLike,
		replyLike
		
    ], function (err, results){

		var length =results.length;
		var count = 0;
		for(var i=0; i<length; i++)
		{
			count = count+ + +results[i].length;
		}

		var data ={result:results, count:count};
        res.send(data);

    });
	
	function postLike(callback)
	{
		postModel.post_like
		.find({like_user_id: user_id})
		.populate('post_id')
		.exec(function(err, userPostLikeResult){

			if (err) {
				res.send(err);
				return;
			};
			//console.log(userPostLikeResult);
			callback(null, userPostLikeResult);
			
		});
	}

	function retweetLike(callback)
	{
		postModel.retweet_like
		.find({like_user_id: user_id})
		.populate('retweet_quote_id')
		.exec(function(err, userRetweetLikeResult){

			if (err) {
				res.send(err);
				return;
			};
			
			callback(null, userRetweetLikeResult);
			
		});
	}
	
	function replyLike(callback)
	{
		postModel.reply_like
		.find({like_user_id: user_id})
		.populate('reply_id')
		.exec(function(err, userRetweetLikeResult){

			if (err) {
				res.send(err);
				return;
			};
			
			callback(null, userRetweetLikeResult);
			
		});
	}
	
}

// Update Count of likes For Post/Retweet/Reply
var setLikeCount = function(id, type, res){

	// For Post
	if(type==1 || type=='1')
	{
		postModel.post_like
		.count({post_id:id})
		.lean()
		.exec(function(err, postLikeCount){
		
			if(err)
				res.send(err);
				
			postModel.post
            .findOneAndUpdate({_id: id}, {like_count: postLikeCount})
			.exec(function(err, postUpdateResult){
			
				if (err)
                    res.send(err);

                res(postUpdateResult);
			
			})
		
		})
		
		return;
	}
	
	// For Retweet
	if(type==2 || type=='2')
	{
		postModel.retweet_like
		.count({retweet_quote_id:id})
		.lean()
		.exec(function(err, retweetLikeCount){
		
			if(err)
				res.send(err);
				
			postModel.retweet_quote
            .findOneAndUpdate({_id:id}, {like_count: retweetLikeCount})
			.exec(function(err, retweetUpdateResult){
			
				if (err)
                    res.send(err);

                res(retweetUpdateResult);
			
			})
		
		})
		
		return;
	}
	
	// For Reply
	if(type==3 || type=='3')
	{
		postModel.reply_like
		.count({reply_id:id})
		.lean()
		.exec(function(err, replyLikeCount){
		
			if(err)
				res.send(err);
				
			postModel.reply
            .findOneAndUpdate({_id:id}, {like_count: replyLikeCount})
			.exec(function(err, replytUpdateResult){
			
				if (err)
                    res.send(err);

                res(replytUpdateResult);
			
			})
		
		})
		
		return;
	}
}

//Get Retweets of single post
var getlike = function(req, res) { 

    var post_id = req.params.post_id;
    var post_type = req.params.post_type;
    var query, collectionName;

    if(post_type == 1){
    	collectionName = postModel.post_like;
        query = {post_id: post_id}
    }
    else if(post_type == 2){
    	collectionName = postModel.retweet_like;
        query = {retweet_quote_id: post_id}
    }
    else if(post_type == 3){
    	collectionName = postModel.reply_id;
        query = {reply_id: post_id}
    }
    else{
        console.info('wrong post type');
        res.json({
            Result : 'No post_type found'
        })
        return;
    }

    collectionName
    .find(query)
    .select('like_user_id')
    .populate('like_user_id')
    .lean()
    .exec(function(err, getRetweetResult){

        if (err) {
            res.send(err);
            return
        };

        console.info(getRetweetResult.length);
        console.info(getRetweetResult);

        res.json({
            count: getRetweetResult.length,
            likeinfo :getRetweetResult
        })

    });

}
module.exports = ({
	getlike 			: getlike,
    getLikeByUser 		: getLikeByUser,
    getLikeByPost 		: getLikeByPost,
    getLikeByRetweet 	: getLikeByRetweet,
    getLikeByReply 		: getLikeByReply,
    setLike       		: setLike,
    setLikeCount  		: setLikeCount
})