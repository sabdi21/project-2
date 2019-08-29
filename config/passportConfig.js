// require passport and any passport strategies we want to use
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

// we will need access to the database
const db = require('../models');

//provide serialization/deserialization functions for passport to use.
//this allows passport to store user by the id alone (serialize) and look
//up a user's full information from the id (deserialized function)

passport.serializeUser((user, callback) => {
    //callback function : first argument is an error message, second argument is the data is pass on...
    callback(null, user.id);
})

passport.deserializeUser((id, callback) => {
    db.user.findByPk(id) 
    .then(user => {
        callback(null, user);
    })
    .catch(callback)
})

//Implement strategies
//first argument is the object setting and the second is a callback function
passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
}, (typedInEmail, typedInPassword, callback) => {
    // console.log('1', typedInEmail, typedInPassword)
    // we are going to use the data information then
    //tries looking up the user by the email
    db.user.findOne({
        where: { email: typedInEmail }
    })
    .then(foundUser => {
        //console.log("got a user")
        //console.log(foundUser, 'this is the user')
        //if i did not find a user with that email -OR- 
        //If i did find the user but they dont have the correct password
        if(!foundUser || !foundUser.validPassword(typedInPassword)) {
            //BAD USER: returns null
            callback(null, null)
        }
        else{
            //Good user: return the user's data
            callback(null, foundUser);
        }
    })
    .catch(callback) //END OF USER FIND ONE CALL
}));
//include files using module.export
module.exports = passport;