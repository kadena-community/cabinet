import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { useAppSelector } from "@/app/hooks";
import { selectNumberOfVotes, selectDisplayPollingPower } from "./votesSlice";
import { AppLoader } from "@/features/components/Loader";
interface VoteData {
  name: string;
  value: number;
}

const COLORS: { [key: string]: string } = {
  Yes: "#4A9079", // Green
  No: "#E41968", // Pink
  Abstention: "#FF8042", // Orange
};

const VoteDistributionPieChart: React.FC = () => {
  const numberOfVotes = useAppSelector(selectNumberOfVotes);
  const displayPollingPower = useAppSelector(selectDisplayPollingPower);

  if (!numberOfVotes) {
    return (
      <div>
        <AppLoader true size="16px" stroke="#E27B38" />
      </div>
    );
  }

  // Ensure all categories are represented
  const dataMap: { [key: string]: VoteData } = {
    Yes: { name: "Yes", value: 0 },
    No: { name: "No", value: 0 },
    Abstention: { name: "Abstention", value: 0 },
  };

  numberOfVotes.forEach((vote) => {
    const type = vote.type;
    const value = displayPollingPower ? vote.pollingPower : vote.voteCount;
    if (dataMap[type]) {
      dataMap[type].value = value;
    }
  });

  const data: VoteData[] = Object.values(dataMap);

  return (
    <div>
      <h2 className="text-lg font-semibold mb-2 whitespace-nowrap">
        {displayPollingPower ? "Total Voting Power" : "Total Votes"}
      </h2>
      <ResponsiveContainer width="100%" height={207}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            fill="#8884d8"
          >
            {data.map((entry) => (
              <Cell key={`cell-${entry.name}`} fill={COLORS[entry.name]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default VoteDistributionPieChart;
