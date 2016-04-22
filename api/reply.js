var post_model = require('../app/models/post_model.js');
//case-1
/* User can reply on post
required param post id, userid, reply_user_id
*/
//case-2
/* User can reply on post reply*/

//update reply to post
var setreply =  function(req, res){

    var post_id = req.body.post_id;
    var user_id = req.body.user_id;   
    var ref_reply_id = req.body.ref_reply_id;
    var reply_msg = req.body.reply_msg; 

    //blank validation

    var post_reply = new post_model.reply({
        post_id : post_id,
        user_id : user_id,
        ref_reply_id : ref_reply_id,
        reply_msg : reply_msg,
    });

    post_reply
    .save(function(err) {
        if (err)
            res.send(err);

        res.json({
            message: 'Reply Inserted'
        });

    });

};

var getreply = function(req, res){

    var post_id = req.params.post_id;
    var reply_user_id = req.params.reply_user_id;

    // post_model.reply
    // .find({$and:[{reply_user_id : reply_user_id}, {post_id: post_id}]})
    // // .populate('reply_to')
    // // .deepPopulate('post_id reply_to')
    // .sort({created_at : -1})
    // .exec(function(err, result){
    //     if (err) {
    //         res.send(err)
    //     };
    //     console.info(result);

    //     res.json({
    //         reply: result
    //     })

    // })

    post_model.reply 
    .find({post_id : post_id})
    .populate('user_id')
    .sort({created_at : -1})
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