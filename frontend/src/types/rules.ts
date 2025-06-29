export type CoRunRule = {
    type: 'coRun'
    tasks: string[] // TaskIDs to co-run
}

export type SlotRestrictionRule = {
    type: 'slotRestriction'
    group: string // WorkerGroup or ClientGroup
    minCommonSlots: number
}

export type LoadLimitRule = {
    type: 'loadLimit'
    group: string
    maxSlotsPerPhase: number
}

export type PhaseWindowRule = {
    type: 'phaseWindow'
    taskId: string
    allowedPhases: number[]
}

export type Rule = CoRunRule | SlotRestrictionRule | LoadLimitRule | PhaseWindowRule
