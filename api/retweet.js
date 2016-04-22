var post_model = require('../app/models/post_model.js');

//Set retweet
module.exports.setretweet = function(req, res , done) { //Create new user

    var post_id = req.body.post_id;
    var retweet_user_id = req.body.retweet_user_id;
    // var tweetstatus = req.body.tweetstatus;

    console.log('Retweet Api hitted');
    // console.log(req.body.tweetstatus);
    console.log(req.body.post_id);
    console.log(req.body.retweet_user_id);

    post_model.post_retweet.find({
        post_id: post_id,
        ret_user_id: retweet_user_id
    }).exec(function(err, retweetdata) {

        if (retweetdata.length !== 0) {

        //     return (null, false, req.flash('RTMessagetwise', 'You can not retweet twice for same post.'));
        // res.render('pages/about', {
        //     message: req.flash('RTMessagetwise')
        // });
            console.log('You can not retweet twice for same post');

            post_model.post_retweet
            .find({$and: [{post_id : post_id}, {retweet_user_id : retweet_user_id}]})
            .remove()
            .exec(err, function(err, result) {

                console.log('Retweet document removed');
               
                if (err) {
                    res.send(err);
                    return;
                };

                if (result !== '') {

                    post_model.post
                    .findByIdAndUpdate(post_id, {
                        $inc: {
                            tweet_count: -1
                        }
                    })
                    .exec(function(err, result) {

                        console.log('Retweet count decrease by 1', result);

                        if (err) {
                            res.send(err);
                        };

                    })
                
                }

            })

            return;
            // res.json({
            //     message: 'Remove tweet'
            // });

        } else {

            post_model.post.find({
                _id: post_id
            }).exec(function(err, postdata) {

                console.log('postdata', postdata);

                if (postdata.length !== 0) {

                    if (postdata[0].posted_by == retweet_user_id) {

                        console.log('You can not RE-tweet on your own post');
                        // return;                        
                          // return done(null, false, req.flash('RTMessageownpost', 'You can not tweet on your own post'));
                        res.redirect('about');

                    } 
                    else{

                        var retweet = new post_model.post_retweet({
                            post_id: post_id,
                            ret_user_id: retweet_user_id
                        });

                        retweet.save(function(err) {

                            if (err)
                                res.send(err);

                            post_model.post
                                .findByIdAndUpdate(post_id, {
                                    $inc: {
                                        tweet_count: 1
                                    }
                                })
                                .exec(function(err, result) {

                                    console.log('User retweeted\n', result);

                                    if (err) {
                                        res.send(err);
                                    };

                                })

                            res.json({
                                message: 'User retweeted'
                            });

                        });

                    }

                }

            });
        
        }

    })

}

//Get Retweet
module.exports.getretweet = function(req, res) { //get new like

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