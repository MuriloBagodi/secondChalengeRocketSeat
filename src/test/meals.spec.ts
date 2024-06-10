import { execSync } from 'child_process'
import request from 'supertest'
import { app } from '../app'

describe('Meals routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    execSync('npx knex migrate:rollback --all')
    execSync('npx knex migrate:latest')
  })

  it('should be able to create a new meal', async () => {
    const userResponse = await request(app.server)
      .post('/user')
      .send({ username: 'Murilo', email: 'murilo@email.com' })
      .expect(201)

    await request(app.server)
      .post('/meals')
      .set('Cookie', userResponse.header['set-cookie'])
      .send({
        name: 'Café',
        description: '400g de ovo',
        isOnDiet: true,
        date: new Date(),
      })
      .expect(201)
  })

  it('should be able to list all meals from a user', async () => {
    const userResponse = await request(app.server)
      .post('/user')
      .send({ username: 'Murilo', email: 'murilo@email.com' })
      .expect(201)

    await request(app.server)
      .post('/meals')
      .set('Cookie', userResponse.header['set-cookie'])
      .send({
        name: 'Café',
        description: '400g de ovo',
        isOnDiet: true,
        date: new Date(),
      })
      .expect(201)

    await request(app.server)
      .post('/meals')
      .set('Cookie', userResponse.header['set-cookie'])
      .send({
        name: 'Almoço',
        description: '1k de comida',
        isOnDiet: true,
        date: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day after
      })
      .expect(201)

    const mealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', userResponse.header['set-cookie'])
      .expect(200)

    expect(mealsResponse.body).toHaveLength(2)

    // This validate if the order is correct
    expect(mealsResponse.body[0].name).toBe('Café')
    expect(mealsResponse.body[1].name).toBe('Almoço')
  })

  it('should be able to show a single meal', async () => {
    const userResponse = await request(app.server)
      .post('/user')
      .send({ username: 'Murilo', email: 'murilo@email.com' })
      .expect(201)

    await request(app.server)
      .post('/meals')
      .set('Cookie', userResponse.header['set-cookie'])
      .send({
        name: 'Café',
        description: '400g de ovo',
        isOnDiet: true,
        date: new Date(),
      })
      .expect(201)

    const mealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', userResponse.header['set-cookie'])
      .expect(200)

    const mealId = mealsResponse.body[0].id

    const mealResponse = await request(app.server)
      .get(`/meals/${mealId}`)
      .set('Cookie', userResponse.header['set-cookie'])
      .expect(201)

    expect(mealResponse.body).toEqual({
      meal: expect.objectContaining({
        name: 'Café',
        description: '400g de ovo',
        isOnDiet: 1,
        date: expect.any(Number),
      }),
    })
  })

  it('should be able to update a meal from a user', async () => {
    const userResponse = await request(app.server)
      .post('/user')
      .send({ username: 'Murilo', email: 'murilo@email.com' })
      .expect(201)

    await request(app.server)
      .post('/meals')
      .set('Cookie', userResponse.header['set-cookie'])
      .send({
        name: 'Café',
        description: '400g de ovo',
        isOnDiet: true,
        date: new Date(),
      })
      .expect(201)

    const mealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', userResponse.header['set-cookie'])
      .expect(200)

    const mealId = mealsResponse.body[0].id

    await request(app.server)
      .put(`/meals/${mealId}`)
      .set('Cookie', userResponse.header['set-cookie'])
      .send({
        name: 'Dinner',
        description: "It's a dinner",
        isOnDiet: true,
        date: new Date(),
      })
      .expect(204)
  })

  it('should be able to delete a meal from a user', async () => {
    const userResponse = await request(app.server)
      .post('/user')
      .send({ username: 'Murilo', email: 'murilo@email.com' })
      .expect(201)

    await request(app.server)
      .post('/meals')
      .set('Cookie', userResponse.header['set-cookie'])
      .send({
        name: 'Café',
        description: '400g de ovo',
        isOnDiet: true,
        date: new Date(),
      })
      .expect(201)

    const mealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', userResponse.header['set-cookie'])
      .expect(200)

    const mealId = mealsResponse.body[0].id

    await request(app.server)
      .delete(`/meals/${mealId}`)
      .set('Cookie', userResponse.header['set-cookie'])
      .expect(204)
  })

  it('should be able to get metrics from a user', async () => {
    const userResponse = await request(app.server)
      .post('/user')
      .send({ username: 'Murilo', email: 'murilo@email.com' })
      .expect(201)

    await request(app.server)
      .post('/meals')
      .set('Cookie', userResponse.header['set-cookie'])
      .send({
        name: 'Café',
        description: '400g de ovo',
        isOnDiet: true,
        date: new Date('2021-01-01T08:00:00'),
      })
      .expect(201)

    await request(app.server)
      .post('/meals')
      .set('Cookie', userResponse.header['set-cookie'])
      .send({
        name: 'Lunch',
        description: "It's a lunch",
        isOnDiet: false,
        date: new Date('2021-01-01T12:00:00'),
      })
      .expect(201)

    await request(app.server)
      .post('/meals')
      .set('Cookie', userResponse.header['set-cookie'])
      .send({
        name: 'Snack',
        description: "It's a snack",
        isOnDiet: true,
        date: new Date('2021-01-01T15:00:00'),
      })
      .expect(201)

    await request(app.server)
      .post('/meals')
      .set('Cookie', userResponse.header['set-cookie'])
      .send({
        name: 'Dinner',
        description: "It's a dinner",
        isOnDiet: true,
        date: new Date('2021-01-01T20:00:00'),
      })

    await request(app.server)
      .post('/meals')
      .set('Cookie', userResponse.header['set-cookie'])
      .send({
        name: 'Café',
        description: '400g de ovo',
        isOnDiet: true,
        date: new Date('2021-01-02T08:00:00'),
      })

    const metricsResponse = await request(app.server)
      .get('/meals/metrics')
      .set('Cookie', userResponse.header['set-cookie'])
      .expect(200)

    expect(metricsResponse.body).toEqual({
      totalMeals: 5,
      totalMealsOnDiet: 4,
      totalMealsOffDiet: 1,
      bestOnDietSequence: 3,
    })
  })
})
