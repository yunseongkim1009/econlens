"use client";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import type { Period } from "@/types/economics";
export function usePeriod(): Period {
  const selected = useSearchParams().get("period");
  return selected === "5" || selected === "20" || selected === "max"
    ? selected
    : "10";
}
export function PeriodSelector() {
  const period = usePeriod();
  const params = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  return (
    <div className="period-control" role="group" aria-label="Chart time range">
      {(["5", "10", "20", "max"] as Period[]).map((p) => (
        <button
          key={p}
          aria-pressed={p === period}
          onClick={() => {
            const next = new URLSearchParams(params.toString());
            next.set("period", p);
            router.replace(`${pathname}?${next}`, { scroll: false });
          }}
        >
          {p === "max" ? "MAX" : `${p}Y`}
        </button>
      ))}
    </div>
  );
}
