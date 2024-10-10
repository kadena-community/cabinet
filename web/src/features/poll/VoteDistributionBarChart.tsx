// app/components/VoteDistributionBarChart.tsx
"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  TooltipProps,
  CartesianGrid,
  Legend,
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
};

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
        <p>{`${label}: ${payload[0].value}%`}</p>
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
  const { votesYes, votesNo, votesAbstentions } = poll;

  const totalVotes = votesYes + votesNo + votesAbstentions;

  const data: VoteData[] = [
    {
      name: "Votes",
      Yes: totalVotes > 0 ? (votesYes / totalVotes) * 100 : 0,
      No: totalVotes > 0 ? (votesNo / totalVotes) * 100 : 0,
      Abstention: totalVotes > 0 ? (votesAbstentions / totalVotes) * 100 : 0,
    },
  ];

  return (
    <div style={{ width: "100%", height: "70px" }}>
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
          <Tooltip formatter={(value: any) => `${value.toFixed(2)}%`} />
          <Bar dataKey="Yes" stackId="a" fill={COLORS.Yes} />
          <Bar dataKey="No" stackId="a" fill={COLORS.No} />
          <Bar dataKey="Abstention" stackId="a" fill={COLORS.Abstention} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default VoteDistributionBarChart;
