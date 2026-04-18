import { Suspense } from "react";
import {
  TopicGroup,
  DateStepper,
  SectionDivider,
  CaughtUpState,
  ArchiveBanner,
  StatusBar,
  PendingSection,
  TriageSection,
  BriefingDebugBox,
} from "@/components/features/briefing";
import type { TopicGroupData } from "@/types";
import type { TriageArticle } from "./TriageCard";

interface PendingArticle {
  id: number;
  title: string;
  publishedAt: string | null;
  source: { name: string };
}

interface DebugInfo {
  windowStart: string;
  windowEnd: string;
  articleCount: number;
  latestEnrichedAt: string | null;
  totalInWindow: number;
  unenrichedInWindow: number;
  lowScoreInWindow: number;
}

interface LiveModeProps {
  isArchiveMode: false;
  watermark: Date;
  watermarkLabel: string;
  newTopicGroups: TopicGroupData[];
  reviewedTopicGroups: TopicGroupData[];
  pendingArticles: PendingArticle[];
  triageArticles: TriageArticle[];
  lastEnrichedAt: string | null;
  debug?: DebugInfo;
}

interface ArchiveModeProps {
  isArchiveMode: true;
  archiveDate: Date;
  topicGroups: TopicGroupData[];
}

export type BriefingPageContentProps = LiveModeProps | ArchiveModeProps;

export function BriefingPageContent(props: BriefingPageContentProps): React.ReactElement {
  if (props.isArchiveMode) {
    return (
      <div className="reading-container py-6">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
          <h1 className="text-lg font-semibold text-(--foreground)">
            Daily Briefing
          </h1>
          <Suspense fallback={<div className="h-8 w-[120px]" />}>
            <DateStepper />
          </Suspense>
        </div>

        <ArchiveBanner date={props.archiveDate} />

        {props.topicGroups.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-sm font-semibold text-(--foreground)">
              No briefing for this day
            </p>
            <p className="text-base text-(--muted-foreground) mt-1">
              No enriched articles were published on this date.
            </p>
          </div>
        ) : (
          <div className="space-y-16">
            {props.topicGroups.map((group) => (
              <TopicGroup key={group.topic} group={group} />
            ))}
          </div>
        )}
      </div>
    );
  }

  const {
    watermark,
    watermarkLabel,
    newTopicGroups,
    reviewedTopicGroups,
    pendingArticles,
    triageArticles,
    lastEnrichedAt,
    debug,
  } = props;

  return (
    <div className="reading-container py-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-lg font-semibold text-(--foreground)">
          Daily Briefing
        </h1>
        <Suspense fallback={<div className="h-8 w-[120px]" />}>
          <DateStepper />
        </Suspense>
      </div>

      {debug && <BriefingDebugBox {...debug} />}

      <StatusBar
        newCount={newTopicGroups.reduce((sum, g) => sum + g.articles.length, 0)}
        lastVisit={watermark}
        lastEnrichedAt={lastEnrichedAt}
        pendingCount={pendingArticles.length}
      />

      <TriageSection
        key={triageArticles.map((a) => a.id).join(",")}
        articles={triageArticles}
      />

      <PendingSection articles={pendingArticles} />

      {newTopicGroups.length === 0 ? (
        <>
          <CaughtUpState lastVisit={watermark.toISOString()} />
          {reviewedTopicGroups.length > 0 && (
            <>
              <SectionDivider label="Already reviewed" variant="reviewed" />
              <div className="space-y-16 text-(--muted-foreground)">
                {reviewedTopicGroups.map((group) => (
                  <TopicGroup key={group.topic} group={group} />
                ))}
              </div>
            </>
          )}
        </>
      ) : (
        <>
          <SectionDivider label={`New since ${watermarkLabel}`} variant="new" />
          <div className="space-y-16">
            {newTopicGroups.map((group) => (
              <TopicGroup key={group.topic} group={group} isNew />
            ))}
          </div>

          {reviewedTopicGroups.length > 0 && (
            <>
              <SectionDivider label="Already reviewed" variant="reviewed" />
              <div className="space-y-16 text-(--muted-foreground)">
                {reviewedTopicGroups.map((group) => (
                  <TopicGroup key={group.topic} group={group} />
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
