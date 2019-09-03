require('dotenv').config();
const router = require('express').Router();
const db = require('../models');
const methodOverride = require('method-override');
const axios = require('axios');
const isLoggedIn = require('../middleware/isLoggedIn')

router.use(methodOverride('_method'));

// app.use(express.urlencoded({ extended: false}));

router.post("/result", (req, res) => {
    const apiKey = process.env.BOOKS_API_KEY
    const baseUrl = `https://www.googleapis.com/books/v1/volumes?q=`;
    let result = req.body.search[0]
    let searchType = req.body.search[1] 
    let url ;
    console.log("This is the preview link:", result)
    if (searchType === 'title') { url = `${baseUrl}+intitle:${result}&key=${apiKey }`; }
    if (searchType === 'author') { url = `${baseUrl}+inauthor:${result}&key=${apiKey}`; }
    if (searchType === 'genre') { url = `${baseUrl}+subject:${result}&key=${apiKey}`; }
    console.log(`QUERY STRING: , ${url}`)
    
    axios.get(url)
    .then((response) => {
        var bookResult = response.data.items
        console.log('this is the book result:', bookResult)
        let bookInfo = bookResult.map(result => {
            const placeholderImage = 'https://i.imgur.com/J5LVHEL.jpg';
            let image_url = result.volumeInfo.imageLinks && result.volumeInfo.imageLinks.thumbnail ? result.volumeInfo.imageLinks.thumbnail : placeholderImage;
            let title = result.volumeInfo.title;
            let author = result.volumeInfo.authors || 'Author(s) not available';
            let description = result.volumeInfo.description || 'Summary not available';
            let preview_link = result.accessInfo.webReaderLink || 'not available';
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
                preview_link,
                isbn
            }  
            
        })
        // console.log('this is the preview link:', preview_link)
        res.render("book/result", { bookInfo })
    })
})


// send the favorites to new route
router.post("/favorites", (req, res) => {
    let book = req.body
    console.log("IS THIS COMING THRU?: ", book)
    console.log('this is the favorite selected', req.body)
    const user = req.user.id;
    const preview_link = req.body.preview
    console.log("IS THIS COMING THRU?: ", preview_link)
    const description = req.body.description.slice(0, 250)
    db.book.findOrCreate({
        where: {
            title: book.title,
            author: book.author,
            description: description,
            isbn: book.isbn,
            // preview_link: preview_link,
            image_url: book.image_url,
            userId: user
                
        }
    }).then(() => {

        res.redirect("book/favorites")
    }).catch(err => {
        console.log("ererererer", err)
    })
})

router.get("/favorites",  isLoggedIn, (req, res) => {
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