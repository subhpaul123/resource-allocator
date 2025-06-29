'use client'

import { useState, useEffect, ChangeEvent } from 'react'
import Papa from 'papaparse'
import DataGrid from '../components/DataGrid'
import RuleBuilder from '../components/RuleBuilder'
import ExportPanel from '../components/ExportPanel'
import { runAllocation } from '../../../backend/src/algorithms/allocate'
import { uploadData } from '../lib/api'
import {
  validateClients,
  validateWorkers,
  validateTasks,
  BackendRowData
} from '../../../backend/src/validators'
import { Rule } from '../types/rules'
import { FrontendRowData } from '../types/frontend'
import { mapHeaders } from '../lib/mapHeaders'
import { AxiosError } from 'axios'

interface Weights {
  priority: number
  fairness: number
  fulfillment: number
}

type Entity = 'clients' | 'workers' | 'tasks'

export default function HomePage() {
  const [entity, setEntity] = useState<Entity>('clients')
  const [data, setData] = useState<FrontendRowData[]>([])
  const [rules, setRules] = useState<Rule[]>([])
  const [fileNames, setFileNames] = useState<{ [key in Entity]?: string }>({})
  const [weights, setWeights] = useState<Weights>({
    priority: 0.5,
    fairness: 0.5,
    fulfillment: 0.5
  })

  useEffect(() => {
    const saved = localStorage.getItem(entity)
    const fileSet = fileNames[entity]
    if (saved && fileSet && fileSet !== 'Previously uploaded') {
      setData(JSON.parse(saved))
    } else {
      setData([])
    }
  }, [entity, fileNames])

  useEffect(() => {
    const loaded: Partial<Record<Entity, string>> = {}
      ; (['clients', 'workers', 'tasks'] as Entity[]).forEach(type => {
        const rows = localStorage.getItem(type)
        if (rows) loaded[type] = 'Previously uploaded'
      })
    setFileNames(loaded)
  }, [])

  const getValidator = () => {
    if (entity === 'clients') return validateClients
    if (entity === 'workers') return validateWorkers
    return validateTasks
  }

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    localStorage.removeItem(entity)

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: async (results) => {
        const originalHeaders = Object.keys(results.data[0] || {})
        const sampleRows = results.data.slice(0, 5) as Record<string, unknown>[]
        const headerMapping = await mapHeaders(originalHeaders, sampleRows, entity)

        const mappedData = (results.data as Record<string, unknown>[]).map(row => {
          const remapped: Record<string, unknown> = {}
          for (const key in row) {
            const mappedKey = headerMapping[key] || key
            remapped[mappedKey] = row[key]
          }
          return remapped
        })

        const transformed = mappedData.map(row => {
          const updated: FrontendRowData = { ...row } as FrontendRowData

          if (entity === 'clients') {
            updated.RequestedTaskIDs = typeof row.RequestedTaskIDs === 'string'
              ? row.RequestedTaskIDs.split(',').map((s: string) => s.trim())
              : Array.isArray(row.RequestedTaskIDs) ? row.RequestedTaskIDs : []

            updated.PriorityLevel = row.PriorityLevel !== undefined && row.PriorityLevel !== ''
              ? parseFloat(row.PriorityLevel as string)
              : null

            if (!updated.ClientID && row['ClientID']) {
              updated.ClientID = row['ClientID']
            }

            if (typeof row.AttributesJSON === 'string') {
              try {
                updated.AttributesJSON = JSON.parse(row.AttributesJSON)
              } catch {
                updated.AttributesJSON = row.AttributesJSON
              }
            }
          }

          if (entity === 'workers') {
            updated.Skills = typeof row.Skills === 'string'
              ? row.Skills.includes('[')
                ? JSON.parse(row.Skills)
                : row.Skills.split(',').map((s: string) => s.trim())
              : row.Skills

            updated.AvailableSlots = typeof row.AvailableSlots === 'string'
              ? row.AvailableSlots.includes('[')
                ? JSON.parse(row.AvailableSlots)
                : row.AvailableSlots.replace(/\[|\]/g, '').split(',').map(Number)
              : row.AvailableSlots
          }

          if (entity === 'tasks') {
            updated.RequiredSkills = typeof row.RequiredSkills === 'string'
              ? row.RequiredSkills.split(',').map((s: string) => s.trim())
              : (Array.isArray(row.RequiredSkills) ? row.RequiredSkills : null)

            updated.PreferredPhases = typeof row.PreferredPhases === 'string'
              ? row.PreferredPhases.replace(/\[|\]/g, '').split(',').map((s: string) => s.trim()).map(Number)
              : (Array.isArray(row.PreferredPhases) ? row.PreferredPhases : null)
          }

          return updated
        })

        console.log('✅ Final transformed rows:', transformed)
        setData(transformed)
        localStorage.setItem(entity, JSON.stringify(transformed))
        setFileNames(prev => ({ ...prev, [entity]: file.name }))

        try {
          const validator = getValidator()
          const validationErrors = validator(transformed as BackendRowData[])
          if (validationErrors.length > 0) {
            console.error('❌ Validation errors:', validationErrors)
            alert('Fix validation errors before uploading.')
            return
          }

          await uploadData(entity, transformed as BackendRowData[])
        } catch (err: unknown) {
          if (err instanceof AxiosError && err.response) {
            console.error('⚠️ Backend responded with:', err.response.data)
          } else {
            console.error('Upload failed:', err)
          }
        }
      }
    })
  }

  const taskIDs =
    entity === 'tasks'
      ? data.map(row => row['TaskID']).filter(id => typeof id === 'string' || typeof id === 'number').map(String)
      : []

  const handleAllocate = () => {
    const clients = JSON.parse(localStorage.getItem('clients') ?? '[]')
    const workers = JSON.parse(localStorage.getItem('workers') ?? '[]')
    const tasks = data
    const result = runAllocation(clients, workers, tasks, rules, weights)

    console.log('🪄 Weights:', weights)
    console.log('🧪 Allocation Result:', result)
    alert('✅ Allocation complete! Check the console for result.')
  }

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold">Resource Allocator</h1>

      <div className="flex items-center space-x-4">
        {(['clients', 'workers', 'tasks'] as Entity[]).map(type => (
          <label key={type} className="flex items-center space-x-1">
            <input
              type="radio"
              value={type}
              checked={entity === type}
              onChange={() => setEntity(type)}
            />
            <span className="capitalize">{type}</span>
          </label>
        ))}
      </div>

      <div>
        <label className="block font-medium mb-1">
          {fileNames[entity] ? `Uploaded: ${fileNames[entity]}` : 'Choose file'}
        </label>
        <input
          key={fileNames[entity] || entity}
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          className="border border-gray-400 px-3 py-1"
        />
      </div>

      {fileNames[entity] && data.length > 0 && (
        <DataGrid
          data={data}
          setData={setData}
          validate={(data) => getValidator()(data as BackendRowData[])}
        />
      )}

      {entity === 'tasks' && data.length > 0 && (
        <>
          <RuleBuilder allTasks={taskIDs} rules={rules} setRules={setRules} />

          <div className="space-y-2">
            <label className="block font-semibold">Priority Weight: {weights.priority.toFixed(2)}</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={weights.priority}
              onChange={(e) => setWeights({ ...weights, priority: parseFloat(e.target.value) })}
            />

            <label className="block font-semibold">Fairness Weight: {weights.fairness.toFixed(2)}</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={weights.fairness}
              onChange={(e) => setWeights({ ...weights, fairness: parseFloat(e.target.value) })}
            />

            <label className="block font-semibold">Fulfillment Weight: {weights.fulfillment.toFixed(2)}</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={weights.fulfillment}
              onChange={(e) => setWeights({ ...weights, fulfillment: parseFloat(e.target.value) })}
            />
          </div>
        </>
      )}

      <ExportPanel
        clients={entity === 'clients' ? data : []}
        workers={entity === 'workers' ? data : []}
        tasks={entity === 'tasks' ? data : []}
        rules={rules}
      />

      {entity === 'tasks' && data.length > 0 && rules.length > 0 && (
        <button
          className="bg-purple-600 text-white px-4 py-2 rounded"
          onClick={handleAllocate}
        >
          Run Allocation
        </button>
      )}
    </div>
  )
}
