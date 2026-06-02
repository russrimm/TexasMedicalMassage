import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function Stars({
  rating,
  count,
  size = 14,
  showCount = true,
}: {
  rating: number;
  count?: number;
  size?: number;
  showCount?: boolean;
}) {
  const full = Math.round(rating);
  return (
    <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
      <span className="inline-flex" aria-label={`${rating} of 5`}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            width={size}
            height={size}
            className={cn(
              i <= full ? "fill-yellow-500 stroke-yellow-500" : "stroke-muted-foreground",
            )}
          />
        ))}
      </span>
      {showCount && count != null ? <span>({count})</span> : null}
    </span>
  );
}
