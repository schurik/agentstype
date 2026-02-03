'use client'

interface ThinkingIndicatorProps {
  actionType?: string
}

/**
 * Animated shimmer indicator shown when Claude is processing.
 * Displays a shimmer bar with contextual action label.
 *
 * @param actionType - Optional tool/action context (e.g., "Edit", "Bash")
 */
export function ThinkingIndicator({ actionType }: ThinkingIndicatorProps) {
  // Generate context-aware label based on action type
  const getLabel = () => {
    if (!actionType) return 'Thinking...'
    switch (actionType) {
      case 'Read':
        return 'Reading files...'
      case 'Write':
        return 'Writing files...'
      case 'Edit':
        return 'Editing code...'
      case 'Bash':
        return 'Running command...'
      case 'Grep':
        return 'Searching...'
      case 'Glob':
        return 'Finding files...'
      default:
        return `Using ${actionType}...`
    }
  }

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-zinc-800/50 rounded-md mt-3">
      {/* Shimmer bar */}
      <div className="relative h-2 w-24 bg-zinc-700 rounded overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-700 via-zinc-500 to-zinc-700 animate-shimmer" />
      </div>
      <span className="text-sm text-zinc-400">{getLabel()}</span>
    </div>
  )
}
