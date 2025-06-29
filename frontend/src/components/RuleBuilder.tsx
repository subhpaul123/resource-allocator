'use client'

import { useState } from 'react'
import { Rule } from '../types/rules'

interface RuleBuilderProps {
    allTasks: string[]
    rules: Rule[]
    setRules: (rules: Rule[]) => void
}

export default function RuleBuilder({ allTasks, rules, setRules }: RuleBuilderProps) {
    const [selectedTasks, setSelectedTasks] = useState<string[]>([])
    const [slotGroup, setSlotGroup] = useState('')
    const [minSlots, setMinSlots] = useState<number>(1)

    const [loadGroup, setLoadGroup] = useState('')
    const [maxSlots, setMaxSlots] = useState<number>(1)

    const [phaseTaskId, setPhaseTaskId] = useState('')
    const [allowedPhases, setAllowedPhases] = useState<string>('') // comma-separated string

    const toggleTask = (taskId: string) => {
        setSelectedTasks(prev =>
            prev.includes(taskId) ? prev.filter(t => t !== taskId) : [...prev, taskId]
        )
    }

    const addCoRunRule = () => {
        if (selectedTasks.length < 2) return
        setRules([...rules, { type: 'coRun', tasks: [...selectedTasks] }])
        setSelectedTasks([])
    }

    const addSlotRestrictionRule = () => {
        if (!slotGroup || minSlots < 1) return
        setRules([...rules, { type: 'slotRestriction', group: slotGroup, minCommonSlots: minSlots }])
        setSlotGroup('')
        setMinSlots(1)
    }

    const addLoadLimitRule = () => {
        if (!loadGroup || maxSlots < 1) return
        setRules([...rules, { type: 'loadLimit', group: loadGroup, maxSlotsPerPhase: maxSlots }])
        setLoadGroup('')
        setMaxSlots(1)
    }

    const addPhaseWindowRule = () => {
        const phases = allowedPhases
            .split(',')
            .map(p => parseInt(p.trim()))
            .filter(p => !isNaN(p))
        if (!phaseTaskId || phases.length === 0) return
        setRules([...rules, { type: 'phaseWindow', taskId: phaseTaskId, allowedPhases: phases }])
        setPhaseTaskId('')
        setAllowedPhases('')
    }

    const removeRule = (index: number) => {
        const copy = [...rules]
        copy.splice(index, 1)
        setRules(copy)
    }

    return (
        <div className="space-y-6 border-t pt-6 mt-8">
            <h2 className="text-xl font-semibold">Rule Builder</h2>

            {/* CoRun Rule */}
            <div>
                <h3 className="font-medium">Select Tasks to Co-Run</h3>
                <div className="flex flex-wrap gap-2">
                    {allTasks.map(id => (
                        <button
                            key={id}
                            onClick={() => toggleTask(id)}
                            className={`px-2 py-1 border rounded ${selectedTasks.includes(id) ? 'bg-blue-600 text-white' : ''
                                }`}
                        >
                            {id}
                        </button>
                    ))}
                </div>
                <button
                    className="mt-2 px-3 py-1 bg-green-600 text-white rounded"
                    onClick={addCoRunRule}
                >
                    Add Co-Run Rule
                </button>
            </div>

            {/* Slot Restriction Rule */}
            <div className="border-t pt-4">
                <h3 className="font-medium">Slot Restriction</h3>
                <input
                    value={slotGroup}
                    onChange={e => setSlotGroup(e.target.value)}
                    placeholder="Group Name"
                    className="border px-2 py-1 mr-2"
                />
                <input
                    type="number"
                    min={1}
                    value={minSlots}
                    onChange={e => setMinSlots(parseInt(e.target.value))}
                    placeholder="Min Common Slots"
                    className="border px-2 py-1 mr-2"
                />
                <button
                    className="px-3 py-1 bg-green-600 text-white rounded"
                    onClick={addSlotRestrictionRule}
                >
                    Add Slot Restriction Rule
                </button>
            </div>

            {/* Load Limit Rule */}
            <div className="border-t pt-4">
                <h3 className="font-medium">Load Limit</h3>
                <input
                    value={loadGroup}
                    onChange={e => setLoadGroup(e.target.value)}
                    placeholder="Group Name"
                    className="border px-2 py-1 mr-2"
                />
                <input
                    type="number"
                    min={1}
                    value={maxSlots}
                    onChange={e => setMaxSlots(parseInt(e.target.value))}
                    placeholder="Max Slots per Phase"
                    className="border px-2 py-1 mr-2"
                />
                <button
                    className="px-3 py-1 bg-green-600 text-white rounded"
                    onClick={addLoadLimitRule}
                >
                    Add Load Limit Rule
                </button>
            </div>

            {/* Phase Window Rule */}
            <div className="border-t pt-4">
                <h3 className="font-medium">Phase Window</h3>
                <select
                    value={phaseTaskId}
                    onChange={e => setPhaseTaskId(e.target.value)}
                    className="border px-2 py-1 mr-2"
                >
                    <option value="">Select Task</option>
                    {allTasks.map(id => (
                        <option key={id} value={id}>
                            {id}
                        </option>
                    ))}
                </select>
                <input
                    value={allowedPhases}
                    onChange={e => setAllowedPhases(e.target.value)}
                    placeholder="Allowed Phases (comma-separated)"
                    className="border px-2 py-1 mr-2"
                />
                <button
                    className="px-3 py-1 bg-green-600 text-white rounded"
                    onClick={addPhaseWindowRule}
                >
                    Add Phase Window Rule
                </button>
            </div>

            {/* Rule List */}
            {rules.length > 0 && (
                <div className="border p-3 rounded bg-gray-50 mt-4">
                    <h3 className="font-medium mb-2">Current Rules</h3>
                    <ul className="text-sm list-disc list-inside space-y-1">
                        {rules.map((rule, i) => (
                            <li key={i}>
                                <span>
                                    {rule.type === 'coRun' && `Co-Run: ${rule.tasks.join(', ')}`}
                                    {rule.type === 'slotRestriction' &&
                                        `Slot Restriction → Group: ${rule.group}, Min Slots: ${rule.minCommonSlots}`}
                                    {rule.type === 'loadLimit' &&
                                        `Load Limit → Group: ${rule.group}, Max Slots: ${rule.maxSlotsPerPhase}`}
                                    {rule.type === 'phaseWindow' &&
                                        `Phase Window → Task ${rule.taskId}, Allowed Phases: ${rule.allowedPhases.join(', ')}`}
                                </span>
                                <button
                                    onClick={() => removeRule(i)}
                                    className="ml-2 text-red-600 text-xs underline"
                                >
                                    remove
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    )
}
