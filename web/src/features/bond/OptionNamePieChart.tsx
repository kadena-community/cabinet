import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { useAppSelector } from "@/app/hooks";
import { selectLockupSummaryPie, selectDisplayAmount } from "./bondSlice";
import { LockupOptionDistribution } from "./types";
import styles from "@/styles/main.module.css";
const COLORS: string[] = ["#4A9079", "#E41968", "#FF8042", "#EDC4AB", "#E6E8EA" ];

const OptionNamePieChart: React.FC = () => {
  const lockupSummaryPie = useAppSelector(selectLockupSummaryPie) || [];
  const displayAmount = useAppSelector(selectDisplayAmount);

  if (!lockupSummaryPie.length) {
    return <div>Loading...</div>;
  }

  const pieData = lockupSummaryPie.map((option: LockupOptionDistribution) => ({
    name: option.optionName,
    value: displayAmount ? option.amount : option.lockupCount,
  }));

  const total = pieData.reduce((sum, entry) => sum + entry.value, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const percentage = ((payload[0].value / total) * 100).toFixed(2);
      return (
        <div className={styles.analyticsTooltip}>
          <p>
        {`${payload[0].name} : ${percentage}%`}
          </p>
        </div>
      );
    }

    return null;
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-2 whitespace-nowrap">
        {displayAmount ? "Lockup Option by Amount" : "Lockup Option Counts"}
      </h2>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={pieData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            fill="#8884d8"
          >
            {pieData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default OptionNamePieChart;
