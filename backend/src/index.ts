import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import dotenv from 'dotenv'
import uploadRouter from './routes/upload'
import { mapHeadersRouter } from './routes/mapHeaders'

dotenv.config()
console.log('OPENAI key:', process.env.OPENAI_API_KEY)

const app = express()
app.use(cors())
app.use(bodyParser.json())

app.use('/api/upload', uploadRouter)
app.use('/api', mapHeadersRouter)

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' })
})

const port = process.env.PORT || 4003
app.listen(port, () => {
    console.log(`Backend running on http://localhost:${port}`)
})
