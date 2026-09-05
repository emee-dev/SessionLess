import { useQuery } from "convex/react";
import { ChartNoAxesCombined } from "lucide-react";
import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  XAxis,
  YAxis,
} from "recharts";
import { ChartData } from "recharts/types/state/chartDataSlice";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { api } from "@/convex/_generated/api";
import { ROOM, TRACK } from "@/lib/constant";

type AnalyticsEvent = {
  track?: string;
  room?: string;
  submissions: number;
};

type AnalyticsKey = "track" | "room";

type AnalyticsResult = {
  data: Array<{
    [key: string]: string | number;
    submissions: number;
    fill: string;
  }>;
  config: ChartConfig;
};

export function Charts() {
  const event = useQuery(api.events.getEventBySlug, "skip");

  const trackData = useMemo(() => {
    if (!event) return { data: [], config: {} };

    return renderAnalytics(event.submissionsByTrack, TRACK);
  }, [event]);

  const roomData = useMemo(() => {
    if (!event) return { data: [], config: {} };

    return renderAnalytics(event.submissionsByRoom, ROOM);
  }, [event]);

  return (
    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total submissions</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatNumber(event?.totalSubmissions ?? 0)}
          </CardTitle>
        </CardHeader>

        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 font-medium">
            All submissions received for this event
          </div>
          <div className="text-muted-foreground">
            Includes submissions across all tracks and rooms
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total speakers</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatNumber(event?.totalSpeakers ?? 0)}
          </CardTitle>
        </CardHeader>

        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 font-medium">
            Unique speakers who submitted
          </div>
          <div className="text-muted-foreground">
            Based on all submissions received
          </div>
        </CardFooter>
      </Card>

      <EventAnalytics
        label="Tracks"
        description="See how submissions are distributed across tracks"
        data={trackData.data}
        config={trackData.config}
        selector="track"
      />
      <EventAnalytics
        label="Rooms"
        description="See how submissions are distributed across rooms"
        data={roomData.data}
        config={roomData.config}
        selector="room"
      />
    </div>
  );
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

export function EventAnalytics({
  config,
  data,
  label,
  description,
  selector,
}: {
  data: ChartData;
  config: ChartConfig;
  label: string;
  description?: string;
  selector: "track" | "room";
}) {
  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>{label}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <EmptyChartData />
        ) : (
          <ChartContainer config={config}>
            <BarChart
              accessibilityLayer
              data={data}
              layout="vertical"
              margin={{
                right: 16,
              }}
            >
              <CartesianGrid horizontal={false} />
              <YAxis
                dataKey={selector}
                type="category"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => value.slice(0, 3)}
                hide
              />
              <XAxis dataKey="submissions" type="number" hide />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="line" />}
              />
              {/* <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4}> */}
              <Bar dataKey="submissions" radius={5}>
                <LabelList
                  dataKey={selector}
                  position="insideLeft"
                  offset={8}
                  className="fill-(--color-label)"
                  fontSize={12}
                />
                <LabelList
                  dataKey="submissions"
                  position="insideRight"
                  offset={8}
                  className="fill-foreground"
                  fontSize={12}
                />
              </Bar>
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}

function EmptyChartData() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <ChartNoAxesCombined />
        </EmptyMedia>
        <EmptyTitle>Not Enough Data Yet</EmptyTitle>

        <EmptyDescription>
          There isn&apos;t enough activity for this event to generate meaningful
          analytics yet. Analytics will appear as submissions come in.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

function renderAnalytics(
  events: AnalyticsEvent[],
  selector: AnalyticsKey,
): AnalyticsResult {
  const data = events.map((event) => {
    const value = event[selector] ?? "other";

    return {
      [selector]: value,
      submissions: event.submissions,
      fill: `var(--color-${value})`,
    };
  });

  const config: ChartConfig = {
    submissions: {
      label: "Speakers",
    },

    ...Object.fromEntries(
      events.map((event, index) => {
        const value = event[selector] ?? "other";

        return [
          value,
          {
            label: value.charAt(0).toUpperCase() + value.slice(1),
            color: `var(--chart-${(index % 2) + 1})`,
          },
        ];
      }),
    ),
  };

  return { data, config };
}
