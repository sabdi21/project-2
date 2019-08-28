require('dotenv').config();
const router = require('express').Router();

const pg = require('pg');
const axios = require('axios');

// //instantiates the express app

// // app.use('/', express.static('static'))
// app.use(express.urlencoded({ extended: false}));

const client = new pg.Client(process.env.DATABASE_URL);
console.log(client);


router.post("/result", (req, res) => {
    const apiKey = process.env.BOOKS_API_KEY
    const result = req.body.title
    const url = `https://www.googleapis.com/books/v1/volumes?q=intitle:${result}&key=${apiKey}`

    axios.get(url)
    .then((response) => {
        var bookResult = response.data.items
        let bookInfo = bookResult.map(result => {
            const placeholderImage = 'https://i.imgur.com/J5LVHEL.jpg';
            let image_url = result.volumeInfo.imageLinks.thumbnail || placeholderImage;
            let title = result.volumeInfo.title;
            let author = result.volumeInfo.authors || 'Author(s) not available';
            let description = result.volumeInfo.description || 'Summary not available';
            let preview = result.accessInfo.webReaderLink || 'not available';
            let isbnArray = result.volumeInfo.industryIdentifiers;
            let isbn;

            if( isbnArray ) {
                isbn = isbnArray[0].identifier
                console.log(result.volumeInfo.industryIdentifiers[0].identifier || 'not available') 
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

router.get('/faves', (req, res) => {
    res.render('book/favorites')
})

module.exports = router;