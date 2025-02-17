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
import styles from "../../styles/main.module.css"; // Ensure your styles are imported

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

const QuorumProgressBar: FC<{ poll: PollDTO; pollingPower: number }> = ({
  poll,
  pollingPower,
}) => {
  const totalPreviousVotes = poll.pollOptions.reduce(
    (acc, option) => acc + option.votesPollingPower,
    0,
  );
  const quorum = poll.quorum;
  const previousPercentage = Math.min((totalPreviousVotes / quorum) * 100, 100);
  const totalVotesPercentage = Math.min(
    ((totalPreviousVotes + pollingPower) / quorum) * 100,
    100,
  );
  const differencePercentage = Math.max(
    0,
    totalVotesPercentage - previousPercentage,
  );

  // Data using numeric values for proper chart layout.
  const data = [
    {
      name: "Quorum Progress",
      previous: previousPercentage,
      difference: differencePercentage,
    },
  ];

  return (
    <div className="w-full flex flex-col justify-center items-center">
      <ResponsiveContainer width="100%" height={100}>
        <BarChart
          width={150}
          height={40}
          data={data}
          layout="vertical"
          margin={{
            top: 20,
            right: 5,
            left: 5,
            bottom: 5,
          }}
        >
          {/* Define the gradient for the previous votes */}
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
          <Tooltip
            formatter={(value: any) => `${value.toFixed(2)}%`}
            contentStyle={{ backgroundColor: "#fff", borderColor: "#ccc" }}
            itemStyle={{ color: "#000" }}
          />
          {/* Gradient for existing quorum progress */}
          <Bar
            stackId="a"
            dataKey="previous"
            isAnimationActive={false}
            fill="url(#quorumGradient)"
          />
          {/* Light gray for the difference/projection */}
          <Bar stackId="a" dataKey="difference" fill="#e0e0e0" />
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-2 flex flex-col items-center">
        <div>Current Quorum: {previousPercentage.toFixed(2)}%</div>
        <div>Quorum Impact: {differencePercentage.toFixed(2)}%</div>
        <div>
          New Quorum: {(previousPercentage + differencePercentage).toFixed(2)}%
        </div>
      </div>
    </div>
  );
};

export default QuorumProgressBar;
