/* eslint-disable prettier/prettier */
import fastify from 'fastify'
import cookie from '@fastify/cookie'
import { userRoute } from './routes/user.routes'
import { mealsRoutes } from './routes/meals.routes'

export const app = fastify()

app.register(cookie)
app.register(userRoute, {prefix: "user"})
app.register(mealsRoutes, {prefix: "meals"})