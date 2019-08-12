const express = require('express')
const { isWebUri } = require('valid-url');
const uuid = require('uuid/v4')
const logger = require('../logger')
const { bookmarks } = require('../store')


const bookmarksRouter = express.Router()
  const bodyParser = express.json()

bookmarksRouter
  .route('/bookmarks')
  .get((req, res) => {
    res
    .json(bookmarks);
    })
    .post(bodyParser, (req, res) =>  {
    const {  url, title, rating, description } = req.body;
    if (!url) {
      logger.error(`Url is required`);
      return res
        .status(400)
        .send('Invalid data');
    }
    if (!title) {
      logger.error(`Title is required`);
      return res
        .status(400)
        .send('Invalid data');
    }
    if (!rating) {
      logger.error(`Rating is required`);
      return res
        .status(400)
        .send('Invalid data');
    }

    if (!Number.isInteger(rating) || rating < 0 || rating > 5) {
      logger.error(`Invalid rating '${rating}' supplied`)
      return res.status(400).send(`'rating' must be a number between 0 and 5`)
    }

    if (!isWebUri(url)) {
      logger.error(`Invalid url '${url}' supplied`)
      return res.status(400).send(`'url' must be a valid Url`)
    }

    const id = uuid();
    const bookmark = {
      id,
      url,
      title,
      rating,
      description
    };
  bookmarks.push(bookmark);
  logger.info(`Bookmark with id ${id} created`);
  res
    .status(201)
    .location(`http://localhost:8000/bookmarks/${id}`)
    .json(bookmark);
  })

  bookmarksRouter
  .route('/bookmarks/:id')
  .get((req, res) => {
    const { id } = req.params;
    const bookmark = bookmarks.find(b => b.id == id);

    if (!bookmark) {
      logger.error(`Bookmark with id ${id} not found.`);
      return res
        .status(404)
        .send('Bookmark Not Found');
    }
  
    res.json(bookmark);

})
  .delete((req, res) => {
    const { id } = req.params;
    console.log(id)
    const bookmarkIndex = bookmarks.findIndex(b => b.id == id);
    if (bookmarkIndex === -1) {
      logger.error(`Bookmark with id ${id} not found.`);
      return res
        .status(404)
        .send('Not found');
    }
    bookmarks.splice(bookmarkIndex, 1)

  logger.info(`Bookmark with id ${id} deleted.`)
  res
    .status(204)
    .end()
  })

  module.exports = bookmarksRouter