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
      name: z.string().optional(),
      description: z.string().optional(),
      isOnDiet: z.boolean().optional(),
      date: z.coerce.date().optional()
    })

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

    return res.status(204).send()
  })

  app.get("/:mealId", { preHandler: [checkSessionIdExists] }, async (req, res) => {
    const paramsSchema = z.object({ mealId: z.string().uuid() })
    const { mealId } = paramsSchema.parse(req.params)
    if (!mealId) {
      return res.status(404).send({ messageError: "Meal id not exist" })
    }
    const meal = await knex("meals").where({ id: mealId, user_id: req.user?.id }).first()

    return res.status(201).send({ meal })
  })

  app.delete("/:mealId", { preHandler: [checkSessionIdExists] }, async (req, res) => {
    const paramsSchema = z.object({ mealId: z.string().uuid() })
    const { mealId } = paramsSchema.parse(req.params)

    if (!mealId) {
      return res.status(404).send({ messageError: "Meal id not exist" })
    }

    await knex("meals").delete().where({
      id: mealId,
    })

    return res.status(204).send()
  })

  app.get("/metrics", { preHandler: [checkSessionIdExists] }, async (req, res) => {
    const totalMealsOnDiet = await knex('meals')
      .where({ user_id: req.user?.id, isOnDiet: true })
      .count('id', { as: 'total' })
      .first()

    const totalMealsOffDiet = await knex("meals").where({
      user_id: req.user?.id,
      isOnDiet: false,
    }).count("id", { as: "total" }).first()

    const totalMeals = await knex('meals')
      .where({ user_id: req.user?.id })
      .orderBy('date', 'desc')

    const { bestOnDietSequence } = totalMeals.reduce(
      (acc, meal) => {
        if (meal.isOnDiet) {
          acc.currentSequence += 1
        } else {
          acc.currentSequence = 0
        }

        if (acc.currentSequence > acc.bestOnDietSequence) {
          acc.bestOnDietSequence = acc.currentSequence
        }

        return acc
      },
      { bestOnDietSequence: 0, currentSequence: 0 },
    )

    return res.send({
      totalMeals: totalMeals.length,
      totalMealsOnDiet: totalMealsOnDiet?.total,
      totalMealsOffDiet: totalMealsOffDiet?.total,
      bestOnDietSequence,
    })
  })
}