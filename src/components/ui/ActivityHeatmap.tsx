'use client'

import { useMemo } from 'react'
import { format, startOfWeek, addDays, subDays, isToday } from 'date-fns'

interface ActivityDay {
  date: string
  task_count: number
}

interface ActivityHeatmapProps {
  data: ActivityDay[]
  weeks?: number
}

function getColor(count: number): string {
  if (count === 0) return 'bg-gray-100'
  if (count === 1) return 'bg-emerald-200'
  if (count === 2) return 'bg-emerald-400'
  if (count === 3) return 'bg-emerald-500'
  return 'bg-emerald-700'
}

export default function ActivityHeatmap({ data, weeks = 20 }: ActivityHeatmapProps) {
  const grid = useMemo(() => {
    const dataMap = new Map(data.map(d => [d.date, d.task_count]))
    const today = new Date()
    const endDate = today
    const startDate = subDays(endDate, weeks * 7 - 1)

    const cols: Array<Array<{ date: Date; count: number }>> = []
    let current = startOfWeek(startDate, { weekStartsOn: 0 })

    while (current <= endDate) {
      const col: Array<{ date: Date; count: number }> = []
      for (let d = 0; d < 7; d++) {
        const cellDate = addDays(current, d)
        if (cellDate >= startDate && cellDate <= endDate) {
          const key = format(cellDate, 'yyyy-MM-dd')
          col.push({ date: cellDate, count: dataMap.get(key) ?? 0 })
        } else {
          col.push({ date: cellDate, count: -1 })
        }
      }
      cols.push(col)
      current = addDays(current, 7)
    }

    return cols
  }, [data, weeks])

  const totalTasks = data.reduce((sum, d) => sum + d.task_count, 0)
  const activeDays = data.filter(d => d.task_count > 0).length

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>{totalTasks} tasks completed • {activeDays} active days</span>
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-400">少</span>
          {[0, 1, 2, 3, 4].map(n => (
            <div key={n} className={`w-3 h-3 rounded-sm ${getColor(n)}`} />
          ))}
          <span className="text-xs text-gray-400">多</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {grid.map((col, ci) => (
            <div key={ci} className="flex flex-col gap-1">
              {col.map((cell, ri) => (
                cell.count === -1 ? (
                  <div key={ri} className="w-3 h-3" />
                ) : (
                  <div
                    key={ri}
                    title={`${format(cell.date, 'yyyy/MM/dd')}: ${cell.count} tasks`}
                    className={`w-3 h-3 rounded-sm ${getColor(cell.count)} ${
                      isToday(cell.date) ? 'ring-1 ring-indigo-400 ring-offset-1' : ''
                    } cursor-default`}
                  />
                )
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
