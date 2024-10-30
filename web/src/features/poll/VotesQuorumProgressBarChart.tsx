"use client";

import { FC } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { PollDTO } from "@/features/poll/types";

// Final color palette
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

// Dynamic color mapping for poll options
const getColorForOption = (index: number) => COLORS[index % COLORS.length];

const VotesQuorumProgressBar: FC<{ poll: PollDTO }> = ({ poll }) => {
  const totalVotes = poll.numberVotes || 0;
  const votesQuorum = poll.votesQuorum || 1; // Avoid division by 0
  const progress = ((totalVotes / votesQuorum) * 100).toFixed(2);

  const data = [
    {
      name: "Votes Quorum Progress",
      progress,
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
            right: 30,
            left: 80,
            bottom: 5,
          }}
        >
          <defs>
            {/* Gradient dynamically filled with colors from the palette */}
            <linearGradient id="progressGradient" x1="0" y1="0" x2="1" y2="0">
              {poll.pollOptions.map((option, index) => (
                <stop
                  key={option.optionName}
                  offset={`${(index / poll.pollOptions.length) * 100}%`}
                  stopColor={getColorForOption(index)}
                />
              ))}
            </linearGradient>
          </defs>
          <XAxis type="number" domain={[0, 100]} hide />
          <YAxis type="category" dataKey="name" hide />
          <Tooltip formatter={(value: any) => `${value}%`} />
          <Bar
            dataKey="progress"
            fill="url(#progressGradient)"
            background={{ fill: "#122738" }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default VotesQuorumProgressBar;
