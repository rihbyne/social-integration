var post_model = require('../app/models/post_model.js');

//Set postlike
var setlike = function(req, res) { //Create new like

    var post_id = req.body.post_id;
    var like_user_id = req.body.like_user_id;
    // var likestatus = req.body.likestatus;  
    // var like_user_name= req.body.like_user_name;

    console.log('Like Api hitted');
    // console.log('Like Status: ', req.body.likestatus);
    console.log('Post Id: ', req.body.post_id);
    console.log('Like User Id: ', req.body.like_user_id);

    /*This case will run for the second time -- To remove like*/
    post_model.post_like.find({
        post_id: post_id,
        like_user_id: like_user_id
    }).exec(function(err, likedata) {

        if (likedata.length !== 0) {

            console.log('You can not like twice for same post');
            console.log('Make it unlike. changed like status');
            // res.json({
            //     message: 'You can not like twice for same post'
            // });
            post_model.post_like
            .find({$and: [{post_id : post_id}, {like_user_id : like_user_id}]})
            .remove()
            .exec(err, function(err, result) {

                console.log('Unlike document removed', result);
               
                if (err) {
                    res.send(err);
                    return;
                };

                if (result !== '') {

                    post_model.post
                    .findByIdAndUpdate(post_id, {
                        $inc: {
                            like_count: -1
                        }
                    })
                    .exec(function(err, result) {

                        console.log('Like count decrease by 1\n', result);
                       
                        if (err) {
                            res.send(err);
                            return;
                        };

                        // res.json({
                        //      message: 'Remove Like'
                        // });
                        // res.render('pages/about');

                        res.redirect('about');
                        
                    })
                    
                };

            })
  
        } 
        else{
        /*This case will run for the first time -- To set like*/
            post_model.post.find({
                _id: post_id
            }).exec(function(err, postdata) {

                console.log('postdata\n', postdata);
                console.log(postdata.length);
                if (postdata.length !== 0) {

                        // if (postdata[0].posted_by == like_user_id) {

                        //     console.log('You can not like on your own post');
                        //     return;
                        //     // res.json({
                        //     //     message: 'You can not retweet on your own post'
                        //     // });

                        // } else {


                    var likeModel = new post_model.post_like({
                        post_id: post_id,
                        like_user_id: like_user_id
                    });

                    likeModel.save(function(err) {

                        if (err)
                            res.send(err);
                        console.log('_id of like', likeModel._id);
                        post_model.post
                            .findByIdAndUpdate(post_id, {

                                $push: {"like_by_users": likeModel._id}
                                
                            })
                            .exec(function(err, result) {

                                console.log('New like added and modified like count \n', result);

                                if (err) {
                                    res.send(err);
                                };

                            })

                        // res.json({
                        //     message: 'User retweeted'
                        // });
                        // res.render('pages/about');
                        // req.route('pages/about');
                        res.redirect('about');

                    });

                }
                else{
                    console.info('No Post Found');
                }

            });
            

        }
    
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

module.exports = ({
    getLikeByUser : getLikeByUser,
    getLikeByPost : getLikeByPost,
    setlike       : setlike
})