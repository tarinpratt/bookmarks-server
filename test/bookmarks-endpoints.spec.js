const { expect } = require('chai')
const knex = require('knex')
const app = require('../src/app')
const { makeBookmarksArray } = require('./bookmarks.fixtures')
const { makeMaliciousBookmark } = require('./bookmarks.fixtures')

describe.only('Bookmarks Endpoints', function() {
    let  db
    console.log(process.env.TEST_DB_URL)
  
    before('make knex instance', () => {
      db = knex({
        client: 'pg',
        connection: process.env.TEST_DB_URL,
       
      })
      app.set('db', db)
    })
  
    after('disconnect from db', () => db.destroy())
  
    before('clean the table', () => db('bookmarks').truncate())

    afterEach('cleanup', () => db('bookmarks').truncate())

    describe(`GET /bookmarks`, () => {
        context(`Given no bookmarks`, () => {
                 it(`responds with 200 and an empty list`, () => {
                   return supertest(app)
                     .get('/bookmarks')
                     .expect(200, [])
                 })
               })
    context('Given there are bookmarks in the database', () => {
        const testBookmarks = makeBookmarksArray()
        beforeEach('insert bookmarks', () => {
                   return db
                     .into('bookmarks')
                     .insert(testBookmarks)

    })
    it('GET /bookmarks responds with 200 and all of the bookmarks', () => {
             return supertest(app)
               .get('/bookmarks')
               .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
               .expect(200, testBookmarks)
              
           })
        })
        context(`Given an XSS attack bookmark`, () => {
          const { maliciousBookmark, expectedBookmark } = makeMaliciousBookmark()

          beforeEach('insert malicious bookmark', () => {
            return db
              .into('bookmarks')
              .insert([maliciousBookmark])

          })
          it('removes XSS attack content', () => {
            return supertest(app)
              .get(`/bookmarks`)
              .expect(200)
              .expect( res => {
                expect(res.body[0].title).to.eql(expectedBookmark.title)
                expect(res.body[0].description).to.eql(expectedBookmark.description)
              })
          })

        })
    })
   

        describe(`GET /bookmarks/:bookmark_id`, () => {
            context(`Given no bookmarks`, () => {
                     it(`responds with 404`, () => {
                       const bookmarkId = 123456
                       return supertest(app)
                         .get(`/bookmarks/${bookmarkId}`)
                         .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                         .expect(404, { error: { message: `bookmark does not exist` } })
                     })
                   })

            context('given there are bookmarks in the database', () => {
                const testBookmarks = makeBookmarksArray()

      beforeEach('insert bookmarks', () => {
        return db
          .into('bookmarks')
          .insert(testBookmarks)
      })
    it('GET /bookmarks/:bookmark_id responds with 200 and the specified bookmark', () => {
                 const bookmarkId = 2
                 const expectedBookmark = testBookmarks[bookmarkId - 1]
                 return supertest(app)
                   .get(`/bookmarks/${bookmarkId}`)
                   .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                   .expect(200, expectedBookmark)
               })
            })
        })

    describe(`POST/bookmarks `, () => {
      it(`creates a new bookmark responding w 201 and new bookmark`, function () {
        
        const newBookmark = {
          title: 'Thinkful',
          url: 'https://www.thinkful.com',
          rating: 5,
          description: 'Think outside the classroom'

        }
        return supertest(app)
        .post('/bookmarks')
        .send(newBookmark)
        .expect(201)
        .expect(res => {
          expect(res.body.title).to.eql(newBookmark.title)
          expect(res.body.url).to.eql(newBookmark.url)
          expect(res.body.rating).to.eql(newBookmark.rating)
          expect(res.body.description).to.eql(newBookmark.description)
          expect(res.body).to.have.property('id')
          expect(res.headers.location).to.eql(`/bookmarks/${res.body.id}`)
        })
        .then(postRes =>
          supertest(app)
          .get(`/bookmarks/${postRes.body.id}`)
          .expect(postRes.body))
      })
  
      const requiredFields = ['title', 'url', 'rating', 'description']
      requiredFields.forEach(field => {
        const newBookmark = {
          title: 'Thinkful',
          url: 'https://www.thinkful.com',
          rating: 5,
          description: 'Think outside the classroom'
        }
        it(`responds w 400 and an error message when the ${field} is missing`, () => {
          delete newBookmark[field]

          return supertest(app)
          .post('/bookmarks')
          .send(newBookmark)
          .expect(400, {
            error: {message: `missing ${field} in req body`}
          })
        })

      })


    })

    describe(`DELETE /bookmarks/:bookmark_id`, () => {
      context(`given there are no bookmarks`, () => {
        it(`responds w 404`, () => {
          const bookmarkId = 12435
          return supertest(app)
          .delete(`/bookmarks/${bookmarkId}`)
          .expect(404, {
            error: {message: `bookmark does not exist`}
          })
        })
      })
      context('given there are bookmarks in the db', () => {
        const testBookmarks = makeBookmarksArray()

       beforeEach('insert bookmarks', () => {
          return db
            .into('bookmarks')
            .insert(testBookmarks)
        })
       it('responds w 204 and removes the bookmark', () => {
          const idToRemove = 1
          const expectedBookmarks = testBookmarks.filter(bookmark => bookmark.id !== idToRemove)
          return supertest(app)
          .delete(`/bookmarks/${idToRemove}`)
          .expect(204)
          .then(res => 
            supertest(app)
            .get(`/bookmarks`)
            .expect(expectedBookmarks)
            )
        })
      })
    })
      
})
