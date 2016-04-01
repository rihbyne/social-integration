// Packages
var mongoose = require('mongoose'); // For Mongoose 

// Build the connection string 
var dbURI = 'mongodb://localhost/social_network';

// Create the database connection 
mongoose.connect(dbURI);

var db_server = process.env.DB_ENV || 'primary';

// CONNECTION EVENTS
// When successfully connected
mongoose.connection.on('connected', function() {
    console.log('Mongoose default connection open to ' + dbURI);
    console.log("Connected to " + db_server + " DB!");
});

var conn = mongoose.connection;
// mongoose.connection.db.listCollections({name: 'test_coll'})
//     .next(function(err, collinfo) {
//         if (collinfo) {
//             // The collection exists
//             console.log(collinfo +'collection exists');
//         }
//     });

// [ { name: 'post_mentions', options: {} },
//  { name: 'users', options: {} },
//  { name: 'post_hashtags', options: {} },
//  { name: 'posts', options: {} } ]

conn.on('open', function() {
    conn.db.listCollections().toArray(function(err, names) {
        var jsonval = names;
        var hasMatch = false;
        for (var index = 0; index < jsonval.length; ++index) {
            var COL = jsonval[index];
            if (COL.name == "posts") {
                hasMatch = true;
                console.log('posts collectionss exists');
                break;
            }
                console.log('posts collectionss dosent  exists');
        }

        conn.close();

    });
});