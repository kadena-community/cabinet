"use client";

import React, { useState } from "react";
import { useAppSelector } from "../../app/hooks";
import { selectUserVoteStats } from "./votesSlice";
import UserVotes from "./userVotes";
import styles from "../../styles/main.module.css";
import HoverButton from "@/features/components/HoverButton";

interface VoteStatsCardProps {
    account: string;
}

const VoteStatsCard: React.FC<VoteStatsCardProps> = ({ account }) => {
    const stats = useAppSelector(selectUserVoteStats);
    const [isExpanded, setIsExpanded] = useState(false);

    const handleToggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    if (!stats) return null; // Guard clause if stats are not provided

    return (
        <div className="container mx-auto">
        <div className={`card flex-row`}>
            <h2 className="text-xl font-semibold mb-4">Your Vote Details</h2>
            <div className="flex justify-between w-full">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mt-8 mb-8 w-full">
                    {/* <div className={`${styles.cardItem}  mb-1`}>
                        <h3 className="text-lg">Voting Power</h3>
                        <p className="text-2xl">
                        {stats.CurrentPollingPower?.toLocaleString("en-US", {
                        style: "decimal",
                        maximumFractionDigits: 2,
                        })}
                        </p>
                        </div> */}
                    <div className={`${styles.cardItem} mb-3`}>
                        <h3 className="text-lg">Total Votes</h3>
                        <p className="text-2xl">{stats.TotalVotes}</p>
                    </div>
                    <div className={`${styles.cardItem} mb-3`}>
                        <h3 className="text-lg">Ongoing</h3>
                        <p className="text-2xl">{stats.OngoingVotes}</p>
                    </div>
                    <div className={`${styles.cardItem} mb-3`}>
                        <h3 className="text-lg">Votes Won</h3>
                        <p className="text-2xl">{stats.VotesWon}</p>
                    </div>
                    <div className={`${styles.cardItem} mb-3`}>
                        <h3 className="text-lg">Votes Lost</h3>
                        <p className="text-2xl">{stats.VotesLost}</p>
                    </div>
                </div>
                </div>
                <HoverButton
                    onClick={handleToggleExpand}
                    isExpanded={isExpanded}
                    expandedText="Hide Votes"
                    collapsedText="Show Votes"
                />
                {isExpanded && account && (
                    <div className="w-full mt-4">
                        <UserVotes account={account} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default VoteStatsCard;
