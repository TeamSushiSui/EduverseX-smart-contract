import express from 'express'
import { nftRouter } from './apps/nft'
import { courseRouter } from './apps/courses'
import { userRouter } from './apps/users'
const app = express()
const port = 3000 || process.env.PORT

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.use('/nfts', nftRouter)
app.use('/courses', courseRouter)
app.use('/users', userRouter)

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})