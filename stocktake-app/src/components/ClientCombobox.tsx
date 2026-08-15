'use client'

import { useState, useRef, useEffect } from 'react'

interface Props {
  value: string
  onChange: (v: string) => void
  clients: string[]
  placeholder?: string
  required?: boolean
}

export default function ClientCombobox({ value, onChange, clients, placeholder, required }: Props) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const filtered = value
    ? clients.filter(c => c.toLowerCase().includes(value.toLowerCase()))
    : clients.slice(0, 100)

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
        placeholder={placeholder}
        required={required}
        autoComplete="off"
        className="w-full border border-input rounded-md px-3 h-9 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-background"
      />
      {open && filtered.length > 0 && (
        <ul className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-72 overflow-y-auto">
          {filtered.map(c => (
            <li
              key={c}
              className="px-3 py-2 text-sm cursor-pointer hover:bg-blue-50 select-none"
              onMouseDown={e => {
                e.preventDefault()
                onChange(c)
                setOpen(false)
              }}
            >
              {c}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
