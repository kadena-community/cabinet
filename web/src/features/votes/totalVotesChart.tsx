import styles from "@/styles/main.module.css";
import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useAppSelector } from "@/app/hooks";
import { selectNumberOfVotes, selectDisplayPollingPower } from "./votesSlice";
import { AppLoader } from "@/features/components/Loader";

interface VoteData {
  name: string;
  value: number;
}

const COLORS = [
  "#4A9079", // k-Green-default
  "#E41968", // k-Pink-default
  "#E27B38", // k-Orange-default
  "#F0EAE6", // k-Cream-default
  "#ACB4BA", // dark-blue-200
  "#EDC4AB", // k-Ltorange-default
  "#C4E9DD", // k-Green-200
  "#FFA3C3", // lighter-pink
  "#436270", // medium-blue
  "#071D2F", // dark-blue-default
];

// Custom tooltip component
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const { name, value } = payload[0];
    return (
      <div className={styles.analyticsTooltip}>
        <p style={{ margin: 0 }}>
          {payload[0].payload.name}: {value.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

const VoteDistributionBarChart: React.FC = () => {
  const numberOfVotes = useAppSelector(selectNumberOfVotes);
  const displayPollingPower = useAppSelector(selectDisplayPollingPower);

  if (!numberOfVotes) {
    return <p>No votes available</p>;
  }

  // Transform the data dynamically based on available vote types
  const data: VoteData[] = numberOfVotes.map((vote) => ({
    name: vote.type,
    value: displayPollingPower ? vote.pollingPower : vote.voteCount,
  }));

  // Sort the data from highest to lowest values
  const sortedData = [...data].sort((a, b) => b.value - a.value);

  // Get the list of vote types, sorted alphabetically
  const voteTypes = sortedData.map((d) => d.name).sort();

  // Create a mapping from vote types to colors
  const colorMap: { [voteType: string]: string } = {};
  voteTypes.forEach((voteType, index) => {
    colorMap[voteType] = COLORS[index % COLORS.length];
  });

  return (
    <div>
      <h2 className="text-lg font-semibold mb-2 whitespace-nowrap">
        {displayPollingPower ? "Total Voting Power" : "Total Votes"}
      </h2>
      <ResponsiveContainer width="100%" height={500}>
        <BarChart
          data={sortedData}
          layout="vertical"
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <XAxis type="number" />
          <YAxis type="category" dataKey="name" width={150} />
          <Tooltip content={<CustomTooltip />} />
          {/* Render bars dynamically based on sorted data */}
          <Bar dataKey="value" fill="#8884d8">
            {sortedData.map((entry) => (
              <Cell key={`cell-${entry.name}`} fill={colorMap[entry.name]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default VoteDistributionBarChart;
