import { Client, Worker, Task } from './models'

export type BackendRowData = Record<string, string | number | boolean | null | object | string[] | number[]>


export function validateClients(data: BackendRowData[]): string[] {
    const errors: string[] = []
    const seen = new Set<string>()
    data.forEach((row, i) => {
        const id = String(row.ClientID)
        if (!id) errors.push(`Row ${i}: missing ClientID`)
        else if (seen.has(id)) errors.push(`Row ${i}: duplicate ClientID ${id}`)
        else seen.add(id)

        if (typeof row.PriorityLevel !== 'number')
            errors.push(`Row ${i}: PriorityLevel must be a number`)

        if (!Array.isArray(row.RequestedTaskIDs))
            errors.push(`Row ${i}: RequestedTaskIDs must be an array`)
    })
    return errors
}

export function validateWorkers(data: BackendRowData[]): string[] {
    const errors: string[] = []
    const seen = new Set<string>()
    data.forEach((row, i) => {
        const id = String(row.WorkerID)
        if (!id) errors.push(`Row ${i}: missing WorkerID`)
        else if (seen.has(id)) errors.push(`Row ${i}: duplicate WorkerID ${id}`)
        else seen.add(id)

        if (!Array.isArray(row.Skills))
            errors.push(`Row ${i}: Skills must be an array`)

        if (!Array.isArray(row.AvailableSlots))
            errors.push(`Row ${i}: AvailableSlots must be an array`)

        if (typeof row.MaxLoadPerPhase !== 'number')
            errors.push(`Row ${i}: MaxLoadPerPhase must be a number`)
    })
    return errors
}

export function validateTasks(data: BackendRowData[]): string[] {
    const errors: string[] = []
    const seen = new Set<string>()
    data.forEach((row, i) => {
        const id = String(row.TaskID)
        if (!id) errors.push(`Row ${i}: missing TaskID`)
        else if (seen.has(id)) errors.push(`Row ${i}: duplicate TaskID ${id}`)
        else seen.add(id)

        if (typeof row.Duration !== 'number' || row.Duration < 1)
            errors.push(`Row ${i}: Duration must be ≥1`)

        if (!Array.isArray(row.RequiredSkills))
            errors.push(`Row ${i}: RequiredSkills must be an array`)

        if (!Array.isArray(row.PreferredPhases))
            errors.push(`Row ${i}: PreferredPhases must be an array`)

        if (typeof row.MaxConcurrent !== 'number')
            errors.push(`Row ${i}: MaxConcurrent must be a number`)
    })
    return errors
}
