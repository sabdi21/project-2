let router = require('express').Router()
const passport = require('../config/passportConfig')
let db = require('../models')


// routes for auth pages
router.get('/signup', (req, res) => {
    res.render('auth/signup');
})

router.post('/signup', (req, res, next) => {
    // console.log(req.body);
    if(req.body.password !== req.body.password_verify) {
        req.flash('error', 'Passwords do not match!');
        res.redirect('/auth/signup');
    } 
    else {
        // PASSWORDS MATECHEC, CREATE USER IF THEY DON'T ALREADY EXIST
        db.user.findOrCreate({
            where: { email: req.body.email },
            defaults: req.body
        })
        .spread((user, wasCreated) => {
            if(wasCreated) {
            // this was legit a new user
                passport.authenticate('local', {
                successRedirect: '/profile',
                successFlash: 'Successful sign up. Welcome',
                failureRedirect: '/auth/login',
                failureFlash: 'This should never happen. Contact your administrator'
            })(req, res, next);
            }
            else {
                // the user was found, don't let them create a new account. Make them log in
                req.flash('error', 'Account already exists. Please log in!')
                res.redirect('/auth/login')
            }
        })
        .catch(err => {
            //print all the error info to the console
            // console.log('Error in POST /auth/signup', err);

            //generic error for the flash message
            req.flash('error', 'something went awry!  ')

            //get validation-specific errors (okay to show to the user)
            if(err && err.errors) {
                err.errors.forEach(e => {
                    if(e.type === 'Validation error') {
                        req.flash('error', 'Validation issue - ' + e.message)
                    } 
                });
            }
            // redirect user back to the sign up page so they can try again
            res.redirect('/auth/signup');
        })
    }
})

router.get('/login', (req, res) => {
    res.render('auth/login');
})

router.post('/login', passport.authenticate('local', {
    successRedirect: '/profile',
    successFlash: 'Yay you logged in successfully!',
    failureRedirect: '/auth/login',
    failureFlash: 'Invalid Credentials!',
    
}));

router.get('/logout', (req, res) => {
    req.logout(); //deletes the user from req.user
    req.flash('success', 'Goodbye - See you next time!')
    res.redirect('/');
})

module.exports = router;