var post_model = require('../models/postSchema.js');
var master = require('./master.js');

//Set retweet
var setretweet = function(req, res){

    var post_id = req.body.post_id;
    var post_type = req.body.post_type;
    var ret_user_id = req.body.ret_user_id;
    var retweet_type = req.body.retweet_type;
    var retweet_quote = req.body.retweet_quote;
    var collectionName, message, userIdFrom, query;

    console.log('Retweet Api hitted');

    console.log('Post Id', post_id);
    console.log('Retweet User Id', ret_user_id);
    console.log('Retweet Type', retweet_type);

    req.checkBody('post_type', 'post type').notEmpty();
    req.checkBody('ret_user_id', 'ret_user_id').notEmpty();
    req.checkBody('retweet_type', 'retweet_type').notEmpty();
    req.checkBody('post_id', 'post id').notEmpty();

    var errors = req.validationErrors();

    if (errors) {
        // res.send('There have been validation errors: ' + util.inspect(errors), 400);
        res.status('400').json('There have been validation errors: ' + util.inspect(errors));
        return;
    }

    if(post_type == 1){ //if post

        collectionName = post_model.post;
        userIdFrom = 'posted_by';              
        message = 'User retweeted on Post';
        query = {post_id: post_id, ret_user_id: ret_user_id};

    }
    else if(post_type == 2){ //if retweet

        // if (retweet_type == 1){ //simple retweet
        //     collectionName = post_model.retweet;
        // }
        // else if(retweet_type == 2){
            collectionName = post_model.retweet_quote;
            message = 'User retweeted On Retweet'; 
            query = {retweet_quote_id: post_id, ret_user_id: ret_user_id};
        // }

        var userIdFrom = 'ret_user_id'; 
    }
    else if(post_type == 3){ //if reply        

        collectionName = post_model.reply;
        userIdFrom = 'reply_user_id';
        message = 'User retweeted On Reply';
        query = {reply_id: post_id, ret_user_id: ret_user_id};
    }

    collectionName
    .find({
        _id: post_id
    })
    .lean()
    .exec(function(err, retweetResult){

        if (err) {
            res.send(err);
            return;
        }

        if (retweetResult.length !== 0) {


            if(post_type == 1){ //if post

                var retweetUser = retweetResult[0].posted_by;

            }
            else if(post_type == 2){ //if retweet

                if (retweet_type == 1){ //simple retweet
                    var retweetUser = retweetResult[0].ret_user_id;
                }
                else if(retweet_type == 2){
                    var retweetUser = retweetResult[0].ret_user_id;

                }

            }
            else if(post_type == 3){ //if reply        

                var retweetUser = retweetResult[0].reply_user_id;

            }

            if (retweetUser !== ret_user_id){

                if (retweet_type == 1){ //simple retweet

                    post_model.retweet
                    .find(query)
                    .lean()
                    .exec(function(err, simpleRetweet){

                        if (simpleRetweet.length == 0) { //save new tweet

                            if (post_type == 1) {

                                var retweet = new post_model.retweet({

                                    post_id: post_id,
                                    ret_user_id: ret_user_id
                                });

                            }
                            else if(post_type == 2){

                                var retweet = new post_model.retweet({

                                    retweet_quote_id: post_id,
                                    ret_user_id: ret_user_id
                                });

                            }
                            else if(post_type == 3){

                                var retweet = new post_model.retweet({

                                    reply_id: post_id,
                                    ret_user_id: ret_user_id
                                });

                            }
                            

                            retweet.save(function(err) {

                                if (err)
                                    res.send(err);
                                
                                setretweetcount(post_id, post_type, collectionName, function(){

                                    console.info(message);
                                    
                                    res.json({
                                        message: message
                                    });

                                });
                                
                            });

                        }
                        else{//remove old simple retweet

                            post_model.retweet
                            .remove(query)
                            .exec(function(err, result){
                                
                                if (err) {
                                    res.send(err)
                                    return;
                                }

                                setretweetcount(post_id, post_type, collectionName, function(){

                                    console.log('Retweet document removed');

                                    res.json({
                                        message: 'Remove tweet'
                                    });
                                    
                                });

                            })

                        }

                    })

                }
                else if(retweet_type == 2){//quote retweet

                    var mentionusers = new Array();
                    var hashtags = new Array();

                    var regexat = /@([^\s]+)/g;
                    var regexhash = /#([^\s]+)/g;

                    req.checkBody('retweet_quote', 'Can not post empty tweet').notEmpty();

                    var errors = req.validationErrors();

                    if (errors) {
                        // res.send('There have been validation errors: ' + util.inspect(errors), 400);
                        res.status('400').json('There have been validation errors: ' + util.inspect(errors));
                        return;
                    }

                    while (match_at = regexat.exec(retweet_quote)) {
                        mentionusers.push(match_at[1]);
                    }

                    while (match_hash = regexhash.exec(retweet_quote)) {
                        hashtags.push(match_hash[1]);
                    }

                    // while (match_url = regexat.exec(post_description)) {
                    //     urls.push(match_url[1]);
                    // }

                    console.log('Mention Users : ', mentionusers);
                    console.log('Hash Tags : ', hashtags);

                        if(post_type == 1){ //if post

                            var retweet = new post_model.retweet_quote({

                                post_id: post_id,
                                ret_user_id: ret_user_id,
                                retweet_quote: retweet_quote

                            });
                        
                        }
                        else if(post_type == 2){ //if retweet

                            if(retweet_type == 2){

                                var retweet = new post_model.retweet_quote({

                                    retweet_quote_id: post_id,
                                    ret_user_id: ret_user_id,
                                    retweet_quote: retweet_quote
                                    
                                });

                            }

                        }
                        else if(post_type == 3){ //if reply        

                            var retweet = new post_model.retweet_quote({

                                reply_id: post_id,
                                ret_user_id: ret_user_id,
                                retweet_quote: retweet_quote
                                
                            });

                        }

                        retweet.save(function(err) {

                            if (err)
                                res.send(err);
                            
                                console.info(message);
                                
                                master.hashtagMention(2, retweet, mentionusers, hashtags, function(err, result){

                                    if (err) {
                                        res.send(err)
                                    };
                                    
                                    res.json({
                                        message: message
                                    });

                                    console.log('post created.');

                                });                           
                                
                            
                        });

                }                

            }
            else{

                console.log('You can not RE-tweet on your own post');

                res.json({
                    message: 'You can not RE-tweet on your own post'
                });

            } 

        }
        else{

            console.log('No Post Found');

            res.json({
                Result : 'No Post Found'
            })

        }

    })

}

//Get Retweets of single post
var getretweet = function(req, res) { 

    var post_id = req.params.post_id;
    var post_type = req.params.post_type;
    var query;

    if(post_type == 1){
        var query = {post_id: post_id}
    }
    else if(post_type == 2){
        var query = {retweet_quote_id: post_id}
    }
    else if(post_type == 3){
        var query = {reply_id: post_id}
    }
    else{
        console.info('wrong post type');
        res.json({
            Result : 'No post_type found'
        })
        return;
    }

    post_model.retweet
    .find(query)
    .select('ret_user_id')
    .populate('ret_user_id')
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
            retweetinfo :getRetweetResult
        })

    });

}

//update count of retweet in post
var setretweetcount = function(post_id, post_type, collectionName, res){

    var query;

    if (post_type == 1) {
        query = {post_id : post_id}
    }
    else if(post_type == 2){
        query = {retweet_quote_id : post_id}
    }
    else if(post_type == 3){
        query = {reply_id : post_id}
    }
    else{
        console.info('collectionName is blank');
        return;
    }

    if (collectionName !== '') {
      
        post_model.retweet
        .count(query)
        .lean()
        .exec(function(err, retweetCount){

            collectionName
            .findOneAndUpdate({_id: post_id}, {retweet_count: retweetCount})
            .exec(function(err, postUpdateResult) {

                if (err)
                    res.send(err);

                console.log(postUpdateResult); 

                res(null, postUpdateResult)

            });     

        });
    }
    
}


var deleteRetweet = function(req, res){

	var retweet_quote_id = req.body.retweet_quote_id;
	
    
	post_model.retweet_quote
	.findOneAndRemove({_id: retweet_quote_id})
	.lean()
	.exec(function(err, result){
		
		if(err)
		{
			res.send(err);
			return;
		}
			
		if(result==null || result == undefined || result=="")
		{
			console.log('No Retweet Found');
			res.send('No Retweet Found');
			return;
		}
		
		else
		{
			console.log('Reply Deleted');
			res.send('Retweet Deleted Successfully');
		}
		
	})

}


module.exports = {
    getretweet : getretweet,
    setretweet : setretweet,
	deleteRetweet : deleteRetweet
}