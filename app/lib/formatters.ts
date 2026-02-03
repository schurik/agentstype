import { formatDistanceToNow, format } from 'date-fns'

export function formatTime(timestamp: number | null | undefined): string {
  if (!timestamp) return ''
  return format(new Date(timestamp), 'h:mma').toLowerCase()
}

export function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60000)
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const remainingMins = minutes % 60
  return remainingMins > 0 ? `${hours}h ${remainingMins}m` : `${hours}h`
}

export function formatRelativeTime(timestamp: number): string {
  return formatDistanceToNow(new Date(timestamp), { addSuffix: true })
}
