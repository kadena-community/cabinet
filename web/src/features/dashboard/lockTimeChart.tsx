import styles from "@/styles/main.module.css";
import React, { useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  TooltipProps,
  ResponsiveContainer,
} from "recharts";
import {
  getLockTimeDistributionAsync,
  selectLockTimeDistribution,
} from "./dashboardSlice";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { AppLoader } from "@/features/components/Loader";

// Function to convert seconds into human-readable format
function convertSecondsToReadableFormat(seconds: number): string {
  const months = Math.floor(seconds / (30.5 * 24 * 60 * 60));
  seconds %= 30.5 * 24 * 60 * 60;
  const days = Math.floor(seconds / (24 * 60 * 60));
  seconds %= 24 * 60 * 60;
  const hours = Math.floor(seconds / (60 * 60));
  seconds %= 60 * 60;
  const minutes = Math.floor(seconds / 60);

  const result = [];
  if (months > 0) result.push(`${months} month${months > 1 ? "s" : ""}`);
  if (days > 0) result.push(`${days} day${days > 1 ? "s" : ""}`);
  if (hours > 0) result.push(`${hours} hour${hours > 1 ? "s" : ""}`);
  if (minutes > 0 || result.length === 0)
    result.push(`${minutes} minute${minutes > 1 ? "s" : ""}`);

  return result.join(", ");
}

// TypeScript interface for Tooltip payload
interface CustomTooltipProps extends TooltipProps<number, string> {}

const CustomTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  label,
}) => {
  if (active && payload && payload.length) {
    return (
      <div className={styles.analyticsTooltip}>
        <p className="label">{`${label} : ${payload[0].value} lockups`}</p>
      </div>
    );
  }

  return null;
};

const LockTimeDistributionChart: React.FC = () => {
  const lockTimeDistribution = useAppSelector(selectLockTimeDistribution);

  if (!lockTimeDistribution) {
    return null;
  }

  // Transforming data for recharts
  const chartData = Object.entries(lockTimeDistribution)
    .map(([key, value]) => ({
      name: convertSecondsToReadableFormat(Number(key)), // Convert seconds to readable format
      value: value,
    }))
    .sort((a, b) => Number(a.name) - Number(b.name)); // Assuming sorting by the numeric values of time

  return (
    <div className={styles.chartContainer}>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
        >
          <XAxis
            dataKey="name"
            tick={false} // Disable tick labels
            axisLine={{ stroke: "var(--color-axis)" }}
            label={{
              value: "Duration",
              position: "insideBottom",
              offset: 0,
              fill: "var(--color-axis)",
            }}
          />
          <YAxis
            tick={{ fill: "var(--color-axis)" }}
            axisLine={{ stroke: "var(--color-axis)" }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="value" fill="#4A9079" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LockTimeDistributionChart;
