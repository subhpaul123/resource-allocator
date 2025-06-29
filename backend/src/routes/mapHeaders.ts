import express from 'express'
import { mapHeadersAI } from '../ai/headerMapper'

const router = express.Router()

router.post('/map-headers', async (req, res) => {
    try {
        const { headers, sampleRows, entityType } = req.body

        if (!headers || !sampleRows || !entityType) {
            res.status(400).json({ error: 'Missing parameters' });
            return;
        }

        const mapping = await mapHeadersAI({ headers, sampleRows, entityType })
        res.json({ mapping })
    } catch (err: any) {
        console.error('❌ Gemini error:', err)
        res.status(500).json({ error: 'Internal Server Error' })
    }
})

export { router as mapHeadersRouter }
