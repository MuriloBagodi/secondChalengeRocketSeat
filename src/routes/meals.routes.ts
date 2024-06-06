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
    console.log("params:?  ", req.params)


    const { mealId } = paramsSchema.parse(req.params)

    const updateMeal = z.object({
      name: z.string().optional(),
      description: z.string().optional(),
      isOnDiet: z.boolean().optional(),
      date: z.coerce.date().optional()
    })
    console.log(req.body)
    const { name, description, isOnDiet, date } = updateMeal.parse(
      req.body,
    )

    const meal = await knex("meals").where({ id: mealId }).first()

    if (!meal) {
      return res.status(404).send("Meals Does not exist")
    }

    await knex("meals").update({
      name,
      description,
      isOnDiet,
      date: date?.getTime(),
    })

    return res.status(204).send({ meal })
  })
}