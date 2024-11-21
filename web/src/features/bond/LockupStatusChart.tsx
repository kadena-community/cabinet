// app/components/BondLockupDistributionBarChart.tsx

"use client";
import styles from "@/styles/main.module.css"
import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  TooltipProps,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Bond } from "./types";

const COLORS = {
  locked: "#4A9079", // Green
  claimed: "#FF8042", // Orange
};

interface BondLockupDistributionBarChartProps {
  bond: Bond;
}

interface CustomTooltipProps extends TooltipProps<number, string> {
  active?: boolean;
  payload?: any;
  label?: string; }

  const BondLockupDistributionBarChart: React.FC<BondLockupDistributionBarChartProps> = ({
    bond,
  }) => {
  const { lockedCount, claimedCount } = bond;


  const CustomTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  label,
}) => {
  if (active && payload && payload.length) {
    return (
      <div className={styles.analyticsTooltip}>
        <p>{payload.name}</p>
        <p>Locked: {(payload[0].value /(payload[0].value + payload[1].value) * 100).toFixed(2)}%</p>
        <p>Claimed: {(payload[1].value / (payload[0].value + payload[1].value) * 100).toFixed(2)}%</p>
      </div>
    );
  }
  return null;
};


  const totalLockups = lockedCount + claimedCount;

  const data = [
    {
      name: "Lockup Distribution",
      locked: lockedCount,
      claimed: claimedCount,
    },
  ];

  return (
    <div style={{ width: "100%", height: "80px" }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{
            top: 5,
            right: 70,
            left: 0,
            bottom: 5,
          }}
        >
          <XAxis type="number" domain={[0, totalLockups]} hide />
          <YAxis type="category" dataKey="name" hide />
          <Tooltip  content={<CustomTooltip />} />
          <Bar
            dataKey="locked"
            stackId="a"
            fill={COLORS.locked}
          />
          <Bar
            dataKey="claimed"
            stackId="a"
            fill={COLORS.claimed}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BondLockupDistributionBarChart;
