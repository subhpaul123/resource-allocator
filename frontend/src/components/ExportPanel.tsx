'use client'

import { FrontendRowData } from '../types/frontend'
import { Rule } from '../types/rules'
import { downloadCSV, downloadJSON } from '../lib/export'

interface ExportPanelProps {
    clients: FrontendRowData[]
    workers: FrontendRowData[]
    tasks: FrontendRowData[]
    rules: Rule[]
}

export default function ExportPanel({ clients, workers, tasks, rules }: ExportPanelProps) {
    return (
        <div className="mt-8 border-t pt-4 space-y-3">
            <h2 className="text-xl font-semibold">Export</h2>
            <div className="flex gap-3 flex-wrap">
                <button
                    className="bg-blue-600 text-white px-3 py-1 rounded"
                    onClick={() => downloadCSV('clients.csv', clients)}
                >
                    Export Clients
                </button>
                <button
                    className="bg-blue-600 text-white px-3 py-1 rounded"
                    onClick={() => downloadCSV('workers.csv', workers)}
                >
                    Export Workers
                </button>
                <button
                    className="bg-blue-600 text-white px-3 py-1 rounded"
                    onClick={() => downloadCSV('tasks.csv', tasks)}
                >
                    Export Tasks
                </button>
                <button
                    className="bg-green-600 text-white px-3 py-1 rounded"
                    onClick={() => downloadJSON('rules.json', rules)}
                >
                    Export Rules
                </button>
            </div>
        </div>
    )
}
