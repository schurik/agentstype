'use client'

import type { Doc } from '@/convex/_generated/dataModel'

type Event = Doc<'events'>

interface CurrentlyIndicatorProps {
  event: Event | null
  isReceivingEvents: boolean
}

/**
 * Generate a human-readable summary of what Claude is currently doing
 */
function getSummary(event: Event): string {
  const tool = event.tool?.toLowerCase()

  // Extract file path if available
  const filePath = event.toolInput &&
    typeof event.toolInput === 'object' &&
    'file_path' in event.toolInput
    ? (event.toolInput as { file_path: string }).file_path
    : null

  // Extract command if Bash
  const command = event.toolInput &&
    typeof event.toolInput === 'object' &&
    'command' in event.toolInput
    ? (event.toolInput as { command: string }).command
    : null

  switch (tool) {
    case 'read':
      return filePath ? `Reading ${shortenPath(filePath)}` : 'Reading file'
    case 'write':
      return filePath ? `Writing ${shortenPath(filePath)}` : 'Writing file'
    case 'edit':
      return filePath ? `Editing ${shortenPath(filePath)}` : 'Editing file'
    case 'bash':
      return command ? `Running ${shortenCommand(command)}` : 'Running command'
    case 'glob':
      return 'Searching for files'
    case 'grep':
      return 'Searching file contents'
    default:
      if (event.type === 'user_prompt_submit') {
        return 'Processing prompt'
      }
      if (event.type === 'session_start') {
        return 'Session started'
      }
      return event.tool || event.type || 'Working...'
  }
}

function shortenPath(path: string): string {
  const parts = path.split('/')
  if (parts.length <= 3) return path
  return `${parts[0]}/.../${parts[parts.length - 1]}`
}

function shortenCommand(command: string): string {
  const firstLine = command.split('\n')[0]
  if (firstLine.length <= 40) return firstLine
  return firstLine.slice(0, 37) + '...'
}

export function CurrentlyIndicator({ event, isReceivingEvents }: CurrentlyIndicatorProps) {
  if (!event) return null

  const summary = getSummary(event)

  return (
    <div className="sticky top-0 z-10 bg-zinc-900/95 backdrop-blur border-b border-zinc-800 px-4 py-2">
      <div className="flex items-center gap-2">
        {/* Activity dot with conditional pulse */}
        <span
          className={`w-2 h-2 rounded-full shrink-0 ${
            isReceivingEvents ? 'bg-green-500 animate-pulse' : 'bg-zinc-600'
          }`}
        />
        <span className="text-sm text-zinc-300 truncate">
          {summary}
        </span>
      </div>
    </div>
  )
}
