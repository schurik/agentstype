'use client'

interface AgentItemProps {
  agentId: string
  agentType: string | null
  eventCount: number
  isSelected: boolean
  isCollapsed: boolean
  onClick: () => void
}

export function AgentItem({
  agentType,
  eventCount,
  isSelected,
  isCollapsed,
  onClick,
}: AgentItemProps) {
  const label = agentType || 'Agent'

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2 px-2 py-1.5 rounded transition-colors text-left pl-10
        ${isSelected ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'}
        ${isCollapsed ? 'justify-center pl-2' : ''}`}
      title={label}
    >
      {/* Robot icon */}
      <svg
        className="w-3.5 h-3.5 shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6m-6 4h6"
        />
      </svg>

      {!isCollapsed && (
        <>
          {/* Label */}
          <span className="font-mono text-xs truncate flex-1">{label}</span>

          {/* Event count badge */}
          <span className="text-[10px] text-zinc-500 bg-zinc-800 px-1.5 py-0.5 rounded-full">
            {eventCount}
          </span>
        </>
      )}
    </button>
  )
}
