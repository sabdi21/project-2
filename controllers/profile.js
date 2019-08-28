const isLoggedIn = require('../middleware/isLoggedIn')
const isAdminLoggedIn = require('../middleware/isAdminLoggedIn')
const router = require('express').Router();

// Get /profile
router.get('/', isLoggedIn, (req, res) => {
    res.render('profile/index')
})

router.get('/admin', isAdminLoggedIn, (req, res) => {
    res.render('profile/admin')
})

module.exports = router;