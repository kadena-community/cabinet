// app/components/BondLockupDistributionBarChart.tsx

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
} from "recharts";
import { Bond } from "./types";

const COLORS = {
  locked: "#4A9079", // Green
  claimed: "#FF8042", // Orange
};

interface BondLockupDistributionBarChartProps {
  bond: Bond;
}

const BondLockupDistributionBarChart: React.FC<BondLockupDistributionBarChartProps> = ({
  bond,
}) => {
  const { lockedCount, claimedCount } = bond;

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
          <Tooltip formatter={(value: any) => `${((value / totalLockups) * 100).toFixed(2)}%`} />
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
