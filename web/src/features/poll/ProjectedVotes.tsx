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
  Yes: number;
  No: number;
  Abstention: number;
}

const COLORS = {
  Yes: "#4A9079", // Green
  No: "#E41968", // Pink
  Abstention: "#FF8042", // Orange
  Projected: "#1E90FF", // Blue for projection
};

interface VoteImpactBarChartProps {
  poll: PollDTO;
  selectedVote: "approved" | "refused" | "abstain" | null;
  pollingPower: number;
}

const VoteImpactBarChart: React.FC<VoteImpactBarChartProps> = ({
  poll,
  selectedVote,
  pollingPower,
}) => {
  const { votesYes, votesNo, votesAbstentions } = poll;

  // Calculate total votes
  const totalVotes = votesYes + votesNo + votesAbstentions;

  // Data for current votes
  const currentData: VoteData[] = [
    {
      name: "Before",
      Yes: totalVotes > 0 ? (votesYes / totalVotes) * 100 : 0,
      No: totalVotes > 0 ? (votesNo / totalVotes) * 100 : 0,
      Abstention: totalVotes > 0 ? (votesAbstentions / totalVotes) * 100 : 0,
    },
  ];

  // Calculate projected votes based on user selection
  const projectedYes =
    selectedVote === "approved" ? votesYes + pollingPower : votesYes;
  const projectedNo =
    selectedVote === "refused" ? votesNo + pollingPower : votesNo;
  const projectedAbstention =
    selectedVote === "abstain"
      ? votesAbstentions + pollingPower
      : votesAbstentions;

  const totalProjectedVotes = projectedYes + projectedNo + projectedAbstention;

  // Data for projected votes
  const projectedData: VoteData[] = [
    {
      name: "After",
      Yes:
        totalProjectedVotes > 0
          ? (projectedYes / totalProjectedVotes) * 100
          : 0,
      No:
        totalProjectedVotes > 0 ? (projectedNo / totalProjectedVotes) * 100 : 0,
      Abstention:
        totalProjectedVotes > 0
          ? (projectedAbstention / totalProjectedVotes) * 100
          : 0,
    },
  ];

  return (
    <div style={{ width: "100%", height: "200px" }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          width={150}
          height={40}
          margin={{
            top: 20,
            right: 10,
            left: 5,
            bottom: 5,
          }}
          layout="vertical"
          data={selectedVote ? [...currentData, ...projectedData] : currentData}
        >
          <XAxis type="number" domain={[0, 100]} hide />
          <YAxis type="category" dataKey="name" width={50} axisLine={false} />
          <Tooltip formatter={(value: number) => `${value.toFixed(2)}%`} />
          {/* Current Votes Bar */}
          <Bar dataKey="Yes" fill={COLORS.Yes} stackId="a" />
          <Bar dataKey="No" fill={COLORS.No} stackId="a" />
          <Bar dataKey="Abstention" fill={COLORS.Abstention} stackId="a" />
          {/* Projected Votes Bar */}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default VoteImpactBarChart;
