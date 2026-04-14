'use client'

import { Search } from 'lucide-react'

interface SearchBarProps {
  valeur: string
  onChange: (v: string) => void
  placeholder?: string
}

export default function SearchBar({ valeur, onChange, placeholder = 'Rechercher...' }: SearchBarProps) {
  return (
    <div className="relative">
      <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#6b6a8a' }} />
      <input
        type="search"
        value={valeur}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-9 pr-4 py-2 rounded-xl text-sm outline-none transition-all w-full"
        style={{ background: '#16213e', border: '1px solid #2d2b55', color: 'white' }}
        onFocus={e => (e.target.style.borderColor = '#7c3aed')}
        onBlur={e => (e.target.style.borderColor = '#2d2b55')}
      />
    </div>
  )
}
