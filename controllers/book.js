require('dotenv').config();
const router = require('express').Router();
const db = require('../models');
const methodOverride = require('method-override');
const axios = require('axios');

router.use(methodOverride('_method'));

// app.use(express.urlencoded({ extended: false}));

router.post("/result", (req, res) => {
    const apiKey = process.env.BOOKS_API_KEY
    const baseUrl = `https://www.googleapis.com/books/v1/volumes?q=`;
    let result = req.body.search[0]
    let searchType = req.body.search[1] 
    let url ;

    if (searchType === 'title') { url = `${baseUrl}+intitle:${result}&key=${apiKey }`; }
    if (searchType === 'author') { url = `${baseUrl}+inauthor:${result}&key=${apiKey}`; }
    if (searchType === 'genre') { url = `${baseUrl}+subject:${result}&key=${apiKey}`; }
    console.log(`QUERY STRING: , ${url}`)
    
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
                isbn = isbnArray[0].identifier }
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
        res.render("book/result", { bookInfo })
    })
})


// send the favorites to new route
router.post("/favorites", (req, res) => {
    let book = req.body
    const user = req.user.id;
    const description = req.body.description.slice(0, 250)
    db.book.findOrCreate({
        where: {
            title: book.title,
            author: book.author,
            description: description,
            isbn: book.isbn,
            preview_link: book.preview,
            image_url: book.image_url,
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
    db.book.destroy({ where: {
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