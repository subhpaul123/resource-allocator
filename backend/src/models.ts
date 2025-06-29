export interface Client {
    ClientID: string
    ClientName: string
    PriorityLevel: number
    RequestedTaskIDs: string[]
    GroupTag?: string
    AttributesJSON?: unknown
}

export interface Worker {
    WorkerID: string
    WorkerName: string
    Skills: string[]
    AvailableSlots: number[]
    MaxLoadPerPhase: number
    WorkerGroup?: string
    QualificationLevel?: number
}

export interface Task {
    TaskID: string
    TaskName: string
    Category?: string
    Duration: number
    RequiredSkills: string[]
    PreferredPhases: number[]
    MaxConcurrent: number
}
