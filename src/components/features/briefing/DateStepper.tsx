"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  format,
  subDays,
  addDays,
  isToday,
  parseISO,
  isValid,
} from "date-fns";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function DateStepper() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dateParam = searchParams.get("date");

  const parsed = dateParam ? parseISO(dateParam) : null;
  const currentDate =
    parsed && isValid(parsed) ? parsed : new Date();

  function goTo(date: Date) {
    if (isToday(date)) {
      router.push("/briefing");
    } else {
      router.push(`/briefing?date=${format(date, "yyyy-MM-dd")}`);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={() => goTo(subDays(currentDate, 1))}
        aria-label="Previous day"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="text-sm font-semibold min-w-[120px] text-center text-[var(--foreground)]">
        {isToday(currentDate) ? "Today" : format(currentDate, "MMM d, yyyy")}
      </span>
      <Button
        variant="outline"
        size="icon"
        onClick={() => goTo(addDays(currentDate, 1))}
        disabled={isToday(currentDate)}
        aria-label="Next day"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
      {!isToday(currentDate) && (
        <Button variant="ghost" size="sm" onClick={() => goTo(new Date())}>
          Today
        </Button>
      )}
    </div>
  );
}
