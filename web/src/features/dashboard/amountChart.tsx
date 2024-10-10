import styles from "@/styles/main.module.css";
import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
} from "recharts";
import { selectAmountDistribution } from "./dashboardSlice";
import { useAppSelector } from "@/app/hooks";

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
        <p>{`${label} KDA: ${payload[0].value} lockups`}</p>
      </div>
    );
  }
  return null;
};

const AmountDistributionChart: React.FC = () => {
  const amountDistribution = useAppSelector(selectAmountDistribution);

  if (!amountDistribution) {
    return;
  }

  const chartData = Object.entries(amountDistribution).map(([name, value]) => ({
    name,
    value,
  }));

  const formatXAxis = (tickItem: string): string => {
    // Split the label at dashes
    const parts = tickItem.split("-");
    // Append "KDA" only to the last part
    parts[parts.length - 1] += " KDA";
    // Join them back with a dash and return
    return parts[parts.length - 1];
  };

  return (
    <div className={styles.chartContainer}>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
          barCategoryGap={0}
        >
          <XAxis
            dataKey="name"
            tick={false} // Disable tick labels
            axisLine={{ stroke: "var(--color-axis)" }}
            label={{
              value: "Amount",
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

export default AmountDistributionChart;
