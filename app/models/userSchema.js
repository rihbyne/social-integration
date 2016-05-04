var mongoose        = require('mongoose'); 
var bcrypt   		= require('bcrypt-nodejs');

// User Schema
var userSchema = mongoose.Schema({

    first_name  :   {type: String},          							// First Name of User
    last_name   :   {type: String},          							// Last Name of User
    email       :   {type: String},										// Email of User
    password     :  {type: String},										// Password of User		
    username    :   {type: String}										// Username of User
	
}, { versionKey: false });

// methods ======================
// generating a hash
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);