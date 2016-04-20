var post_model = require('../model/post_model.js');

//update reply to post
var setreply =  function(req, res){

    var post_id = req.body.post_id;
    var user_id = req.body.user_id;   
    var reply_user_id = req.body.reply_user_id;
    var reply_msg = req.body.reply_msg; 

    //blank validation

    var post_reply = {
        post_id : post_id,
        user_id : user_id,
        reply_user_id : reply_user_id,
        reply_msg : reply_msg
    }

    post_model.reply
    .save(function(err) {
        if (err)
            res.send(err);

        res.json({
            message: 'Reply Inserted'
        });

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