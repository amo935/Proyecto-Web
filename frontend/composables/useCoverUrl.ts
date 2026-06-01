export function getCoverUrl(cover: string | undefined): string {
  if (!cover) return '/images/games/placeholder.jpg'
  if (cover.startsWith('http')) return cover
  return `/images/games/${cover}`
}
