'use client'

import { type ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: 'primary' | 'secondary' | 'ghost' | 'danger'
  taille?: 'sm' | 'md' | 'lg'
  chargement?: boolean
}

const styles = {
  primary: { background: '#7c3aed', color: 'white', border: 'none' },
  secondary: { background: 'transparent', color: '#c4b5fd', border: '1px solid #2d2b55' },
  ghost: { background: 'transparent', color: '#8b8aad', border: 'none' },
  danger: { background: 'rgba(248,113,113,0.1)', color: '#f87171', border: '1px solid rgba(248,113,113,0.3)' },
}

const tailles = {
  sm: 'px-3 py-1.5 text-xs rounded-lg',
  md: 'px-4 py-2 text-sm rounded-xl',
  lg: 'px-6 py-3 text-sm rounded-xl',
}

export default function Button({
  variante = 'primary',
  taille = 'md',
  chargement = false,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || chargement}
      className={`inline-flex items-center gap-2 font-medium transition-all ${tailles[taille]} ${props.className ?? ''}`}
      style={{ ...styles[variante], opacity: disabled || chargement ? 0.6 : 1, cursor: disabled || chargement ? 'not-allowed' : 'pointer' }}
    >
      {chargement ? (
        <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
        </svg>
      ) : null}
      {children}
    </button>
  )
}
