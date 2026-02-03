'use client'

interface ThinkingIndicatorProps {
  actionType?: string
}

/**
 * Animated shimmer indicator shown when Claude is processing.
 * The text itself shimmers with a gradient animation.
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
    <div className="flex items-center gap-2 px-3 py-2 mt-3">
      {/* Shimmer text - the text itself has the animated gradient */}
      <span
        className="text-sm font-medium bg-gradient-to-r from-zinc-500 via-zinc-300 to-zinc-500 bg-clip-text text-transparent animate-shimmer"
        style={{
          backgroundSize: '200% 100%',
        }}
      >
        {getLabel()}
      </span>
    </div>
  )
}
