import request from 'supertest'
import { app } from '../app.js'
import { HTTP_STATUSES } from '../shared/HTTP_STATUSES.js'
import type { BookDb, GetBookData, PostBookData } from '../shared/db/types.js'
import { connectToDatabase, disconnectToDatabase } from '../shared/db/mongo.js'
import * as z from 'zod'

let createdBooks: BookDb[] = []

const booksToCreate = [
    { "title": "Замок", "author": "Кафка", "readPages": 480, "totalPages": 480 },
    { title: 'Человек без свойств', author: 'Музиль', readPages: 0, totalPages: 900 },
    { title: 'Замок тьмы', author: 'Татьяна Дивергент', readPages: 0, totalPages: 200 },
  ]

const incorrectedData = {
  title: '',
  author: 'R',
  readPages: 'Нет ещё',
  totalPages: 0
}

beforeAll(async () => {
  await connectToDatabase('life')

  await request(app).delete('/books')

  for (const book of booksToCreate) {
    const res = await request(app)
    .post('/books')
    .send(book)

    createdBooks.push(res.body.message)
  }
})


describe('/books', () => {
  it('should return 200 and correct array', async () => {
    await request(app)
      .get('/books')
      .expect(HTTP_STATUSES.OK_200, { message: createdBooks })
  })
  it('should return 200 and good array by id parametres', async () => {
    const id = createdBooks[0]?.id
    const res = await request(app).get(`/books/${id}`).expect(HTTP_STATUSES.OK_200)

    expect(res.body.message).toEqual(createdBooks.find((book) => book.id === id))
  })
  it('should return 400 and message about invalid id parameters', async () => {
    const id = createdBooks[0]?.id.slice(1)
    await request(app).get(`/books/${id}`)
    .expect(HTTP_STATUSES.BAD_REQUEST_400).expect(({body}) => {
      expect(body.message).toBe('Validation failed')
    })
  })

  it('should return 200 and good array by query parameters', async () => {
    const data: GetBookData = { title: 'замок' }

    const expected = createdBooks
      .filter((d: { title: string | string[] }) =>
        d.title.toString().toLowerCase().includes('замок'),
      )

    await request(app)
      .get('/books')
      .query(data)
      .expect(HTTP_STATUSES.OK_200, { message: expected })
  })

  it('should return 201 and new book', async () => {
    const res = await request(app)
      .post('/books')
      .send(booksToCreate[0])
      .expect(HTTP_STATUSES.CREATED_201)

    expect(res.body.message).toEqual({...booksToCreate[0], id: res.body.message.id})
  })

  it(`shouldn't create book with invalid data`, async () => {
    await request(app)
      .post('/books')
      .send(incorrectedData)
      .expect(HTTP_STATUSES.BAD_REQUEST_400)
      .expect(({body}) => {
        expect(body.message).toBe('Validation failed')
      })
  })

  it('should delete created item', async () => {
    const createRes = await request(app)
      .post('/books')
      .send({ ...booksToCreate[1] })
      .expect(HTTP_STATUSES.CREATED_201)

    const id = createRes.body.message.id

    await request(app).delete(`/books/${id}`).expect(HTTP_STATUSES.OK_200)
  })


  it('shouldn`t delete item with unexpected id', async () => {
    const id = '00000020f51bb4362eee2a4d'
    await request(app)
      .delete(`/books/${id}`)
      .expect(HTTP_STATUSES.NOT_FOUND_404, { message: 'Book not found' })
  })
  
  it('shouldn`t delete item with invalid id format', async () => {
    const id = createdBooks[0]?.id.slice(1)
    await request(app)
      .delete(`/books/${id}`)
      .expect(HTTP_STATUSES.BAD_REQUEST_400).expect(({body}) => {
        expect(body.message).toBe('Validation failed')
      })
  })

  it(`should update book with correct data`, async () => {
    let res = await request(app)
      .put(`/books/${createdBooks[0]?.id}`)
      .send({title: 'Война и пиво'})
      .expect(HTTP_STATUSES.OK_200)

    const updatedDirection = res.body.message
    expect(updatedDirection.title).toBe('Война и пиво')
    expect(updatedDirection.id).toBe(createdBooks[0]?.id)
  })

  it(`shouldn't update book with unexpected id and return 404`, async () => {
    const id = '00000020f51bb4362eee2a4d'
    await request(app)
      .put(`/books/${id}`)
      .send({
        title: 'НЕ ДОЛЖНО БЫТЬ',
      })
      .expect(HTTP_STATUSES.NOT_FOUND_404, { message: 'Book not found' })
  })

  it(`shouldn't update book with invalid id format and return 400`, async () => {
    const id = createdBooks[0]?.id.slice(1)
    await request(app)
      .put(`/books/${id}`)
      .send({
        title: 'НЕ ДОЛЖНО БЫТЬ',
      })
      .expect(HTTP_STATUSES.BAD_REQUEST_400).expect(({body}) => {
        expect(body.message).toBe('Validation failed')
      })
  })

  it(`shouldn't update book with incorrected data`, async () => {
    await request(app)
      .put(`/books/${createdBooks[0]?.id}`)
      .send(incorrectedData)
      .expect(HTTP_STATUSES.BAD_REQUEST_400).expect(({body}) => {
        expect(body.message).toBe('Validation failed')
      })
    })
})


afterAll(async () => {
  await disconnectToDatabase()
})