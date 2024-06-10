/* eslint-disable prettier/prettier */
import 'knex'

declare module 'knex/types/tables' {
  export interface Tables {
    users: {
      id: string
      session_id: string
      username: string
      email: string
      created_at: string
      updated_at: string
    }

    meals: {
      id: string
      user_id: string
      name?: string
      description: string
      isOnDiet: boolean | number
      date: number // unix timestamp
      created_at: string
      updated_at: string
    }
  }
}
