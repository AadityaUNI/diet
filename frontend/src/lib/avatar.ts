// DiceBear avatar API (https://www.dicebear.com). The seed makes the avatar
// random per user but stable across reloads.
const DICEBEAR_BASE = "https://api.dicebear.com/9.x/avataaars/svg"

// `size` is the rendered CSS size in px; request 2x so it stays crisp on retina.
export function getAvatarUrl(seed: string, size: number): string {
  const params = new URLSearchParams({
    seed,
    size: String(size * 2),
    radius: "50",
    backgroundType: "gradientLinear",
    backgroundColor: "b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf",
  })
  return `${DICEBEAR_BASE}?${params.toString()}`
}

export function getInitials(name?: string | null): string {
  if (!name) return "?"
  const parts = name.trim().split(/\s+/).filter(Boolean)
  const initials = parts.slice(0, 2).map((part) => part[0]).join("")
  return initials.toUpperCase() || "?"
}
