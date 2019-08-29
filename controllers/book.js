require('dotenv').config();
const router = require('express').Router();
const db = require('../models');
const methodOverride = require('method-override');
// const pg = require('pg');
const axios = require('axios');

router.use(methodOverride('_method'));

// //instantiates the express app
// // app.use('/', express.static('static'))
// app.use(express.urlencoded({ extended: false}));
// const client = new pg.Client(process.env.DATABASE_URL);
// console.log(client);

// if (request.body.title[1] === 'title') { url += `+intitle:${request.body.title[0]}`; }
// if (request.body.title[1] === 'author') { url += `+inauthor:${request.body.title[0]}`; }
// if (request.body.search[1] === 'genre') { url += `+subject:${request.body.search[0]}`; }


router.post("/result", (req, res) => {
    // const apiKey = process.env.BOOKS_API_KEY
    // const result = req.body.title
    // const url = `https://www.googleapis.com/books/v1/volumes?q=intitle:${result}&key=${apiKey}`


    const apiKey = process.env.BOOKS_API_KEY
    const baseUrl = `https://www.googleapis.com/books/v1/volumes?q=`;
    let result = req.body.search[0]
    let searchType = req.body.search[1] 
    let url ;

    if (req.body.search[1] === 'title') { url = `${baseUrl}+intitle:${searchType}&key=${apiKey }`; }
    if (req.body.search[1] === 'author') { url = `${baseUrl}+inauthor:${searchType}&key=${apiKey}`; }
    if (req.body.search[1] === 'genre') { url = `${baseUrl}+subject:${searchType}&key=${apiKey}`; }
 
    console.log(`THIS IS THE QUERY STRING: , ${url}`)
    
    axios.get(url)
    .then((response) => {
        var bookResult = response.data.items
        let bookInfo = bookResult.map(result => {
            const placeholderImage = 'https://i.imgur.com/J5LVHEL.jpg';
            let image_url = result.volumeInfo.imageLinks && result.volumeInfo.imageLinks.thumbnail ? result.volumeInfo.imageLinks.thumbnail : placeholderImage;
            let title = result.volumeInfo.title;
            let author = result.volumeInfo.authors || 'Author(s) not available';
            let description = result.volumeInfo.description || 'Summary not available';
            let preview = result.accessInfo.webReaderLink || 'not available';
            let isbnArray = result.volumeInfo.industryIdentifiers;
            let isbn;

            if( isbnArray ) {
                isbn = isbnArray[0].identifier
                // console.log(result.volumeInfo.industryIdentifiers[0].identifier || 'not available') 
            }
            else {
                isbn = 'not available'
            }
            return {
                title,
                author,
                description,
                image_url,
                preview,
                isbn
            }  
        })
        res.render("book/result", { 
            bookInfo
        })
    })
})


// send the favorites to new route
router.post("/favorites", (req, res) => {
    console.log('this is the request:', req.body)
    const user = req.user.id;
    const description = req.body.description.slice(0, 250)
    db.book.findOrCreate({
        where: {
            title: req.body.title,
            author: req.body.author,
            description: description,
            isbn: req.body.isbn,
            preview_link: req.body.preview,
            image_url: req.body.image_url,
            userId: user
                
        }
    }).then(() => {
        res.redirect("/book/favorites")
    }).catch(err => {
        console.log("ererererer", err)
    })
})

router.get("/favorites", (req, res) => {
    console.log("this is the userId: ", req.user.id)
    db.book.findAll({
        where: { userId: req.user.id}
    }).then(favorites => {
        res.render("book/favorites", {favorites: favorites})
    }).catch(err => {
        console.log("ererererer", err)
    })
})

router.delete('/favorites/:idx', (req, res) => {
    console.log("this is the userId: ", req.user.id)
    console.log('remove from favorites book Id: ', req.params.idx)
    db.book.destroy({
        where: {
          id: req.params.idx,
          userId: req.user.id
        }
    }).then(() => {
        // console.log(deletedBook)
        res.redirect('/book/favorites')
    })
    .catch(err => {
        console.log("ererererer", err)
    })

})

module.exports = router;