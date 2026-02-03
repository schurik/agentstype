'use client'

import { SessionItem } from './SessionItem'
import { AgentItem } from './AgentItem'

interface Session {
  sessionId: string
  firstTimestamp: number
  lastTimestamp: number
  eventCount: number
  goal: string | null
  hasEnded: boolean
}

interface Agent {
  agentId: string
  agentType: string | null
  eventCount: number
}

interface ProjectItemProps {
  name: string
  lastActivity: number
  isSelected: boolean
  isCollapsed: boolean
  isExpanded: boolean
  onToggleExpand: () => void
  onClick: () => void
  sessions: Session[] | undefined
  selectedSession: string | null
  onSelectSession: (sessionId: string) => void
  agents: Agent[] | undefined
  selectedAgent: string | null
  onSelectAgent: (agentId: string | null) => void
}

export function ProjectItem({
  name,
  lastActivity,
  isSelected,
  isCollapsed,
  isExpanded,
  onToggleExpand,
  onClick,
  sessions,
  selectedSession,
  onSelectSession,
  agents,
  selectedAgent,
  onSelectAgent,
}: ProjectItemProps) {
  // Active if last activity within 5 minutes
  const isActive = Date.now() - lastActivity < 5 * 60 * 1000

  // First letter for collapsed icon
  const initial = name.charAt(0).toUpperCase()

  const handleProjectClick = () => {
    onClick()
    if (!isExpanded) {
      onToggleExpand()
    }
  }

  const handleChevronClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onToggleExpand()
  }

  return (
    <div>
      {/* Project row */}
      <button
        onClick={handleProjectClick}
        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-left
          ${isSelected ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'}
          ${isCollapsed ? 'justify-center' : ''}`}
        title={isCollapsed ? name : undefined}
      >
        {/* Expand/collapse chevron */}
        {!isCollapsed && (
          <span
            onClick={handleChevronClick}
            className="w-4 h-4 flex items-center justify-center shrink-0 hover:text-zinc-100"
          >
            <svg
              className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        )}

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

      {/* Sessions list (when expanded) */}
      {isExpanded && !isCollapsed && (
        <div className="mt-1 space-y-0.5">
          {sessions === undefined ? (
            // Loading shimmer
            <div className="pl-6 space-y-1">
              {[1, 2].map(i => (
                <div key={i} className="h-7 bg-zinc-800 rounded animate-pulse" />
              ))}
            </div>
          ) : sessions.length === 0 ? (
            // Empty state
            <p className="text-[10px] text-zinc-600 pl-6 py-1">No sessions</p>
          ) : (
            // Sessions
            sessions.map(session => (
              <div key={session.sessionId}>
                <SessionItem
                  sessionId={session.sessionId}
                  goal={session.goal}
                  firstTimestamp={session.firstTimestamp}
                  hasEnded={session.hasEnded}
                  eventCount={session.eventCount}
                  isSelected={selectedSession === session.sessionId}
                  isCollapsed={false}
                  onClick={() => onSelectSession(session.sessionId)}
                />

                {/* Agents list (when session is selected) */}
                {selectedSession === session.sessionId && agents !== undefined && agents.length > 0 && (
                  <div className="mt-0.5 space-y-0.5">
                    {agents.map(agent => (
                      <AgentItem
                        key={agent.agentId}
                        agentId={agent.agentId}
                        agentType={agent.agentType}
                        eventCount={agent.eventCount}
                        isSelected={selectedAgent === agent.agentId}
                        isCollapsed={false}
                        onClick={() => onSelectAgent(
                          selectedAgent === agent.agentId ? null : agent.agentId
                        )}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
