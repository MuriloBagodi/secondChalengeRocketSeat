/* eslint-disable prettier/prettier */
import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../databse'
import { checkSessionIdExists } from '../middleware/checkSessionId'
import { randomUUID } from 'crypto'

export async function mealsRoutes(app: FastifyInstance) {
  app.post("/", { preHandler: [checkSessionIdExists] }, async (req, res) => {
    const mealsSchema = z.object({
      name: z.string(),
      description: z.string(),
      isOnDiet: z.boolean(),
      date: z.coerce.date(),
    })

    const { name, description, isOnDiet, date } = mealsSchema.parse(req.body)

    await knex("meals").insert({
      id: randomUUID(),
      name,
      description,
      isOnDiet,
      date: date.getTime(),
      user_id: req.user?.id
    })

    return res.status(201).send()
  })

  app.get("/", { preHandler: [checkSessionIdExists] }, async (req, res) => {
    const meals = await knex("meals").where("user_id", req.user?.id)
    return res.send(meals)
  })

  app.put("/:mealId", { preHandler: [checkSessionIdExists] }, async (req, res) => {
    const paramsSchema = z.object({ mealId: z.string().uuid() })

    const { mealId } = paramsSchema.parse(req.params)

    const updateMeal = z.object({
      username: z.string(),
      description: z.string(),
      isOnDiet: z.boolean(),
      date: z.coerce.date(),
    })

    const { username, description, idOnDiet, date } = updateMeal.parse(
      req.body,
    )

    const meal = await knex("meals").where({id: mealId}).first()
  })
}