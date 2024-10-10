import styles from "@/styles/main.module.css";
import React, { useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
} from "recharts";
import { useAppSelector } from "@/app/hooks";
import { selectDailyTvl } from "./dashboardSlice";
import { AppLoader } from "@/features/components/Loader";

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
        <p>{`${label} : ${payload[0].value.toLocaleString()} KDA`}</p>
      </div>
    );
  }
  return null;
};

const DailyTvlChart: React.FC = () => {
  const dailyTvl = useAppSelector(selectDailyTvl);

  if (!dailyTvl) {
    return;
  }

  const chartData = Object.entries(dailyTvl).map(([date, value]) => ({
    date: new Date(date).toLocaleDateString(),
    value,
  }));

  return (
    <div className={styles.chartContainer}>
      <ResponsiveContainer width="100%" height={330}>
        <AreaChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <XAxis
            dataKey="date"
            tick={false}
            axisLine={{ stroke: "var(--color-axis)" }}
            label={{
              value: "Date",
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
          <Area
            type="monotone"
            dataKey="value"
            stroke="#4A9079"
            fill="#4A9079"
            // isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DailyTvlChart;
