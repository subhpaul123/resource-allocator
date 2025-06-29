import { FrontendRowData } from '../../../frontend/src/types/frontend'
import { Rule } from '../../../frontend/src/types/rules'

type Weights = {
    priority: number
    fairness: number
    fulfillment: number
}

type Allocation = {
    clientId: string
    taskId: string
    workerId: string
    phase: number
}

export function runAllocation(
    clients: FrontendRowData[],
    workers: FrontendRowData[],
    tasks: FrontendRowData[],
    rules: Rule[],
    weights: Weights
): Allocation[] {
    const result: Allocation[] = []

    // Ensure workers have a defined type for Skills
    type Worker = { Skills: string[]; WorkerID: string; };

    // 🧠 Step 1: Sort clients by weighted priority
    const sortedClients = [...clients].sort((a, b) => {
        const aPriority = (Number(a.PriorityLevel) || 1) * weights.priority
        const bPriority = (Number(b.PriorityLevel) || 1) * weights.priority
        return bPriority - aPriority
    })

    for (const client of sortedClients) {
        const requestedTasks = Array.isArray(client.RequestedTaskIDs)
            ? client.RequestedTaskIDs
            : typeof client.RequestedTaskIDs === 'string'
                ? client.RequestedTaskIDs.split(',').map(t => t.trim())
                : []

        for (const taskId of requestedTasks) {
            const task = tasks.find(t => String(t.TaskID) === taskId)
            const requiredSkill = Array.isArray(task?.RequiredSkills)
                ? task?.RequiredSkills[0]
                : ''

            const worker = workers.find(w =>
                Array.isArray((w as Worker).Skills) && (w as Worker).Skills.includes(requiredSkill)
            )

            if (task && worker) {
                result.push({
                    clientId: String(client.ClientID),
                    taskId: String(task.TaskID),
                    workerId: String(worker.WorkerID),
                    phase: (task.PreferredPhases as number[])?.[0] ?? 1
                })

                break // Assign only one task per client for simplicity
            }
        }
    }

    return result
}
