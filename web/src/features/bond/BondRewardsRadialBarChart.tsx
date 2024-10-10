import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from "recharts";

const COLORS = ["#4A9079", "#E41968", "#FF8042"];

const BondRewardsHorizontalBarChart: React.FC<{ bond: any }> = ({ bond }) => {
  const { totalRewards, lockedRewards, givenRewards } = bond;
  const availableRewards = totalRewards - (lockedRewards + givenRewards);

  const data = [
    { name: "Locked", value: lockedRewards },
    { name: "Given", value: givenRewards },
    { name: "Available", value: availableRewards },
  ];

  return (
    <div>
      <h2 className="text-lg font-semibold mb-2 whitespace-nowrap">
        Lockup Rewards Distribution
      </h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <XAxis type="number" axisLine={{ stroke: "var(--color-axis)" }}   tick={{ fill: "var(--color-axis)" }} />
          <YAxis type="category" dataKey="name"    tick={{ fill: "var(--color-axis)" }}
                 axisLine={{ stroke: "var(--color-axis)"}}/>
          <Tooltip formatter={(value: any) => value.toFixed(2) + " KDA"} />
          <Bar dataKey="value">
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BondRewardsHorizontalBarChart;
