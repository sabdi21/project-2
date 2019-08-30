const isLoggedIn = require('../middleware/isLoggedIn')
const isAdminLoggedIn = require('../middleware/isAdminLoggedIn')
const router = require('express').Router();
const db = require('../models')

// Get /profile
router.get('/', isLoggedIn, (req, res) => {
    res.render('profile/index')
})

router.get('/admin', isAdminLoggedIn, (req, res) => {
    res.render('profile/admin')
})

router.get('/edit', (req, res) => {
    res.render('profile/edit')
})

router.post('/edit', (req, res) => {
    const edits = req.body;
    db.user.update({
        username: edits.username,
        profile: edits.profile,
        bio: edits.bio 
    }, {where: {
        username: req.user.username,
        profile: req.user.profile,
        bio: req.user.bio
    }})
    .then(() => {
        res.redirect('/profile')
    })
    .catch(err => {
        console.log("ererererer", err)
    })
    
})

module.exports = router;