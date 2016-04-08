var notification        = require('../api/notification.js');  
var mailer              = require('../api/mail.js');                     // Mail Functionality
var post                = require('../api/post.js');  
var mention                = require('../api/mention.js');  

// app/routes.js
module.exports = function(app, passport) {


app.post('/secure/sendVerificationEmail', notification.sendVerificationEmail);
app.post('/secure/sendforgotpassword', notification.sendforgotpassword);
app.post('/secure/changePassEmail', notification.changePassEmail);
app.post('/secure/resettedConfirmation', notification.resettedConfirmation);
app.post('/secure/sendMail', mailer.sendPHPmail);
app.post('/secure/getNotificationStatus', mailer.getNotificationStatus);



// user preferance page 
app.get('/user_preferance', function(req, res) {
    res.render('pages/user_preferance');
});

app.get('/', isLoggedIn, function(req, res) {
    // save the bear and check for errors
    var drinks = [
        { name: 'Bloody Mary', drunkness: 3 },
        { name: 'Martini', drunkness: 5 },
        { name: 'Scotch', drunkness: 10 }
    ];
    var tagline = "Any code of your own that you haven't looked at for six or more months might as well have been written by someone else.";

    res.render('pages/index', {
        drinks: drinks,
        tagline: tagline,
         user : req.user,
    });

});


// // profile
// app.get('/profile', function(req, res) {
//     res.render('pages/profile');
// });

// mention
app.get('/mention/:mention_user', mention.getmentionuser);

// hashtag
app.get('/hashtag/:hashtag',post.gethashposts);

// // login
// app.get('/login', function(req, res) {
//     res.render('pages/login');
// });

// register
// app.get('/signup', function(req, res) {
//     res.render('pages/signup');
// });


app.get('/secure/getpost', post.getpost); 									// Get all post

app.get('/secure/getpost/post/:post_title', post.getsinglepost); 			// Get post by post title

app.get('/secure/getpost/:user', post.getuserposts); 						// Get post by username
app.get('/secure/getpost/count/:user', post.getuserpostcount); 				// Get post count by username
app.get('/secure/getpost/:user/:post_id', post.getuserpost); 				// Get single post of user

app.get('/secure/getpost/user/mention/:mention_user', mention.getmentionuser); // Get post of user by mention user

app.get('/secure/hashtag/count', post.allhashtagcount); 			    	// Get the count of all hashtag
app.get('/secure/hashtag/count/:hashtag', post.hashtagcount); 			 	// Get the count of specifiedhashtag
app.post('/secure/hashtags', post.gethashtag); 								// Get all hashtag keyword 		
app.post('/secure/gethashtaglist', post.gethashtaglist);                              // Get all hashtag keyword          
	
app.get('/secure/hashtags/:hashtag', post.gethashposts);					// Get post from hashtag

app.post('/secure/setuser', post.setuser); 									// Set new user 
app.post('/secure/setnewpost', post.setnewpost); 							// Set new post
app.post('/secure/setretweet', post.setretweet); 							// Set new user 

app.post('/secure/setuser', post.setuser);                                  // Set new user 
app.post('/secure/setnewpost', post.setnewpost);                            // Set new post
app.post('/secure/setretweet', post.setretweet);                            // Set new user 
app.post('/secure/setlike', post.setlike);                       // Set like

// about page 
app.get('/about',isLoggedIn, post.getuserdetails);

    app.get('/api/Trendsdk' , post.Trendsdk);
  


    // =====================================
    // LOGIN ===============================
    // =====================================
    // show the login form
    app.get('/login', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('pages/login', { message: req.flash('loginMessage') }); 
    });

    // process the login form
    // app.post('/login', do all our passport stuff here);
  // process the login form
    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));


    // =====================================
    // SIGNUP ==============================
    // =====================================
    // show the signup form
    app.get('/signup', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('pages/signup.ejs', { message: req.flash('signupMessage') });
    });


   // process the signup form
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/signup', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    // =====================================
    // PROFILE SECTION =====================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    app.get('/profile', isLoggedIn, post.Trendsdk , function(req, res) {
        res.render('pages/profile.ejs', {
            user : req.user // get the user out of session and pass to template
        });
    });

    // =====================================
    // LOGOUT ==============================
    // =====================================+
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/login');
    });




};
// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/login');
}