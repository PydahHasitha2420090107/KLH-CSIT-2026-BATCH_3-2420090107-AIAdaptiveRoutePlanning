import { app } from './app.js'
import { env } from './config/env.js'
import { ensureUserSeed } from './db/database.js'

ensureUserSeed()

app.listen(env.port, () => {
  console.log(`SmartFleet backend listening on http://localhost:${env.port}`)
})
