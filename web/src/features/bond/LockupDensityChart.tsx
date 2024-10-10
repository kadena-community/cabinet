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
} from "recharts";
import { useAppSelector } from "@/app/hooks";
import { selectLockupDensity } from "./bondSlice";

const COLORS: string[] = [
  "#4A9079",
  "#E41968",
  "#FF8042",
  "#EDC4AB",
  "#F0EAE6",
  "#0B1D2E",
];

const LockupDensityChart: React.FC = () => {
  const lockupDensity = useAppSelector(selectLockupDensity) || [];

  if (!lockupDensity.length) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2 className="text-lg font-semibold mb-2 whitespace-nowrap">
        Lockup Amounts (KDA)
      </h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={lockupDensity}>
          <XAxis dataKey="amount" axisLine={{ stroke: "var(--color-axis)" }} tick={{fill: "var(--color-axis)"}} />
          <YAxis
            tick={{ fill: "var(--color-axis)" }}
            axisLine={{ stroke: "var(--color-axis)"}}
          />
          <Tooltip />
          <Bar dataKey="density" fill={COLORS[0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LockupDensityChart;
