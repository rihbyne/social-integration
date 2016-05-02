var post_model = require('../app/models/postSchema.js');
var async 	   = require('async');

//update reply to post
var setreply =  function(req, res){

    var post_type = req.body.post_type;
    var reply_user_id = req.body.reply_user_id;   
    var reply_msg = req.body.reply_msg; 
    var post_id = req.body.post_id;

    //blank validation
    if (post_type == 1) {//post

        var post_reply = new post_model.reply({
            post_id : post_id,
            reply_user_id : reply_user_id,
            reply_msg : reply_msg
        });

    }
    else if(post_type == 2){//retweet

        var post_reply = new post_model.reply({
            retweet_quote_id : post_id,
            reply_user_id : reply_user_id,
            reply_msg : reply_msg
        });

    }
    else{//reply

        var post_reply = new post_model.reply({
            reply_id : post_id,
            reply_user_id : reply_user_id,
            reply_msg : reply_msg
        });
        
    }

    post_reply
    .save(function(err) {
        if (err)
            res.send(err);

        res.json({
            message: 'Reply Inserted'
        });

    });

};

// var getreply = function(req, res){

    // var post_id = req.params.post_id;
    // var reply_user_id = req.params.reply_user_id;

    // post_model.reply 
    // .find({post_id : post_id})
    // .populate('user_id post_id')
    // .sort({created_at : -1})
    // .exec(function(err, result){
        // if (err) {
            // res.send(err)
        // };
        // console.info(result);

        // res.json({
            // reply: result
        // })

    // })

// }

var getReply = function(req, res){

	var type 	= req.params.type;
	var id 		= req.params.id;
	
	if(type==1 || type=='1')
	{
		var post_id = id;
		
		post_model.reply
		.find({post_id:post_id})
		.populate('post_id')
		.lean()
		.exec(function(err, postReplys){
		
			if(err)
			{ res.send(err); return;}
		
			if(postReplys=="" || postReplys==null || postReplys==undefined)
			{
				res.send('No Reply on this Post');
				return;
			}
			
			async.each(postReplys, function(singlepostReplys, callback){
				
				var reply_id = singlepostReplys._id
				
				post_model.reply
				.count({reply_id:reply_id})
				.lean()
				.exec(function(err, result){
					
					singlepostReplys.count = result;
					callback();
					
				})
				
			}, function(err){
			
				res.send(postReplys);
			
			})
			
		})
	}

	if(type==2 || type=='2')
	{
		var retweet_quote_id = id;
		
		console.log(retweet_quote_id);
		
		post_model.reply
		.find({retweet_quote_id:retweet_quote_id})
		.populate('retweet_quote')
		.lean()
		.exec(function(err, retweetReplys){

			console.log(retweetReplys);
		
			if(err)
			{ res.send(err); return;}
		
			if(retweetReplys=="" || retweetReplys==null || retweetReplys==undefined)
			{
				res.send('No Reply on this Retweet');
				return;
			}
			
			async.each(retweetReplys, function(singleretweetReplys, callback){
				
				var reply_id = singleretweetReplys._id
				
				post_model.reply
				.count({reply_id:reply_id})
				.lean()
				.exec(function(err, result){
					
					singleretweetReplys.count = result;
					callback();
					
				})
				
			}, function(err){
			
				res.send(retweetReplys);
			
			})
	
		})
	}
	
	if(type==3 || type=='3')
	{
		var reply_id = id;
		
		post_model.reply
		.find({reply_id:reply_id})
		.populate('reply')
		.lean()
		.exec(function(err, replyReplys){

			if(err)
			{ res.send(err); return;}
		
			if(replyReplys=="" || replyReplys==null || replyReplys==undefined)
			{
				res.send('No Reply on this Reply');
				return;
			}
			
			async.each(replyReplys, function(singlereplyReplys, callback){
				
				var reply_id = singlereplyReplys._id
				
				post_model.reply
				.count({reply_id:reply_id})
				.lean()
				.exec(function(err, result){
					
					singlereplyReplys.count = result;
					callback();
					
				})
				
			}, function(err){
			
				res.send(replyReplys);
			
			})
			
		})
	}

}

var deletereply = function(req, res){

    var reply_id = req.body.reply_id;  

    post_model.reply
    .findOneAndRemove({
        _id: reply_id
    })
    .exec(function(err, result) {
        if (err) {
            res.send(err);
        };

        if (result !== null) {

            console.info('Reply Deleted');

            res.json({
                message: 'Reply Deleted'
            });
        }
        else{

            console.info('No Reply Found');

            res.json({
                message: 'No Reply Found'
            });
        }
        
    });

};

module.exports = ({
    setreply : setreply,
    //getreply : getreply,
    deletereply : deletereply,
	getReply : getReply
})