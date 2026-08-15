'use client'

import { useState, useRef, useEffect } from 'react'

const DEPOTS = [
  'ABX', 'ADL', 'BDB', 'BNE', 'CBR', 'CFS', 'CNS', 'DRW',
  'HBA', 'KTR', 'MEL', 'MGB', 'MKY', 'MQL', 'NTL', 'OAG',
  'PER', 'RMK', 'ROK', 'SYD', 'TAS', 'TSV',
]

interface Props {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}

export default function DeliveryDepotCombobox({ value, onChange, placeholder }: Props) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const filtered = value
    ? DEPOTS.filter(d => d.toLowerCase().includes(value.toLowerCase()))
    : DEPOTS

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
        value={value}
        onChange={e => { onChange(e.target.value); setOpen(true) }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder ?? 'Select depot'}
        autoComplete="off"
        className="w-full border border-input rounded-md px-3 h-9 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-background"
      />
      {open && filtered.length > 0 && (
        <ul className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
          {filtered.map(d => (
            <li
              key={d}
              className="px-3 py-2 text-sm cursor-pointer hover:bg-blue-50 select-none font-mono"
              onMouseDown={e => {
                e.preventDefault()
                onChange(d)
                setOpen(false)
              }}
            >
              {d}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
