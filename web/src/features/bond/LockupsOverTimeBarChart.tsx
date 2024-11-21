import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  TooltipProps,
  ResponsiveContainer,
} from "recharts";
import { useAppSelector } from "@/app/hooks";
import { selectLockupSummaryBar, selectDisplayAmount } from "./bondSlice";
import styles from "@/styles/main.module.css";
import { LockupDailyAmount } from "./types";
import { AppLoader } from "@/features/components/Loader";

const COLORS = {
  amount: "#4A9079",
  lockupCount: "#E41968",
};

interface CustomTooltipProps extends TooltipProps<number, string> {
  active?: boolean;
  payload?: any;
  label?: string;
}

const LockupsOverTimeBarChart: React.FC = () => {
  const lockupSummaryBar = useAppSelector(selectLockupSummaryBar) || [];
  const displayAmount = useAppSelector(selectDisplayAmount);

  const CustomTooltip: React.FC<CustomTooltipProps> = ({
    active,
    payload,
    label,
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className={styles.analyticsTooltip}>
          <p>{`${label} : ${payload[0].value.toLocaleString()} ${displayAmount ? "KDA" : "lockups"} `}</p>
        </div>
      );
    }
    return null;
  };

  if (!lockupSummaryBar) {
    return (
      <div>
        <AppLoader true size="24px" stroke="#E27B38" />
      </div>
    );
  }

  const data = lockupSummaryBar.map((lockup: LockupDailyAmount) => ({
    date: new Date(lockup.date).toLocaleDateString(),
    amount: lockup.amount,
    lockupCount: lockup.lockupCount,
  }));

  const sortedData = data.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  return (
    <div>
      <h2 className="text-lg font-semibold mb-2 whitespace-nowrap">
        {displayAmount ? "Lockup Amount Over Time" : "Lockup Count Over Time"}
      </h2>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart
          data={sortedData}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <XAxis
            dataKey="date"
            tick={false} // Disable tick labels
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
            dataKey={displayAmount ? "amount" : "lockupCount"}
            stackId="a"
            stroke={displayAmount ? COLORS.amount : COLORS.lockupCount}
            fill={displayAmount ? COLORS.amount : COLORS.lockupCount}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LockupsOverTimeBarChart;
