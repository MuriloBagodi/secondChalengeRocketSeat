/* eslint-disable prettier/prettier */
// FastifyRequestContext
import 'fastify'

declare module 'fastify' {
  export interface FastifyRequest {
    user?: {
      id: string
      session_id: string
      username: string
      email: string
      created_at: string
      updated_at: string
    }
  }
}
