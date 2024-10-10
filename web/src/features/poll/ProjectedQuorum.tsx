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

const COLORS = {
  Yes: "#4A9079", // Green
  No: "#E41968", // Pink
  Abstention: "#FF8042", // Orange
};

const QuorumProgressBar: FC<{ poll: PollDTO; pollingPower: number }> = ({
  poll,
  pollingPower,
}) => {
  const totalVotes =
    (poll.votesYes + poll.votesNo + poll.votesAbstentions) * pollingPower;
  const quorum = poll.quorum * pollingPower;
  const totalVotesPercentage = Math.min((totalVotes / quorum) * 100, 100);
  const differencePercentage = Math.max(0, 100 - totalVotesPercentage);

  const data = [
    {
      name: "Quorum Progress",
      progress: totalVotesPercentage.toFixed(2),
      difference: differencePercentage.toFixed(2),
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
            contentStyle={{ backgroundColor: "#fff", borderColor: "#ccc" }}
            itemStyle={{ color: "#000" }}
          />
          <Bar
            stackId="a"
            dataKey="progress"
            fill="url(#quorumGradient)"
            background={{ fill: "#122738" }}
            isAnimationActive={false}
          />
          <Bar
            stackId="a"
            dataKey="difference"
            fill={COLORS.Yes}
            className={differencePercentage > 0 ? styles.blink : ""}
          />
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-2 flex flex-col items-center">
        <div>Current Quorum: {totalVotesPercentage.toFixed(2)}%</div>
        <div>Quorum Impact: {`${differencePercentage.toFixed(2)}%`}</div>
        <div>
          New Quorum: {(totalVotesPercentage + differencePercentage).toFixed(2)}
          %
        </div>
      </div>
    </div>
  );
};

export default QuorumProgressBar;
