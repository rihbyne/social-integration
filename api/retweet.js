var post_model = require('../app/models/postSchema.js');

//Set retweet
var setretweet = function(req, res , done) { 

    var post_id = req.body.post_id;
    var retweet_user_id = req.body.retweet_user_id;
    var post_type = req.body.post_type;
    var retweet_type = req.body.retweet_type;
    var retweet_quote = req.body.retweet_quote;

    console.log('Retweet Api hitted');

    console.log('Post Id', req.body.post_id);
    console.log('Retweet User Id', req.body.retweet_user_id);
    console.log('Post Type', req.body.post_type);

    if(post_type == 1){ //if post
        
        var collectionName = post_model.post;
        var userIdFrom = 'posted_by';              
        var message = 'User retweeted on Post';

    }
    else if(post_type == 2){ //if retweet

        var collectionName = post_model.post_retweet;
        var userIdFrom = 'ret_user_id';
        var message = 'User retweeted On Retweet';        

    }
    else if(post_type == 3){ //if reply

        var collectionName = post_model.reply;
        var userIdFrom = 'reply_user_id';
        var message = 'User retweeted On Reply';
    }

    post_model.post_retweet
    .find({
        post_id: post_id,
        ret_user_id: retweet_user_id,
        retweet_type : retweet_type
    })
    .exec(function(err, retweetdata) {

        if(((retweetdata.length == 0) && (retweet_type == 1)) || (retweet_type == 2)){
            
                collectionName
                .find({
                    _id: post_id
                })
                .lean()
                .exec(function(err, postdata) {
                    // console.log('postdata \n', postdata);

                    if (postdata.length !== 0) {

                        if (postdata[0].userIdFrom !== retweet_user_id) {

                            if (retweet_type == 1) { //simple retweet

                                var retweet = new post_model.post_retweet({
                                    post_id: post_id,
                                    ret_user_id: retweet_user_id,
                                    post_type : post_type,
                                    retweet_type : retweet_type

                                });

                            }
                            else if(retweet_type == 2) { // Quote retweet

                                var retweet = new post_model.post_retweet({
                                    post_id: post_id,
                                    ret_user_id: retweet_user_id,
                                    post_type : post_type,
                                    retweet_type : retweet_type,
                                    retweet_quote : retweet_quote
                                });
                                
                            };
                            
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
                        else{

                            console.log('You can not RE-tweet on your own post');
                            res.redirect('about');

                        } 

                    }
                    else{
                        console.log('No Post Found');
                        res.redirect('about');
                    }

                });

        }
        else{

            console.log('You can not retweet twice for same post');

            post_model.post_retweet
            .find({$and: [{post_id : post_id}, {ret_user_id : retweet_user_id}, {retweet_type: retweet_type}]})
            .remove()
            .exec(err, function(err, result) {
               
                if (err) {
                    res.send(err);
                    return;
                };

                setretweetcount(post_id, collectionName, function(){

                    console.log('Retweet document removed');

                    res.json({
                        message: 'Remove tweet'
                    });

                });
               
            })

        } 

    })

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

    if (collectionName) {

        post_model.post_retweet
        .count({post_id: post_id})
        .lean()
        .exec(function(err, postRetweetCount){

            collectionName
            .findOneAndUpdate({_id: post_id}, {retweet_count: postRetweetCount})
            .exec(function(err, postUpdateResult) {

                if (err)
                    res.send(err);

                // console.log(postUpdateResult); 

                res(null, postUpdateResult)

            });     

        });
    }
    
}
module.exports = {
    getretweet : getretweet,
    setretweet : setretweet
}