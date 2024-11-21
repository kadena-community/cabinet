import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  TooltipProps,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useAppSelector } from "@/app/hooks";
import { selectLockupDensity } from "./bondSlice";
import styles from "@/styles/main.module.css";

const COLORS: string[] = [
  "#4A9079",
  "#E41968",
  "#FF8042",
  "#EDC4AB",
  "#F0EAE6",
  "#0B1D2E",
];


interface CustomTooltipProps extends TooltipProps<number, string> {
  active?: boolean;
  payload?: any;
  label?: string; }

const LockupDensityChart: React.FC = () => {
  const lockupDensity = useAppSelector(selectLockupDensity) || [];
    //console.log(lockupDensity);

  if (!lockupDensity.length) {
    return <div>Loading...</div>;
  }

  const CustomTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  label,
}) => {
  if (active && payload && payload.length) {
    return (
      <div className={styles.analyticsTooltip}>
        <p>{`${label} : ${payload[0].value.toLocaleString()} lockups`}</p>
      </div>
    );
  }
  return null;
};


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
          <Tooltip content={<CustomTooltip />}/>
          <Bar dataKey="density" fill={COLORS[0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LockupDensityChart;
