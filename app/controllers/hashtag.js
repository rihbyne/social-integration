var post_model = require('../models/postSchema.js');
var hashtag_model = require('../models/hashtagSchema.js');
var log = require('../../config/logging')()

//Get all post
var gethashtag = function(req, res) { // get a post 
    console.log('Show all HashTag');

    // find the hashtag and check for errors
    post_model.post_hashtag
        .find(function(err, allhashtag) {

            if (err) {
                log.error(err);
                res.send(err);
            }

            res.json({
                posts: allhashtag
            });

        });

};

//Get Count of all hashtag
var allhashtagcount = function(req, res) { // get a post 

    console.log('Show count of all HashTag');

    // show count of post and check for errors
    post_model.post_hashtag.aggregate({
        $group: {
            _id: 0,
            count: {
                $sum: 1
            }
        }
    }, function(err, allhashtag) {

        if (err) {
            log.error(err);
            res.send(err);
        }

        res.json({
            posts: allhashtag
        });

    });

};

//Get Count of specified hashtag
var hashtagcount = function(req, res) { // get a post 

    console.log('Show count of HashTag');

    var hashtagkeywd = req.params.hashtag;
    // show count of post and check for errors
    post_model.post_hashtag.aggregate({
        $group: {
            _id: {
                hashtag: hashtagkeywd
            },
            count: {
                $sum: 1
            }
        }
    }, function(err, allhashtag) {

        if (err) {
            log.error(err);
            res.send(err);
        }

        res.json({
            posts: allhashtag
        });

    });

};


//Get all post
var gethashtaglist = function(req, res) { // get a post 
    console.log('Show all HashTag');

    // find the hashtag and check for errors
    post_model.trends.find().sort({
        count: -1
    }).limit(5).exec(function(err, result) {

        console.log(result);

        if (err) {
            log.error(err);
            res.send(err);
        }

        res.json({
            message: result
        });

    });

};

//Get posts of hashtag
var gethashposts = function(req, res) { // get a post 

    console.log('Show posts of hashtag');

    console.log('Hashtag : ', hashtag);

    var hashtag = req.params.hashtag;

    async.parallel([
            getPostByHashtagkd,
            getRetweetByHashtagkd,
            getReplyByHashtagkd
        ],
        function(err, result) {

            if (err) {

                if (result[0] === 0) {
                    console.info('Own posts are zero');
                    var hashtagePosts = result[1]
                }

                if (result[1] === 0) {
                    console.info('Retweet posts are zero');
                    var hashtagePosts = result[0]
                }

            } else {

                var hashtagePosts = result[0].concat(result[1]).concat(result[2]); //Got two result , concent two results
                function custom_sort(a, b) {
                    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                }

                hashtagePosts.sort(custom_sort);

            }

            res.json({
                hashtagePosts
            })

        }
    );

    function getPostByHashtagkd(callback) {

        var filterOptions = [{
            path: 'post_id'
        }, {
            path: 'post_id',
            populate: {
                path: 'posted_by'
            }
        }];

        // find by mention collection from post_mention and check for errors
        hashtag_model.post_hashtag
            .find({
                hashtag: hashtag
            })
            .select('post_id')
            .populate(filterOptions)
            .lean()
            .exec(function(err, hashtagpost) {

                if (err) {
                    log.error(err);
                    res.send(err);
                }

                if (hashtagpost.length !== '') {

                    // console.log(mentionspost);

                    callback(null, hashtagpost)
                    // res.json({
                    //     posts: mentionspost
                    // });

                } else {

                    callback(null, [])

                    // res.json('No Post Found')
                }

            });
    }

    function getRetweetByHashtagkd(callback) {

        var filterOptions = [{
            path: 'retweet_quote_id'
        }, {
            path: 'retweet_quote_id',
            populate: {
                path: 'ret_user_id'
            }
        }];

        // find by mention collection from post_mention and check for errors
        hashtag_model.retweet_quote_hashtag
            .find({
                hashtag: hashtag
            })
            .select('retweet_quote_id')
            .populate(filterOptions)
            .lean()
            .exec(function(err, hashtagpost) {

                if (err) {
                    log.error(err);
                    res.send(err);
                }

                if (hashtagpost.length !== '') {

                    callback(null, hashtagpost);

                    // res.json({
                    //     posts: mentionspost
                    // });

                } else {

                    callback(null, [])

                    // res.json('No Post Found')
                }

            });
    }

    function getReplyByHashtagkd(callback) {

        var filterOptions = [{
            path: 'reply_id'
        }, {
            path: 'reply_id',
            populate: {
                path: 'reply_user_id'
            }
        }];
        // find by mention collection from post_mention and check for errors
        hashtag_model.reply_hashtag
            .find({
                hashtag: hashtag
            })
            .select('reply_id')
            .populate(filterOptions)
            .lean()
            .exec(function(err, hashtagpost) {

                if (err) {
                    log.error(err);
                    res.send(err);
                }

                if (hashtagpost.length !== '') {

                    callback(null, hashtagpost)
                    log.info('hashtag post', 
                        hashtagpost)

                } else {

                    callback(null, []);
                    log.info('No Post Found');
                }

            });
    }

};

module.exports = ({
    gethashtag: gethashtag,
    allhashtagcount: allhashtagcount,
    hashtagcount: hashtagcount,
    gethashtaglist: gethashtaglist,
    gethashposts: gethashposts
})