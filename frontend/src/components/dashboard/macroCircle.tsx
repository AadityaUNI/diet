import { cn } from "@/lib/utils"

interface CircleProps {
  filled: number
  capacity: number
  colorClass: string
}

export default function MacroCircle({
  filled,
  capacity,
  colorClass,
}: CircleProps) {
  const percentFilled = Math.min(
    100,
    Math.max(0, (filled / capacity) * 100)
  )

  return (
    // Fixed h-15/w-15 to standard h-16/w-16. Added dark empty state styling.
    <div className="relative h-12 w-12 lg:h-16 lg:w-16 rounded-full overflow-hidden border-2 border-slate-700 bg-slate-800 shadow-inner">
      <div
        className={cn(
          "absolute bottom-0 left-0 w-full transition-all duration-500 ease-out",
          colorClass
        )}
        style={{ height: `${percentFilled}%` }}
      />
      {/* Optional: Adds a slight gradient overlay to make the fill look less flat */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
    </div>
  )
}