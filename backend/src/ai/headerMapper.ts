import dotenv from 'dotenv'
import { GoogleGenerativeAI } from '@google/generative-ai'

dotenv.config()

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')


interface AIHeaderMappingRequest {
    headers: string[]
    sampleRows: Record<string, any>[]
    entityType: 'clients' | 'workers' | 'tasks'
}

export async function mapHeadersAI({
    headers,
    sampleRows,
    entityType
}: AIHeaderMappingRequest): Promise<Record<string, string>> {
    const model = genAI.getGenerativeModel({ model: 'models/gemini-1.5-flash-latest' })

    const prompt = `
You are an expert CSV parser. Given headers and sample rows for a CSV file of type "${entityType}", return a JSON mapping of the original headers to correct standard headers.

Standard headers for:
- clients: ["ClientID", "ClientName", "PriorityLevel", "RequestedTaskIDs", "GroupTag", "AttributesJSON"]
- workers: ["WorkerID", "WorkerName", "Skills", "AvailableSlots", "MaxLoadPerPhase", "WorkerGroup", "QualificationLevel"]
- tasks: ["TaskID", "TaskName", "Category", "Duration", "RequiredSkills", "PreferredPhases", "MaxConcurrent"]

Headers: ${JSON.stringify(headers)}
Sample Rows: ${JSON.stringify(sampleRows.slice(0, 3))}

Return only a valid JSON like:
{ "Emp Name": "WorkerName", "Available Slot": "AvailableSlots" }
  `

    const result = await model.generateContent(prompt)
    const text = result.response.text()

    try {
        return JSON.parse(text)
    } catch (err) {
        console.error('❌ Failed to parse Gemini response:', text)
        return {}
    }
}
