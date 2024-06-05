/* eslint-disable prettier/prettier */
import { FastifyReply, FastifyRequest } from 'fastify'
import { knex } from '../databse'

export const checkSessionIdExists = async(
  req: FastifyRequest,
  rep: FastifyReply
) =>{
  const sessionId = req.cookies.sessionId
  if (!sessionId) {
    return rep.status(401).send({ error: 'Unauthorized' })
  }

  const user = await knex("users").where({session_id: sessionId}).first()

  if(!user){
    return rep.status(401).send({ error: 'Unauthorized' })
  }

  req.user = user
}
