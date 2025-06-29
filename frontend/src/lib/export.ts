import { Rule } from '../types/rules'
import { FrontendRowData } from '../types/frontend'

export function downloadJSON(filename: string, data: unknown) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    triggerDownload(url, filename)
}

export function downloadCSV(filename: string, rows: FrontendRowData[]) {
    const headers = Object.keys(rows[0])
    const csv = [
        headers.join(','),
        ...rows.map(row => headers.map(h => JSON.stringify(row[h] ?? '')).join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    triggerDownload(url, filename)
}

function triggerDownload(url: string, filename: string) {
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
}
