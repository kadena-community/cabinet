"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
} from "recharts";
import { PollDTO } from "./types";
import styles from "@/styles/main.module.css";

interface VoteData {
  name: string;
  [key: string]: number | string;
}

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

interface CustomTooltipProps extends TooltipProps<number, string> {
  active?: boolean;
  payload?: any;
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  label,
}) => {
  if (active && payload && payload.length) {
    return (
      <div className={styles.analyticsTooltip}>
        {payload.map((entry: any, index: number) => (
          <p key={`tooltip-${index}`}>
            {`${entry.name}: ${entry.value.toLocaleString("en-US", {
              style: "decimal",
              maximumFractionDigits: 2,
            })}%`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

interface VoteDistributionBarChartProps {
  poll: PollDTO;
}

const VoteDistributionBarChart: React.FC<VoteDistributionBarChartProps> = ({
  poll,
}) => {
  // Calculate total votes dynamically
  const totalVotes = poll.pollOptions.reduce(
    (acc, option) => acc + option.votesPollingPower,
    0,
  );

  // Get the list of option names, sort them alphabetically
  const optionNames = poll.pollOptions
    .map((option) => option.optionName)
    .sort()
    .reverse();

  // Create a mapping from option names to colors
  const colorMap: { [optionName: string]: string } = {};
  optionNames.forEach((optionName, index) => {
    colorMap[optionName] = COLORS[index % COLORS.length];
  });

  // Construct the data for the chart dynamically
  const data: VoteData[] = [
    poll.pollOptions.reduce(
      (acc, option) => {
        acc[option.optionName] =
          totalVotes > 0 ? (option.votesPollingPower / totalVotes) * 100 : 0;
        return acc;
      },
      { name: "Votes" } as VoteData,
    ),
  ];

  return (
    <div style={{ width: "100%", height: "100px" }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical">
          <XAxis type="number" domain={[0, 100]} tick={false} hide />
          <YAxis
            type="category"
            dataKey="name"
            tick={false}
            width={80}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          {/* Render bars dynamically based on options, using consistent colors */}
          {optionNames.map((optionName) => (
            <Bar
              key={optionName}
              dataKey={optionName}
              fill={colorMap[optionName]}
              stackId="a"
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default VoteDistributionBarChart;
