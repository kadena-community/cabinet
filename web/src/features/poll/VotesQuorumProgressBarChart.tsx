// app/components/VotesQuorumProgressBar.tsx

"use client";

import { FC } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { PollDTO } from "@/features/poll/types";

const COLORS = {
  Yes: "#4A9079", // Green
  No: "#E41968", // Pink
  Abstention: "#FF8042", // Orange
};

const VotesQuorumProgressBar: FC<{ poll: PollDTO }> = ({ poll }) => {
  const data = [
    {
      name: "Votes Quorum Progress",
      progress: ((poll.numberVotes / poll.votesQuorum) * 100).toFixed(2),
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
                      <linearGradient id="progressGradient" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor={COLORS.Yes} />
                          <stop offset="50%" stopColor={COLORS.No} />
                          <stop offset="100%" stopColor={COLORS.Abstention} />
                      </linearGradient>
                  </defs>
                  <XAxis type="number" domain={[0, 100]} hide />
                  <YAxis type="category" dataKey="name" hide />
                  <Tooltip formatter={(value: any) => `${value}%`} />
                  <Bar
                      dataKey="progress"
                      fill="url(#progressGradient)"
                      background={{ fill: '#122738' }}
                  />
              </BarChart>
          </ResponsiveContainer>
      </div>
  );
};

export default VotesQuorumProgressBar;
