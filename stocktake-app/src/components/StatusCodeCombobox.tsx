'use client'

import { useState, useRef, useEffect } from 'react'
import { STATUS_CODES } from '@/lib/constants'

interface Props {
  value: string
  onChange: (v: string) => void
}

export default function StatusCodeCombobox({ value, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const filtered = value
    ? STATUS_CODES.filter(s =>
        s.code.toLowerCase().includes(value.toLowerCase()) ||
        s.description.toLowerCase().includes(value.toLowerCase())
      )
    : STATUS_CODES

  const displayValue = value
    ? STATUS_CODES.find(s => s.code === value)
      ? value
      : value
    : ''

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        value={displayValue}
        onChange={e => { onChange(e.target.value); setOpen(true) }}
        onFocus={() => setOpen(true)}
        placeholder="Type code or description…"
        autoComplete="off"
        className="w-full border border-input rounded-md px-3 h-9 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-background font-mono"
      />
      {open && filtered.length > 0 && (
        <ul className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
          {filtered.map(s => (
            <li
              key={s.code}
              className="px-3 py-2 text-sm cursor-pointer hover:bg-blue-50 select-none flex items-baseline gap-2"
              onMouseDown={e => {
                e.preventDefault()
                onChange(s.code)
                setOpen(false)
              }}
            >
              <span className="font-mono font-semibold w-14 shrink-0">{s.code}</span>
              <span className="text-slate-500 truncate">{s.description}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
