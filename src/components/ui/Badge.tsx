interface BadgeProps {
  label: string
  couleur?: string
  bg?: string
}

export default function Badge({ label, couleur = '#a78bfa', bg }: BadgeProps) {
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ color: couleur, background: bg ?? couleur + '20' }}
    >
      {label}
    </span>
  )
}
