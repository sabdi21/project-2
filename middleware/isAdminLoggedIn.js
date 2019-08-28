module.exports = (req, res, next) => {
    //if the user is logged in
    if(req.user && req.user.admin) {
        //cool, this is expected, they are logged in. allow them to proceed by calling NEXT
        next();
    }
    else if(req.user) {
        req.flash('error', 'Stop that! 🦉 do you think you are! You silly 🐭! You are NOT an admin! ')
        res.redirect('/profile');
    }
    else { //otherwise, user is not logged in
        //not cool, dont let them in
        req.flash('error', 'You must be logged in as an ADMIN to view this page!')
        res.redirect('/auth/login'); //send them back to login page
    }
}