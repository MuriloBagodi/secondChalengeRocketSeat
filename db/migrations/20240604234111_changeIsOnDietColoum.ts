import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('meals', (table) => {
    table.renameColumn('isOnDiet', 'is_on_diet')
  })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable('meals', (table) => {
    table.renameColumn('is_on_diet', 'isOnDiet')
  })
}
