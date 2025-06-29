import axios from 'axios'

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4003'

export async function mapHeaders(headers: string[], rows: any[], entityType: string) {
    const res = await axios.post(`${BASE_URL}/api/map-headers`, {
        headers,
        sampleRows: rows,
        entityType
    })

    return res.data.mapping
}
