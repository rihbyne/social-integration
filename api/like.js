var postSchema 	= require('../app/models/postSchema.js');		// Including PostSchema File

//Set Post Like
var setlike = function(req, res) {

    var post_id 		= req.body.post_id;
    var like_user_id 	= req.body.like_user_id;

    console.log('Like Api hitted');
    console.log('Post Id: ', post_id);
    console.log('Like User Id: ', like_user_id);

    /*This case will run for the second case -- To remove like*/
    postSchema.post_like
    .find({ post_id: post_id, like_user_id: like_user_id })
	.lean()
    .exec(function(err, likedata) {

        if (likedata.length !== 0) {

            console.log('Make it unlike.');

            postSchema.post_like
            .findOneAndRemove({$and:[{post_id : post_id}, {like_user_id : like_user_id}]})
            .lean()
            .exec(function(err, result) {

                if (err) {
                    res.send(err);
                    return;
                };

                console.log('Like document removed / Undo like', result);
            })
  
        } 
        else {
            /*This case will run for the first time -- To set like*/

            var likeModel = new post_model.post_like({
                post_id: post_id,
                like_user_id: like_user_id
            });

            likeModel.save(function(err) {

                if (err)
                    res.send(err);

                console.log('Post like');

                // res.json({
                //     message: 'User like'
                // });                

            });

        }

        setlikecount(post_id, post_type, function(){
            res.redirect('about');
        })

    });
    
}

var getLikeByPost = function(req, res) { //get new like

    var post_id = req.params.post_id;

    post_model
    .post_like
    .find({post_id: post_id})
    .exec(function(err, postLikeResult){

        console.info(postLikeResult.length+ '\n' +postLikeResult);

        res.json({
            count: postLikeResult.length,
            likeinfo :postLikeResult
        })

    });

}

var getLikeByUser = function(req, res) { //get new like

    var user_id = req.params.user_id;

    post_model
    .post_like
    .find({like_user_id: user_id})
    .populate('post_id')
    .exec(function(err, userlikeResult){

        console.info(userlikeResult.length+ '\n' +userlikeResult);

        if (err) {
            res.send(err);
        };

        res.json({
            count: userlikeResult.length,
            result : userlikeResult
        })

    });

}

//update count of like in post
var setlikecount = function(post_id, post_type, res){

    post_model.post_like
    .count({post_id: post_id})
    .lean()
    .exec(function(err, postLikeCount){
        
        if (post_type == 1) {
            post_model.post
            .findOneAndUpdate({_id: post_id}, {like_count: postLikeCount})
            .exec(function(err, postUpdateResult) {

                if (err)
                    res.send(err);

                // console.log(postUpdateResult); 

                res(null, postUpdateResult)

            });
        }
        // else if(post_type == 2){
        //     post_model.retweet
        //     .findOneAndUpdate({_id: post_id}, {like_count: postLikeCount})
        //     .exec(function(err, postUpdateResult) {

        //         if (err)
        //             res.send(err);

        //         // console.log(postUpdateResult); 

        //         res(null, postUpdateResult)

        //     });
        // }
        else{
            post_model.reply
            .findOneAndUpdate({_id: post_id}, {like_count: postLikeCount})
            .exec(function(err, postUpdateResult) {

                if (err)
                    res.send(err);

                // console.log(postUpdateResult); 

                res(null, postUpdateResult)

            });

        }
        

    });

}

module.exports = ({
    getLikeByUser : getLikeByUser,
    getLikeByPost : getLikeByPost,
    setlike       : setlike,
    setlikecount : setlikecount
})