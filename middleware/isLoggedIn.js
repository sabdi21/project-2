module.exports = (req, res, next) => {
    //if the user is logged in
    if(req.user) {
        //cool, this is expected, they are logged in. allow them to proceed by calling NEXT
        next();
    }
    else { //otherwise, user is not logged in
        //not cool, dont let them in
        req.flash('error', 'You must be logged in to view this page!')
        res.redirect('/auth/login'); //send them back to login page
    }
}