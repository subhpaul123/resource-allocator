'use client'

import {
    ColumnDef,
    getCoreRowModel,
    useReactTable,
    flexRender,
} from '@tanstack/react-table'
import { useEffect, useMemo, useState } from 'react'

import { FrontendRowData } from '../types/frontend'

interface Props {
    data: FrontendRowData[]
    setData: (data: FrontendRowData[]) => void
    validate: (data: FrontendRowData[]) => string[]
}

export default function DataGrid({ data, setData, validate }: Props) {
    const [errors, setErrors] = useState<string[]>([])
    const [errorMap, setErrorMap] = useState<Record<string, Set<number>>>({})

    useEffect(() => {
        const errs = validate(data)
        setErrors(errs)

        // Build error map: fieldName → Set of row indexes with error
        const map: Record<string, Set<number>> = {}
        errs.forEach(err => {
            const match = err.match(/Row (\d+): (.+)/)
            if (match) {
                const row = parseInt(match[1])
                const fieldMatch = match[2].match(/(\w+)/)
                const field = fieldMatch ? fieldMatch[1] : 'unknown'
                if (!map[field]) map[field] = new Set()
                map[field].add(row)
            }
        })
        setErrorMap(map)
    }, [data])

    const columns = useMemo<ColumnDef<FrontendRowData, unknown>[]>(() => {
        if (!data[0]) return []

        return Object.keys(data[0]).map(key => ({
            accessorKey: key,
            header: key,
            cell: ({ row, column }) => {
                const rowIndex = row.index
                const field = column.id
                const value = row.original[field]

                const hasError = errorMap[field]?.has(rowIndex)

                return (
                    <input
                        className={`border px-1 py-0.5 w-full ${hasError ? 'bg-red-100' : ''}`}
                        defaultValue={
                            typeof value === 'object' && value !== null
                                ? JSON.stringify(value)
                                : String(value ?? '')
                        }
                        onBlur={e => {
                            const newVal = e.target.value
                            const updated = [...data]

                            let parsed: string | number | boolean | null | unknown = newVal

                            // Try parsing JSON-like fields
                            if (['RequestedTaskIDs', 'AttributesJSON'].includes(field)) {
                                try {
                                    parsed = JSON.parse(newVal)
                                } catch {
                                    parsed = newVal
                                }
                            }

                            updated[rowIndex] = { ...updated[rowIndex], [field]: parsed as string | number | boolean | null }
                            setData(updated)
                        }}

                    />
                )
            },
        }))
    }, [data, errorMap])

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    })

    return (
        <div className="space-y-4">
            <div className="overflow-x-auto">
                <table className="min-w-full border">
                    <thead>
                        {table.getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map(header => (
                                    <th key={header.id} className="border px-3 py-2 text-left bg-gray-100">
                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody>
                        {table.getRowModel().rows.map(row => (
                            <tr key={row.id}>
                                {row.getVisibleCells().map(cell => (
                                    <td key={cell.id} className="border px-2 py-1">
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {errors.length > 0 && (
                <div className="border border-red-400 bg-red-50 p-3 rounded">
                    <h3 className="font-bold mb-2">Validation Summary</h3>
                    <ul className="list-disc list-inside text-sm text-red-600">
                        {errors.map((e, i) => (
                            <li key={i}>{e}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    )
}
