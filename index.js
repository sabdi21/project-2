// require modules
require('dotenv').config();
const express = require('express')
const flash = require('connect-flash')
const layouts = require('express-ejs-layouts')
const moment = require('moment');
const passport = require('./config/passportConfig')
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const helmet = require('helmet');
const db = require('./models')
const axios = require('axios');

//instantiates the express app
const app = express()

// set-up middleware
app.use(helmet())
app.set('view engine', 'ejs');
app.use(layouts);
app.use('/', express.static('static'))
app.use(express.urlencoded({ extended: false}));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true
}));
app.use(flash()); //flash needs to come after session
app.use(passport.initialize());
app.use(passport.session());

const sessionStore = new SequelizeStore({
    db: db.sequelize,
    expiration: 30 * 60 * 100
})

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: sessionStore
}));

//use this line once to set up the store table
sessionStore.sync()

// custom middlewear: write data to locals for every page
app.use((req, res, next) => {
    res.locals.alerts = req.flash();
    // it allows us to have access to currentUser variable to keep login persistent from page to page
    res.locals.currentUser = req.user
    res.locals.moment = moment;
    next();
})

app.get("/search", (req, res) => {
    res.render("search")
})


// referencing controllers 
app.use('/profile', require('./controllers/profile'))
app.use('/auth', require('./controllers/auth'))
app.use('/book', require('./controllers/book'))



//routes for home and error page
app.get('/', (req, res) => {
    const quoteURL = `https://icanhazdadjoke.com/`;
    axios.get(quoteURL, {
        method: 'GET',
        headers: {'Accept': 'application/json'}
    })
    .then(response => {
        console.log(response.data)
        //let jokeData = response.data
        // let array = jokeData.map(joke => {
        //     let jokes = joke.joke
        //     return {
        //         jokes
        //     }
        // })
        // console.log('this is the jokes array: ', array)
        // const jokeOne = response.data.joke[0]
       console.log('this is the response!:', response.data.joke);
       res.render('home', {joke: response.data.joke})
    })
    
})
app.post('/', (req, res) => {
    res
})


app.get('/*', (req, res) => {
    res.render('404')
})
app.listen(process.env.PORT || 7000, () => {
    console.log('server is now running on 7000 🐣')
});