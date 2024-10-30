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

const QuorumProgressBar: FC<{ poll: PollDTO; pollingPower: number }> = ({
  poll,
  pollingPower,
}) => {


  const totalPreviousVotes = poll.pollOptions.reduce((acc, option) => acc + option.votesPollingPower, 0);
  const quorum = poll.quorum;
  const previousPercentage = Math.min((totalPreviousVotes / quorum) * 100, 100);
  const totalVotesPercentage = Math.min(((totalPreviousVotes + pollingPower) / quorum) * 100, 100);
  const differencePercentage = Math.max(0, totalVotesPercentage - previousPercentage);


  const data = [
    {
      name: "Quorum Progress",
      previous: previousPercentage.toFixed(2),
      total: totalVotesPercentage.toFixed(2),
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
          <XAxis type="number" domain={[0, 100]} hide />
          <YAxis type="category" dataKey="name" hide />
          <Tooltip
            formatter={(value: any) => `${value}%`}
            contentStyle={{ backgroundColor: "#fff", borderColor: "#ccc" }}
            itemStyle={{ color: "#000" }}
          />
          <Bar
            stackId="a"
            dataKey="previous"
            isAnimationActive={false}
          />
          <Bar
            stackId="a"
            dataKey="difference"
            className={differencePercentage > 0 ? styles.blink : ""}
          />
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-2 flex flex-col items-center">
        <div>Current Quorum: {previousPercentage.toFixed(2)}%</div>
        <div>Quorum Impact: {`${differencePercentage.toFixed(2)}%`}</div>
        <div>
          New Quorum: {(previousPercentage + differencePercentage).toFixed(2)}
          %
        </div>
      </div>
    </div>
  );
};

export default QuorumProgressBar;
