'use client'

import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { useEffect, useState, useCallback } from 'react'
import { useProjectFilter } from '@/app/hooks/useProjectFilter'
import { useSessionFilter } from '@/app/hooks/useSessionFilter'
import { useAgentFilter } from '@/app/hooks/useAgentFilter'
import { useSidebarCollapse } from '@/app/hooks/useSidebarCollapse'
import { ProjectItem } from './ProjectItem'

export function ProjectSidebar() {
  const [selectedProject, setSelectedProject] = useProjectFilter()
  const [selectedSession, setSelectedSession] = useSessionFilter()
  const [selectedAgent, setSelectedAgent] = useAgentFilter()
  const { isCollapsed, toggle, hasMounted } = useSidebarCollapse()
  const projects = useQuery(api.events.listProjects)

  // Track which projects are expanded
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set())

  // Conditionally fetch sessions when project is selected
  const sessions = useQuery(
    api.events.listSessionsForProject,
    selectedProject ? { projectName: selectedProject } : 'skip'
  )

  // Conditionally fetch agents when session is selected
  const agents = useQuery(
    api.events.listAgentsForSession,
    selectedSession ? { sessionId: selectedSession } : 'skip'
  )

  // Keyboard shortcut: Cmd/Ctrl + B to toggle
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault()
        toggle()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [toggle])

  // Auto-select most recent project if none selected
  useEffect(() => {
    if (projects && projects.length > 0 && !selectedProject) {
      setSelectedProject(projects[0].name)
    }
  }, [projects, selectedProject, setSelectedProject])

  // Auto-expand selected project
  useEffect(() => {
    if (selectedProject) {
      setExpandedProjects(prev => {
        if (prev.has(selectedProject)) return prev
        const next = new Set(prev)
        next.add(selectedProject)
        return next
      })
    }
  }, [selectedProject])

  // Clear session and agent when project changes
  const handleSelectProject = useCallback((projectName: string) => {
    if (projectName !== selectedProject) {
      setSelectedSession(null)
      setSelectedAgent(null)
    }
    setSelectedProject(projectName)
  }, [selectedProject, setSelectedProject, setSelectedSession, setSelectedAgent])

  // Clear agent when session is selected (always clear to show all session events)
  const handleSelectSession = useCallback((sessionId: string) => {
    // Always clear agent when clicking a session to show all session events
    setSelectedAgent(null)
    setSelectedSession(sessionId)
  }, [setSelectedSession, setSelectedAgent])

  // Toggle agent selection
  const handleSelectAgent = useCallback((agentId: string | null) => {
    setSelectedAgent(agentId)
  }, [setSelectedAgent])

  // Toggle project expansion
  const toggleProjectExpand = useCallback((projectName: string) => {
    setExpandedProjects(prev => {
      const next = new Set(prev)
      if (next.has(projectName)) {
        next.delete(projectName)
      } else {
        next.add(projectName)
      }
      return next
    })
  }, [])

  // Prevent hydration mismatch
  if (!hasMounted) {
    return (
      <aside className={`bg-zinc-900 border-r border-zinc-800 flex flex-col ${isCollapsed ? 'w-14' : 'w-48'}`}>
        <div className="flex-1 p-2" />
      </aside>
    )
  }

  return (
    <aside className={`bg-zinc-900 border-r border-zinc-800 flex flex-col transition-[width] duration-200 ${isCollapsed ? 'w-14' : 'w-56'}`}>
      {/* Header */}
      {!isCollapsed && (
        <div className="px-3 py-3 border-b border-zinc-800">
          <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Projects</h2>
        </div>
      )}

      {/* Project list */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {projects === undefined ? (
          // Loading
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-9 bg-zinc-800 rounded animate-pulse" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          // Empty
          !isCollapsed && (
            <p className="text-xs text-zinc-600 px-2">No projects yet</p>
          )
        ) : (
          // Projects
          projects.map(project => (
            <ProjectItem
              key={project.name}
              name={project.name}
              lastActivity={project.lastActivity}
              isSelected={selectedProject === project.name}
              isCollapsed={isCollapsed}
              isExpanded={expandedProjects.has(project.name)}
              onToggleExpand={() => toggleProjectExpand(project.name)}
              onClick={() => handleSelectProject(project.name)}
              sessions={selectedProject === project.name ? sessions : undefined}
              selectedSession={selectedSession}
              onSelectSession={handleSelectSession}
              agents={selectedSession && selectedProject === project.name ? agents : undefined}
              selectedAgent={selectedAgent}
              onSelectAgent={handleSelectAgent}
            />
          ))
        )}
      </nav>

      {/* Collapse toggle */}
      <div className="p-2 border-t border-zinc-800">
        <button
          onClick={toggle}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 rounded transition-colors"
          title={isCollapsed ? 'Expand sidebar (Cmd+B)' : 'Collapse sidebar (Cmd+B)'}
        >
          <svg
            className={`w-4 h-4 transition-transform ${isCollapsed ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
          {!isCollapsed && <span className="text-xs">Collapse</span>}
        </button>
      </div>
    </aside>
  )
}
