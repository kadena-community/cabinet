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
import { selectVotesOverTime, selectDisplayPollingPower } from "./votesSlice";
import { AppLoader } from "@/features/components/Loader";

const COLORS = {
  approved: "#4A9079",
  refused: "#E41968",
  abstention: "#E27B38",
};

const VotesOverTimeBarChart: React.FC = () => {
  const votesOverTime = useAppSelector(selectVotesOverTime);
  const displayPollingPower = useAppSelector(selectDisplayPollingPower);

  if (!votesOverTime) {
    return (
      <div>
        <AppLoader true size="16px" stroke="#E27B38" />
      </div>
    );
  }

  const data = votesOverTime.reduce((acc: any[], vote) => {
    const existing = acc.find(
      (item) => item.date === new Date(vote.date).toLocaleDateString(),
    );
    if (existing) {
      existing[vote.action] = displayPollingPower
        ? vote.pollingPower
        : vote.voteCount;
    } else {
      acc.push({
        date: new Date(vote.date).toLocaleDateString(),
        [vote.action]: displayPollingPower ? vote.pollingPower : vote.voteCount,
      });
    }
    return acc;
  }, []);

  const sortedData = data.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  return (
    <div>
      <h2 className="text-lg font-semibold mb-2 whitespace-nowrap">
        {displayPollingPower ? "Voting Power Over Time" : "Votes Over Time"}
      </h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={sortedData}
          margin={{ top: 20, right: 30, left: 20, bottom: 40 }} // Increased bottom margin
        >
          <XAxis
            dataKey="date"
            tick={false} // Disable tick labels
            axisLine={{ stroke: "var(--color-axis)" }}
            label={{
              value: "Date",
              position: "insideBottom",
              offset: 10,
              fill: "var(--color-axis)",
            }} // Added offset for spacing
          />
          <YAxis
            tick={{ fill: "var(--color-axis)" }}
            axisLine={{ stroke: "var(--color-axis)"}}
          />
          <Tooltip />
          <Legend wrapperStyle={{ paddingTop: 20 }} />{" "}
          {/* Added padding to legend */}
          <Bar dataKey="approved" stackId="a" fill={COLORS.approved} />
          <Bar dataKey="refused" stackId="a" fill={COLORS.refused} />
          <Bar dataKey="abstention" stackId="a" fill={COLORS.abstention} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default VotesOverTimeBarChart;
