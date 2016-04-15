    

    // var finalObj = new Array;
    // var finalObj1;

    //find id of user from user collection
    user
    .find({
        username: username
    })
    .exec(function(err, userdata) {

        if (err)
            res.send(err);

        else if (userdata.length !== 0) {

            userid = userdata[0]._id;
            // console.log(userid);
            getUserId(userid, function(err, result){

                if (err) {

                    console.error(result);

                    res.json({
                        message: result
                    });
                    return;

                };

                console.info(result);

                //check tweet count if not zero then proceed
                if (result[0].tweet_count !== 0) {

                    tweet_count = result[0].tweet_count;

                    // getMyretweet(tweet_count, function(err, result){

                        post_model.post_retweet
                        .find({
                            ret_user_id: userid
                        }, {
                            _id: 0
                        })
                        .select('post_id')
                        .populate('post_id')
                        .sort({
                            retweet_at: -1
                        })
                        .limit(10)
                        .exec(function(err, retweetpostids) {

                            async.each(retweetpostids,
                               
                                function(retweetpostid, callback) {

                                    finalObj.push(retweetpostid['post_id'])
                                    
                                },
                                // 3rd param is the function to call when everything's done
                                function(err) {
                                    // All tasks are done now
                                }
                            );

                            var finalObj1 = result.concat(finalObj);

                            console.info('\n\n', finalObj1);
                            // sortOut(finalObj1, function(){

                                // var finalObjResult = JSON.stringify(finalObjResult);

                                // console.info('\n\n', finalObjResult);

                            // })
                                                   
                               res.json({
                                posts: finalObj1
                            });

                        })

                    // });

                }

                res.json({
                    message: result
                });

            })
            

        } else {
            res.json({
                message: 'No user found'
            })
        }

    }); 

};