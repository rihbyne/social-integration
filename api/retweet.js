var post_model = require('../app/models/postSchema.js');

//Set retweet
var setretweet = function(req, res){

    var post_id = req.body.post_id;
    var post_type = req.body.post_type;
    var ret_user_id = req.body.ret_user_id;
    var retweet_type = req.body.retweet_type;
    var retweet_quote = req.body.retweet_quote;

    console.log('Retweet Api hitted');

    console.log('Post Id', req.body.post_id);
    console.log('Retweet User Id', req.body.ret_user_id);
    console.log('Retweet Type', req.body.retweet_type);

    if(post_type == 1){ //if post

        var collectionName = post_model.post;
        var userIdFrom = 'posted_by';              
        var message = 'User retweeted on Post';

    }
    else if(post_type == 2){ //if retweet

        if (retweet_type == 1){ //simple retweet
            var collectionName = post_model.retweet;
        }
        else if(retweet_type == 2){
            var collectionName = post_model.retweet_quote;
            var message = 'User retweeted On Retweet'; 
        }

        var userIdFrom = 'ret_user_id'; 
    }
    else if(post_type == 3){ //if reply        

        var collectionName = post_model.reply;
        var userIdFrom = 'reply_user_id';
        var message = 'User retweeted On Reply';
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
        };

        if (retweetResult.length !== 0) {


                if(post_type == 1){ //if post

                    var retweetUser = retweetResult[0].posted_by
                }
                else if(post_type == 2){ //if retweet

                    if (retweet_type == 1){ //simple retweet
                        var retweetUser = retweetResult[0].ret_user_id
                    }
                    else if(retweet_type == 2){
                        var retweetUser = retweetResult[0].ret_user_id
                    }

                }
                else if(post_type == 3){ //if reply        

                    var retweetUser = retweetResult[0].reply_user_id
                }


            // console.info(userIdFrom);
            // return;
            if (retweetUser !== ret_user_id) {

                if (retweet_type == 1){ //simple retweet

                    post_model.retweet
                    .find({post_id: post_id, ret_user_id: ret_user_id})
                    .lean()
                    .exec(function(err, simpleRetweet){

                        if (simpleRetweet.length == 0) { //save new tweet

                            var retweet = new post_model.retweet({

                                post_id: post_id,
                                ret_user_id: ret_user_id
                            });

                            retweet.save(function(err) {

                                if (err)
                                    res.send(err);
                                
                                setretweetcount(post_id, collectionName, function(){

                                    console.info(message);
                                    
                                    res.json({
                                        message: message
                                    });

                                });
                                
                            });

                        }
                        else{//remove old simple retweet

                            post_model.retweet
                            .remove({post_id: post_id, ret_user_id: ret_user_id})
                            .exec(function(err, result){
                                if (err) {
                                    res.send(err)
                                    return;
                                };

                                console.log('Retweet document removed');

                                res.json({
                                    message: 'Remove tweet'
                                });

                            })

                        }

                    })

                }
                else if(retweet_type == 2){//quote retweet

                    var retweet = new post_model.retweet_quote({

                        post_id: post_id,
                        ret_user_id: ret_user_id,
                        retweet_quote: retweet_quote
                    });

                    retweet.save(function(err) {

                        if (err)
                            res.send(err);
                        
                            console.info(message);
                            
                            res.json({
                                message: message
                            });
                        
                    });

                }                

            }
            else{

                console.log('You can not RE-tweet on your own post');

                res.json({
                    message: 'You can not RE-tweet on your own post'
                });

                // res.redirect('about');

            } 

        }
        else{

            console.log('No Post Found');

            res.json({
                Result : 'No Post Found'
            })
            // res.redirect('about');
        }

    });

}

//Get Retweet
var getretweet = function(req, res) { //get new like

    var post_id = req.params.post_id;

    post_model
    .post_retweet
    .find({post_id: post_id})
    .exec(function(err, getRetweetResult){
        console.info(getRetweetResult.length);
        console.info(getRetweetResult);

        res.json({
            count: getRetweetResult.length,
            retweetinfo :getRetweetResult
        })

    });

}

//update count of retweet in post
var setretweetcount = function(post_id, collectionName, res){

    if (collectionName !== '') {
      
            post_model.retweet
            .count({post_id: post_id})
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
    else{
        console.info('collectionName is blank')
    }
    
}
module.exports = {
    getretweet : getretweet,
    setretweet : setretweet
}