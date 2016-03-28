var post_model = require('../model/post_model.js');
var express = require('express');
var router = express.Router(), // get an instance of the express Router
	User = require('../model/User.js');
//Get all post
module.exports.getpost = function(req, res) { // get a post 
    console.log('Show all post');

    // save the bear and check for errors
    post_model.post.find(function(err, allpost) {
        if (err)
            res.send(err);

        res.json({
            posts: allpost
        });
    });

};

//Get single post
module.exports.getsinglepost = function(req, res) { // get a post 
    console.log('Show single post');
    var post_title = req.params.post_title;
    console.log(post_title);
    // get the post and check for errors
    post_model.post.findOne({
        post_title: post_title
    }).exec(function(err, singlepost) {
        if (err)
            res.send(err);
        if (singlepost) {
            res.json({
                posts: singlepost
            });
        } else {
            res.json('No Post Found')
        }

    });

};

//Get posts of hashtag
module.exports.gethashposts = function(req, res) { // get a post 

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

        res.json(hashs);

    });


    // if (hashs) {

    //     var allposts = new Array();

    //     for (var i = 0; i < hashs.length; i++) {
    //         // console.log(hashs[i]['_id']);

    //         post_model.post_hashtag_links
    //             .find({
    //                 post_hashtag: hashs[i]['_id']
    //             })
    //             .populate('post_id')
    //             .exec(function(err, posts) {
    //                 // console.log(posts);
    //                 // res.json(posts);

    //                 allposts.push(posts);
    //                 console.log('After push In: \n', allposts);
    //             })

    //         console.log('After push Out: \n', allposts);

    //     };
    //     // console.log('All posts : ',allposts);

    // } else {
    //     res.json('No Post Found');
    // }
};

//Get all post
module.exports.getuserposts = function(req, res) { // get a post 
    
    console.log('Show all posts for single user');
    
    var username = req.params.user;   // find posts of user and check for errors

    console.log('user ',req.params.user);

    User
    .find({username: username})
    .populate('W_user_id')
    .exec(function(err, userposts) {

        if (err)
            res.send(err);

        res.json({
            posts: userposts
        });

    });

};

//Get single post of user
module.exports.getuserpost = function(req, res) { // get a post 

    console.log('Show single posts for single user');

    var post_id = req.params.post_id;
    var user = req.params.user;   // find posts of user and check for errors

    console.log('post_id', post_id);
    console.log('post_user', user);

    // find posts of user and check for errors
    post_model.post
    .find({
        _id: post_id
    })
    .exec(function(err, userposts) {
        if (err)
            res.send(err);

        res.json({
            posts: userposts
        });
    });

};

//Get all post
module.exports.gethashtag = function(req, res) { // get a post 
    console.log('Show all HashTag');

    // save the bear and check for errors
    post_model.post_hashtag.find(function(err, allhashtag) {

        if (err)
            res.send(err);

        res.json({
            posts: allhashtag
        });

    });

};

//Set post
module.exports.setpost = function(req, res) { // create a post 



	
	// var user = new User({
	//     first_name:"Sudeep",
	//     last_name:"makwana",
	//     email:"sudeep.makwana@gmail.com"
	// })
	// user.save();


    console.log('Add post');

    // var posted_by = req.body.posted_by; // get the post name (comes from the request)
	// var posted_by 		 = user._id; 					// get the post name (comes from the request)
	var posted_by 		 = "56f541b2c1574da8442b2b2c"; 					// get the post name (comes from the request)

    var post_title = req.body.post_title; // get the post name (comes from the request)
    var post_description = req.body.post_description; // get the post name (comes from the request)
    var post_links = req.body.post_links;

    var mentionusers = new Array();
    var hashtags = new Array();

    var regexat = /@([^\s]+)/g;
    var regexhash = /#([^\s]+)/g;

    while (match_at = regexat.exec(post_description)) {
        mentionusers.push(match_at[1]);
    }

    while (match_hash = regexhash.exec(post_description)) {
        hashtags.push(match_hash[1]);
    }

    console.log('Mention Users : ', mentionusers);
    console.log('Hash Tags : ', hashtags);

    var post = new post_model.post({
        posted_by: posted_by,
        post_title: post_title,
        post_description: post_description,
        created_at: Date.now(),
        last_update: Date.now()
    }); // create a new instance of the post model

    // save the post and check for errors
    post.save(function(err) {
        if (err)
            res.send(err);

        res.json({
            message: 'Post created!'
        });
    });

    if (typeof mentionusers != "undefined" && mentionusers != null && mentionusers.length > 0) {

        var post_mention = new post_model.post_mention({
            post_id: post.post_id,
            posted_by: posted_by,
            mention_users: mentionusers
        });

        post_mention.save(function(err) {
            if (err)
                res.send(err);
        });
    };
    if (typeof hashtags != "undefined" && hashtags != null && hashtags.length > 0) {
        myJson = {
            post_keyword: {}
        };
        for (var k = 0; k < hashtags.length; k++) {
            var objName = 'keyword' + k;
            var objValue = hashtags[k];
            myJson.post_keyword[objName] = objValue;
        }
        var post_hash = new post_model.Post_hashtag({
            post_id: post._id,
            hashtag: myJson
        });

		
        // post_hash.save();
        // console.log(post._id);
        // console.log("all hashtags in string " + hashtags);
        // console.log(post_hash);
    };
post_hash.save(function(err) {


			 // var Res_hashtag = "prashanttest";
			 // var query = post_hash.hashtag.find( { post_keyword: { $in : Res_hashtag } } );
		    // if (!err) {
		    //     post_model.post_hashtag.findOne({post_keyword: "INDIA/PAK"})
		    //         .populate('created_at')
		    //         .populate('post.post_description')
		    //         .exec(function(err, post_modelpost_hashtag) {
		    //                console.log(JSON.stringify(post_hashtag, null, "\t"))
		    //         })
		    // console.log('Data saved sucessfully')
		    // console.log(post_hash.hashtag);
		    // console.log(post_hash);
		    // }

			var p_data = post_model.Post_hashtag
			// p_data.find({post_id:post.post_id})
			// p_data.find({})
			p_data.find({post_id:"56f5307f9b985630100af6be"})
			.populate('post_id')
			.populate('post_mention')
			.exec(function (err, result_d) {
			  if (err) return handleError(err);
			  // console.log('The post_description is %s' + res);
			  // console.log('The post_description is %s' + post.post_description);
			  // console.log(result_d[0].post_id);
			})




		});


    if (typeof post_links != "undefined" && post_links != null && post_links.length > 0) {

        var post_url = new post_model.post_url({
            _id: post._id,
            post_url: post_links // posted by 
        });

        post_url.save(function(err) {
            if (err)
                res.send(err);
        });

    };

};

module.exports.setnewpost = function(req, res) { // create a post 

    console.log('Add post');

    var username   = req.body.username; // get the post name (comes from the request)
    var post_title = req.body.post_title; // get the post name (comes from the request)
    var post_description = req.body.post_description; // get the post name (comes from the request)
    var post_links = req.body.post_links;

    var mentionusers = new Array();
    var hashtags = new Array();

    var regexat = /@([^\s]+)/g;
    var regexhash = /#([^\s]+)/g;

    while (match_at = regexat.exec(post_description)) {
        mentionusers.push(match_at[1]);
    }

    while (match_hash = regexhash.exec(post_description)) {
        hashtags.push(match_hash[1]);
    }

    console.log('Mention Users : ', mentionusers);
    console.log('Hash Tags : ', hashtags);

    var post = new post_model.post({

        post_title: post_title,
        post_description: post_description,
        created_at: Date.now(),
        last_update: Date.now()

    }); // create a new instance of the post model

    function getuserid(username, data){

        User
            .find({username: username})
            .exec(function(err, userdata){

                if (err)
                    res.send(err);

                if (userdata == '') {
                    res.json({
                        message: 'User not found'
                    });
                    return;
                };

                var data = userdata[0].first_name;
                return data;

                console.log(data);
            });

    }

    getuserid(username, function(data){
        console.log('getuserid', data);
        post.posted_by = data;

    });
    
    // save the post and check for errors
    post.save(function(err) {

        if (err)
            res.send(err);

        res.json({
            message: 'Post created!'
        });

    });

    if (typeof mentionusers != "undefined" && mentionusers != null && mentionusers.length > 0) {

        var mention_users = new Array();

        for(var i = 0; i < mentionusers.length; i++) {

          mention_users[i] = mentionusers[i];    

        }

        console.log(mention_users);

        var post_mention = new post_model.post_mention({
            post_id: post._id,
            posted_by: post.posted_by,
            mention_users: mention_users
        });

        post_mention.save(function(err) {
            if (err)
                res.send(err);
        });

    };

    if (typeof hashtags != "undefined" && hashtags != null && hashtags.length > 0) {

        var hashtagkd = new Array();

        for (var k = 0; k < hashtags.length; k++) {

           hashtagkd[k] = hashtags[k];

        }

        var post_hash = new post_model.post_hashtag({
            post_id: post._id,
            hashtag: hashtagkd
        });

        post_hash.save(function(err) {
            if (err)
                res.send(err);
        });

    };

    if (typeof post_links != "undefined" && post_links != null && post_links.length > 0) {

        var post_url = new post_model.post_url({
            _id: post._id,
            post_url: post_links // posted by 
        });

        post_url.save(function(err) {
            if (err)
                res.send(err);
        });

    };

};

module.exports.setuser = function(req, res){

    var W_user_id = req.body.W_user_id;
    var first_name = req.body.first_name;
    var last_name = req.body.last_name;
    var email = req.body.email;
    var username = req.body.username;

    var setuser = new User({
        W_user_id : W_user_id,
        first_name : first_name,
        last_name : last_name,
        email : email,
        username : username
    });

    setuser.save(function(err) {
        if (err)
            res.send(err);
        res.json({
            message: 'Users Inserted'
        });

    });

}

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
        if (mentionspost) {
            console.log(mentionspost);
            res.json({
                posts: mentionspost
            });
        } else {
            res.json('No Post Found')
        }
    });

};

//Get Count of all hashtag
module.exports.allhashtagcount = function(req, res) { // get a post 

    console.log('Show count of all HashTag');

    // show count of post and check for errors
    post_model.post_hashtag.aggregate(
        {$group: 
         { _id: {hashtag: 'koa'}, count: { $sum: 1 } } 
    },function(err, allhashtag) {

        if (err)
            res.send(err);

        res.json({
            posts: allhashtag
        });

    });

};

//Get Count of specified hashtag
module.exports.hashtagcount = function(req, res) { // get a post 

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