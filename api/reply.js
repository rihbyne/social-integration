var post_model = require('../model/post_model.js');

//update reply to post
var setreply =  function(req, res){

    var post_id = req.body.post_id;
    var posted_by = req.body.posted_by;
    var username = req.body.username; 
    var post_description = req.body.post_description;

    //blank validation

    var post_reply = {
        posted_by : posted_by,
        username : username,
        post_description : post_description
    }

    post_model.post
    .findOneAndUpdate({_id: post_id}, {$push: {"post_reply": post_reply}}, {setDefaultsOnInsert: true})
    .exec(function(err, result){
        if (err) {
            res.send(err)
        };
        console.info(result);
        res.json({
            replyUserDetails: result
        })
    });

};

var getreply = function(req, res){

    var postId = req.params.postId;

    post_model.post
    .find({_id : postId})
    .select('post_reply')
    .sort({reply_from : 1})
    .exec(function(err, result){
        if (err) {
            res.send(err)
        };
        console.info(result);

        res.json({
            reply: result
        })

    })
}

module.exports = ({
    setreply : setreply,
    getreply : getreply
});