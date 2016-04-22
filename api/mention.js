var post_model = require('../app/models/post_model.js');

//Get mentionuser's post
module.exports.getmentionuser = function(req, res) { // get a post 
    console.log('Show mention user\'s post');

    var post_mention = req.params.mention_user;
    console.log(post_mention);
    // find by mention collection using populate and check for errors
    // post_model.post_mention
    // .find({
    //     mention_users: post_mention
    // })
    // .populate('post_id')
    // .exec(function(err, mentionspost) {
    //     if (err)
    //         res.send(err);
    //     if (mentionspost) {
    //         console.log(mentionspost);
    //         res.json({
    //             posts: mentionspost
    //         });
    //     } else {
    //         res.json('No Post Found')
    //     }
    // });

    //find by description from post collection
    post_model.post
    .find({
        post_description : new RegExp(post_mention, 'i')
    })
    .exec(function(err, mentionspost) {
        if (err)
            res.send(err);
        
        if (mentionspost.length !== 0) {
            console.log(mentionspost);
            // res.json({
            //     posts: mentionspost
            // });
            res.render('pages/mention', {
                posts: mentionspost
            });
        } else {
            res.json('No Post Found')
        }

    });

};