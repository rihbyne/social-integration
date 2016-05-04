var post_model = require('../models/postSchema.js');

//Get all post
var gethashtag = function(req, res) { // get a post 
    console.log('Show all HashTag');

    // find the hashtag and check for errors
    post_model.post_hashtag.find(function(err, allhashtag) {

        if (err)
            res.send(err);

        res.json({
            posts: allhashtag
        });

    });

};

//Get Count of all hashtag
var allhashtagcount = function(req, res) { // get a post 

    console.log('Show count of all HashTag');

    // show count of post and check for errors
    post_model.post_hashtag.aggregate(
        {$group: 
         { _id: 0, count: { $sum: 1 } } 
    },function(err, allhashtag) {

        if (err)
            res.send(err);

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
        $group: 
            { _id: {
                hashtag: hashtagkeywd
                }, count: { 
        $sum: 1 
            } 
        } 
    },function(err, allhashtag) {

        if (err)
            res.send(err);

        res.json({
            posts: allhashtag
        });

    });

};


//Get all post
var gethashtaglist = function(req, res) { // get a post 
    console.log('Show all HashTag');

    // find the hashtag and check for errors
    post_model.trends.find().sort({count: -1}).limit(5).exec(function(err, result){

        console.log(result);

        if (err) {
            res.send(err);
        };

        res.json({
            message: result
        });

    });

};

//Get posts of hashtag
var gethashposts = function(req, res) { // get a post 

    console.log('Show posts of hashtag');

    var hashtag = req.params.hashtag;

    console.log('Hashtag : ', hashtag);
    // get the post and check for errors
    
    post_model.post_hashtag
    .find({
        hashtag: hashtag
    })
    .populate('post_id')
    .exec(function(err, hashs) {

        if (err)
            res.send(err);

        // res.json(hashs);
        console.log('Hashtag Result : \n', hashs);

        res.render('pages/hashtag', {
            hashtags : hashs,
            hashtagelement: hashtag
        });

    });

};

module.exports = ({
    gethashtag : gethashtag,
    allhashtagcount : allhashtagcount,
    hashtagcount : hashtagcount,
    gethashtaglist : gethashtaglist,
    gethashposts : gethashposts
})