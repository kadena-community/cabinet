"use client";

import { FC } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  Legend,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { PollDTO } from "@/features/poll/types";

const COLORS = {
  Yes: "#4A9079", // Green
  No: "#E41968", // Pink
  Abstention: "#FF8042", // Orange
};

const QuorumProgressBar: FC<{ poll: PollDTO }> = ({ poll }) => {
  const data = [
    {
      name: "Quorum Progress",
      progress: Math.min(
        ((poll.votesYes + poll.votesNo + poll.votesAbstentions) / poll.quorum) *
          100,
        100.0,
      ).toFixed(2),
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
              <stop offset="0%" stopColor={COLORS.No} />
              <stop offset="50%" stopColor={COLORS.Abstention} />
              <stop offset="100%" stopColor={COLORS.Yes} />
            </linearGradient>
          </defs>
          <XAxis type="number" domain={[0, 100]} hide />
          <YAxis type="category" dataKey="name" hide />
          <Tooltip
            formatter={(value: any) => `${value}%`}
            contentStyle={{  borderColor: "transparent" }} // Transparent background and border
            itemStyle={{ color: "#000" }} // Text color
          />
          <Bar
            dataKey="progress"
            fill="url(#quorumGradient)"
            background={{ fill: "transparent" }} // Transparent background
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default QuorumProgressBar;
