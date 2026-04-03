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
        className="min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="text-sm font-semibold min-w-[80px] sm:min-w-[120px] text-center text-(--foreground)">
        {isToday(currentDate)
          ? "Today"
          : <><span className="sm:hidden">{format(currentDate, "MMM d")}</span><span className="hidden sm:inline">{format(currentDate, "MMM d, yyyy")}</span></>
        }
      </span>
      <Button
        variant="outline"
        size="icon"
        onClick={() => goTo(addDays(currentDate, 1))}
        disabled={isToday(currentDate)}
        aria-label="Next day"
        className="min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
