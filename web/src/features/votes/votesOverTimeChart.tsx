import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useAppSelector } from "@/app/hooks";
import { selectVotesOverTime, selectDisplayPollingPower } from "./votesSlice";
import { AppLoader } from "@/features/components/Loader";
import styles from "@/styles/main.module.css";

const COLORS = [
  "#4A9079", // k-Green-default
  "#E41968", // k-Pink-default
  "#E27B38", // k-Orange-default
  "#F0EAE6", // k-Cream-default
  "#ACB4BA", // dark-blue-200
  "#EDC4AB", // k-Ltorange-default
  "#C4E9DD", // k-Green-200
  "#FFA3C3", // lighter-pink
  "#436270", // medium-blue
  "#071D2F", // dark-blue-default
];

const VotesOverTimeAreaChart: React.FC = () => {
  const votesOverTime = useAppSelector(selectVotesOverTime);
  const displayPollingPower = useAppSelector(selectDisplayPollingPower);

  if (!votesOverTime) {
    return (
      <div>
        <AppLoader active={true} size="16px" stroke="#E27B38" />
      </div>
    );
  }

  // Corrected CustomTooltip component
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const date = payload[0].payload.date; // Extract date once
      return (
        <div className={styles.analyticsTooltip}>
          <p>{date}:</p>
          {payload.map((entry: any, index: number) => (
            <p key={`tooltip-${index}`}>
              {`${entry.name}: ${entry.value.toLocaleString("en-US", {
                style: "decimal",
                maximumFractionDigits: 2,
              })}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Extract all unique voting options (actions) and sort them alphabetically
  const uniqueActions = Array.from(
    new Set(votesOverTime.map((vote) => vote.action)),
  )
    .sort()
    .reverse();

  // Create a mapping from action names to colors
  const colorMap: { [action: string]: string } = {};
  uniqueActions.forEach((action, index) => {
    colorMap[action] = COLORS[index % COLORS.length];
  });

  // Transform the votesOverTime data to aggregate values by date and voting option
  const data = votesOverTime.reduce((acc: any[], vote) => {
    const date = new Date(vote.date).toLocaleDateString();
    let existing = acc.find((item) => item.date === date);

    if (!existing) {
      existing = { date };
      acc.push(existing);
    }

    uniqueActions.forEach((action) => {
      existing[action] = existing[action] || 0;
    });

    existing[vote.action] = displayPollingPower
      ? (existing[vote.action] || 0) + vote.pollingPower
      : (existing[vote.action] || 0) + vote.voteCount;

    return acc;
  }, []);

  // Sort the data by date
  const sortedData = data.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  // Custom legend component to ensure consistent line colors and display all options
  const CustomLegend = ({ payload }: any) => (
    <div style={{ display: "flex", justifyContent: "center", marginTop: 10 }}>
      {uniqueActions.map((action, index) => (
        <div
          key={`legend-item-${index}`}
          style={{ display: "flex", alignItems: "center", marginRight: 15 }}
        >
          <div
            style={{
              width: 12,
              height: 12,
              backgroundColor: colorMap[action],
              marginRight: 5,
            }}
          />
          <span style={{ color: "var(--color-text)" }}>{action}</span>
        </div>
      ))}
    </div>
  );

  return (
    <div>
      <h2 className="text-lg font-semibold mb-2 whitespace-nowrap">
        {displayPollingPower ? "Voting Power Over Time" : "Votes Over Time"}
      </h2>
      <ResponsiveContainer width="100%" height={500}>
        <AreaChart
          data={sortedData}
          margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
        >
          <XAxis
            dataKey="date"
            tick={false}
            axisLine={{ stroke: "var(--color-axis)" }}
            label={{
              value: "Date",
              position: "insideBottom",
              offset: 10,
              fill: "var(--color-axis)",
            }}
          />
          <YAxis
            tick={{ fill: "var(--color-axis)" }}
            axisLine={{ stroke: "var(--color-axis)" }}
          />
          <Tooltip content={<CustomTooltip />} />
          {/* Uncomment Legend if needed */}
          {/* <Legend content={<CustomLegend />} /> */}
          {/* Render areas dynamically based on unique actions, using consistent colors */}
          {uniqueActions.map((action) => (
            <Area
              key={action}
              type="monotone"
              dataKey={action}
              stackId="1"
              stroke={colorMap[action]}
              fill={colorMap[action]}
              fillOpacity={0.6} // Adjust the opacity for better visibility in overlapping areas
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default VotesOverTimeAreaChart;
