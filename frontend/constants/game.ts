import type { UserGameStatus } from '~/types/user'

export const STATUS_OPTIONS: { value: UserGameStatus; label: string; color: string }[] = [
  { value: 'backlog', label: 'Pendiente', color: 'bg-slate-500' },
  { value: 'playing', label: 'Jugando', color: 'bg-amber-500' },
  { value: 'completed', label: 'Completado', color: 'bg-emerald-500' },
  { value: '100%', label: '100%', color: 'bg-purple-500' },
  { value: 'dropped', label: 'Abandonado', color: 'bg-rose-500' }
]

export const STATUS_LABELS: Record<UserGameStatus, string> = {
  backlog: 'Pendiente',
  playing: 'Jugando',
  completed: 'Completado',
  '100%': 'Completado 100%',
  dropped: 'Abandonado'
}

export const STATUS_COLORS: Record<UserGameStatus, string> = {
  backlog: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  playing: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  completed: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  '100%': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  dropped: 'bg-rose-500/20 text-rose-400 border-rose-500/30'
}

export function getMetacriticColor(score: number): string {
  if (score >= 90) return 'bg-green-600 text-white border-green-500'
  if (score >= 75) return 'bg-yellow-500 text-black border-yellow-400'
  if (score >= 50) return 'bg-orange-500 text-white border-orange-400'
  return 'bg-red-600 text-white border-red-500'
}

export function getTimeColor(hours: number): string {
  if (hours <= 30) return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
  if (hours <= 70) return 'bg-amber-500/20 text-amber-400 border-amber-500/30'
  return 'bg-rose-500/20 text-rose-400 border-rose-500/30'
}

export function formatHours(hours: number): string {
  return `${hours}h`
}
