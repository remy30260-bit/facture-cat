'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  page: number
  totalPages: number
  onPage: (p: number) => void
}

export default function Pagination({ page, totalPages, onPage }: PaginationProps) {
  if (totalPages <= 1) return null
  return (
    <div className="flex items-center gap-2 justify-end mt-4">
      <button
        onClick={() => onPage(page - 1)}
        disabled={page === 1}
        className="p-1.5 rounded-lg transition-all"
        style={{ color: '#8b8aad', border: '1px solid #2d2b55', opacity: page === 1 ? 0.4 : 1 }}
      >
        <ChevronLeft size={14} />
      </button>
      <span className="text-xs" style={{ color: '#8b8aad' }}>
        Page {page} / {totalPages}
      </span>
      <button
        onClick={() => onPage(page + 1)}
        disabled={page === totalPages}
        className="p-1.5 rounded-lg transition-all"
        style={{ color: '#8b8aad', border: '1px solid #2d2b55', opacity: page === totalPages ? 0.4 : 1 }}
      >
        <ChevronRight size={14} />
      </button>
    </div>
  )
}
