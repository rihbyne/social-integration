var post_model = require('../app/models/postSchema.js');

//update reply to post
var setreply =  function(req, res){

    var post_id = req.body.post_id;
    var post_type = req.body.post_type;
    var reply_user_id = req.body.reply_user_id;   
    // var post_owner_id = req.body.post_owner_id;
    var ref_reply_id = req.body.ref_reply_id;
    var reply_msg = req.body.reply_msg; 

    //blank validation
    if (post_type == 1) {//post

        var post_reply = new post_model.reply({
            post_id : post_id,
            reply_user_id : reply_user_id,
            reply_msg : reply_msg
        });

    }
    else if(post_type == 2){//retweet

        var post_reply = new post_model.reply({
            retweet_quote_id : retweet_quote_id,
            reply_user_id : reply_user_id,
            reply_msg : reply_msg
        });

    }
    else{//reply

        var post_reply = new post_model.reply({
            reply_user_id : reply_user_id,
            reply_msg : reply_msg
        });
        
    }

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

    post_model.reply 
    .find({post_id : post_id})
    .populate('user_id post_id')
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

var deletereply = function(req, res){

    var reply_id = req.body.reply_id;  

    post_model.reply
    .findOneAndRemove({
        _id: reply_id
    })
    .exec(function(err, result) {
        if (err) {
            res.send(err);
        };

        if (result !== null) {

            console.info('Reply Deleted');

            res.json({
                message: 'Reply Deleted'
            });
        }
        else{

            console.info('No Reply Found');

            res.json({
                message: 'No Reply Found'
            });
        }
        
    });

};

module.exports = ({
    setreply : setreply,
    getreply : getreply,
    deletereply : deletereply
});