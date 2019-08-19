const express = require('express')
const { isWebUri } = require('valid-url');
const logger = require('../logger')
const xss = require('xss')
const BookmarksService = require('./bookmarks-service')


const bookmarksRouter = express.Router()
  const bodyParser = express.json()

  const serializeBookmark = bookmark => ({
    id: bookmark.id,
    title: xss(bookmark.title),
    url: bookmark.url,
    rating: bookmark.rating,
    description: xss(bookmark.description),
  })
  

bookmarksRouter
  .route('/')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db')
  BookmarksService.getAllBookmarks(knexInstance)
       .then(bookmarks => {
         res.json(bookmarks.map(serializeBookmark))
       })
       .catch(next)
   })


  .post(bodyParser, (req, res, next) =>  {
    const { title, url, rating, description } = req.body
    const newBookmark = { title, url, rating, description }
      for (const [key, value] of Object.entries(newBookmark)) {
        if (value == null) {
          return res.status(400).json({
            error: { message: `missing ${key} in req body`}
          })
        }
      }
      
      
      if (!Number.isInteger(rating) || rating < 0 || rating > 5) {
        logger.error(`Invalid rating '${rating}' supplied`)
        return res.status(400).send(`'rating' must be a number between 0 and 5`)
      }
  
      if (!isWebUri(url)) {
        logger.error(`Invalid url '${url}' supplied`)
        return res.status(400).send(`'url' must be a valid Url`)
      }

      

       BookmarksService.insertBookmarks(
         req.app.get('db'),
         newBookmark
       )
       .then(bookmark => {
         res.status(201)
         .location(`/bookmarks/${bookmark.id}`)
         .json(serializeBookmark(bookmark))
       })
       .catch(next)
     })

  bookmarksRouter
  .route('/:bookmark_id')
  .all((req, res, next) => {
    const knexInstance = req.app.get('db')
    BookmarksService.getById(knexInstance, req.params.bookmark_id)
         .then(bookmark => {
          if (!bookmark) {
              return res.status(404).json({
                  error: { message: `bookmark does not exist` }
                     })
                   }
                   res.bookmark = bookmark
                   next()
         })
         .catch(next)
     })
    .get((req, res, next) => {
      res.json(serializeBookmark(res.bookmark))
    })
      .delete((req, res, next) => {
        BookmarksService.deleteBookmark(
          req.app.get('db'),
          req.params.bookmark_id
        )
        .then(() => {
          res.status(204)
          .end()
        })
        .catch(next)
      })

    


   

  module.exports = bookmarksRouter



