/* eslint-disable prettier/prettier */
import { app } from './app'
import { env } from './env'

const port = env.PORT || 3000

app.listen({ port }).then(() => {
  console.log(`Server started on port ${port}`)
})
