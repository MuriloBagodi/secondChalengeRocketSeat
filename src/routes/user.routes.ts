/* eslint-disable prettier/prettier */
import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../databse'
import { randomUUID } from 'crypto'

export async function userRoute(app: FastifyInstance) {
  app.post("/", async (req, res) => {
    const userSchema = z.object({
      username: z.string(),
      email: z.string().email()
    })

    const sessionId = req.cookies.sessionId

    if (!sessionId) {
      const sessionId = randomUUID()
      res.setCookie("sessionId", sessionId, {
        path: "/",
        maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
      })
    }

    const { username, email } = userSchema.parse(req.body)

    const findUserByEmail = await knex("users").where({ email }).first()
    if (findUserByEmail) {
      return res.status(400).send({ message: "User already exist" })
    }

    await knex("users").insert({
      id: randomUUID(),
      username, 
      email, 
      session_id: sessionId
    })

    return res.status(200).send()
  })

  app.get("/", async (req, res) =>{
    const users = await knex("users")

    return res.send({users})
  })
}
