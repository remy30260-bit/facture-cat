'use client'

import { type InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  erreur?: string
}

export default function Input({ label, erreur, id, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-xs font-medium" style={{ color: '#c4b5fd' }}>
          {label}
        </label>
      )}
      <input
        id={id}
        {...props}
        className="px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
        style={{
          background: '#1a1a2e',
          border: `1px solid ${erreur ? '#f87171' : '#2d2b55'}`,
          color: 'white',
          ...props.style,
        }}
        onFocus={e => { e.target.style.borderColor = '#7c3aed'; props.onFocus?.(e) }}
        onBlur={e => { e.target.style.borderColor = erreur ? '#f87171' : '#2d2b55'; props.onBlur?.(e) }}
      />
      {erreur && <p className="text-xs" style={{ color: '#f87171' }}>{erreur}</p>}
    </div>
  )
}
