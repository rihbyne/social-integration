var mention_model = require('../models/mentionSchema.js');
var async = require('async');

//Get mentionuser's post
var getmentionuser = function(req, res) { // get a post 

    console.log('Show mention user\'s post');

    var mention_user = req.params.mention_user;

    async.parallel([
        getPostByMentionUser,
        getRetweetByMentionUser,
        getReplyByMentionUser
        ],
        function(err, result){
            console.info(result);
            if (err) {

                if (result[0] === 0) {
                    console.info('Own posts are zero');
                    var mentionUserPosts = result[1]
                }

                if (result[1] === 0) {
                    console.info('Retweet posts are zero');
                    var mentionUserPosts = result[0]
                }

            }
            else{

                var mentionUserPosts = result[0].concat(result[1]).concat(result[2]);//Got two result , concent two results
                    
                    function custom_sort(a, b) {
                        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                    }

                mentionUserPosts.sort(custom_sort); 
                
                console.info(mentionUserPosts);
            }

            res.json({
                mentionUserPosts
            })  
                    
        }
    );

function getPostByMentionUser(callback){

    var optionFilter = [
        {path:'post_id', 
        populate:{path:'posted_by'}}
    ]
    // find by mention collection from post_mention and check for errors
    mention_model.post_mention
    .find({mention_users: mention_user})
    .select('post_id')
    .populate(optionFilter)
    .lean()
    .exec(function(err, mentionspost) {

        if (err)
            res.send(err);

        if (mentionspost.length !== '') {

            // console.log(mentionspost);

            callback(null, mentionspost)

        } else {

            callback(null, [])
        }

    });
}

function getRetweetByMentionUser(callback){
    console.info(mention_user);

    var filterOptions = [
        {path: 'retweet_quote_id'},
        {
          path: 'retweet_quote_id',
          populate: {path: 'ret_user_id'}
        }
    ]
    // find by mention collection from post_mention and check for errors
    mention_model.retweet_quote_mention
    .find({mention_users: mention_user})
    .select('retweet_quote_id')
    .populate(filterOptions)
    .lean()
    .exec(function(err, mentionspostdata) {

        if (err)
            res.send(err);

        if (mentionspostdata.length !== '') {

                callback(null, mentionspostdata);

        } else {

            callback(null, [])

        }

    });
}

function getReplyByMentionUser(callback){

    var filterOptions = [
        {path: 'reply_id'},
        {
          path: 'reply_id',
          populate: {path: 'reply_user_id'}
        }
    ];

    console.info(mention_user);
    // find by mention collection from post_mention and check for errors
    mention_model.reply_mention
    .find({mention_users: mention_user})
    .select('reply_id')
    .populate(filterOptions)
    .lean()
    .exec(function(err, mentionspost) {

        if (err)
            res.send(err);

        if (mentionspost.length !== '') {

            callback(null, mentionspost)

        } else {

            callback(null, [])

        }

    });
}

};

module.exports = ({
    getmentionuser : getmentionuser
})