"use client";

import { FC } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { PollDTO } from "@/features/poll/types";
import styles from "@/styles/main.module.css";

// Define an array of colors for the dynamic gradient
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

interface CustomTooltipProps {
  active?: boolean;
  payload?: any;
}

const CustomTooltip: FC<CustomTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className={styles.analyticsTooltip}>
        {payload.map((entry: any, index: number) => (
          <p key={`tooltip-${index}`}>
            {`${entry.name}: ${entry.value.toFixed(2)}%`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const QuorumProgressBar: FC<{ poll: PollDTO }> = ({ poll }) => {
  // Calculate total votes dynamically
  const totalVotes = poll.pollOptions.reduce(
    (acc, option) => acc + option.votesPollingPower,
    0,
  );

  // Calculate the quorum progress percentage
  const quorumProgress = Math.min(
    (totalVotes / poll.quorum) * 100,
    100.0,
  ).toFixed(2);

  // Prepare the data for the chart
  const data = [
    {
      name: "Quorum Progress",
      progress: parseFloat(quorumProgress),
    },
  ];

  return (
    <div className="w-full flex justify-center items-center">
      <ResponsiveContainer width="100%" height={100}>
        <BarChart
          width={150}
          height={40}
          data={data}
          layout="vertical"
          margin={{
            top: 20,
            right: 5,
            left: 85,
            bottom: 5,
          }}
        >
          <defs>
            <linearGradient id="quorumGradient" x1="0" y1="0" x2="1" y2="0">
              {COLORS.map((color, index) => (
                <stop
                  key={index}
                  offset={`${(index / (COLORS.length - 1)) * 100}%`}
                  stopColor={color}
                />
              ))}
            </linearGradient>
          </defs>
          <XAxis type="number" domain={[0, 100]} hide />
          <YAxis type="category" dataKey="name" hide />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            dataKey="progress"
            fill="url(#quorumGradient)"
            background={{ fill: "transparent" }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default QuorumProgressBar;
