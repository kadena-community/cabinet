"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { PollDTO } from "./types";
import styles from "@/styles/main.module.css";

interface VoteData {
  name: string;
  [key: string]: number | string;
}

interface VoteImpactBarChartProps {
  poll: PollDTO;
  selectedVote: string | null;
  pollingPower: number;
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

const VoteImpactBarChart: React.FC<VoteImpactBarChartProps> = ({
  poll,
  selectedVote,
  pollingPower,
}) => {
  // Calculate total votes dynamically
  const totalVotes = poll.pollOptions.reduce(
    (acc, option) => acc + option.votesPollingPower,
    0,
  );

  // Get the list of option names, sort them alphabetically
  const optionNames = poll.pollOptions
    .map((option) => option.optionName)
    .sort();

  // Create a mapping from option names to colors
  const colorMap: { [optionName: string]: string } = {};
  optionNames.forEach((optionName, index) => {
    colorMap[optionName] = COLORS[index % COLORS.length];
  });

  // Data for current votes
  const currentData: VoteData[] = [
    poll.pollOptions.reduce(
      (acc, option) => {
        acc[option.optionName] =
          totalVotes > 0 ? (option.votesPollingPower / totalVotes) * 100 : 0;
        return acc;
      },
      { name: "Before" } as VoteData,
    ),
  ];

  // Calculate projected votes based on user selection dynamically
  const projectedData: VoteData[] = [
    poll.pollOptions.reduce(
      (acc, option) => {
        // Calculate projected votes for the current option
        const projectedVotes =
          selectedVote === option.optionName
            ? option.votesPollingPower + pollingPower
            : option.votesPollingPower;

        // Calculate total projected votes
        const totalProjectedVotes = poll.pollOptions.reduce(
          (acc, opt) =>
            acc +
            (selectedVote === opt.optionName
              ? opt.votesPollingPower + pollingPower
              : opt.votesPollingPower),
          0,
        );

        // Calculate the projected percentage for the current option
        acc[option.optionName] =
          totalProjectedVotes > 0
            ? (projectedVotes / totalProjectedVotes) * 100
            : 0;
        return acc;
      },
      { name: "After" } as VoteData,
    ),
  ];

  return (
    <div style={{ width: "100%", height: "200px" }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={selectedVote ? [...currentData, ...projectedData] : currentData}
          layout="vertical"
          margin={{
            top: 20,
            right: 10,
            left: 5,
            bottom: 5,
          }}
        >
          <XAxis type="number" domain={[0, 100]} hide />
          <YAxis type="category" dataKey="name" width={50} axisLine={false} />
          <Tooltip formatter={(value: number) => `${value.toFixed(2)}%`} />
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

export default VoteImpactBarChart;
