'use client'

interface ProjectItemProps {
  name: string
  lastActivity: number
  isSelected: boolean
  isCollapsed: boolean
  onClick: () => void
}

export function ProjectItem({ name, lastActivity, isSelected, isCollapsed, onClick }: ProjectItemProps) {
  // Active if last activity within 5 minutes
  const isActive = Date.now() - lastActivity < 5 * 60 * 1000

  // First letter for collapsed icon
  const initial = name.charAt(0).toUpperCase()

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-left
        ${isSelected ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'}
        ${isCollapsed ? 'justify-center' : ''}`}
      title={isCollapsed ? name : undefined}
    >
      {/* Activity indicator */}
      <span className={`w-2 h-2 rounded-full shrink-0 ${isActive ? 'bg-green-500 animate-pulse' : 'bg-zinc-600'}`} />

      {isCollapsed ? (
        // Icon mode: show initial
        <span className="font-mono text-sm font-medium">{initial}</span>
      ) : (
        // Expanded mode: show full name
        <span className="font-mono text-sm truncate">{name}</span>
      )}
    </button>
  )
}
