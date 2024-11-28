// Home component
import React, { useEffect } from "react";
import DashboardComponent from "../features/dashboard/Dashboard";
import styles from "../styles/main.module.css";
import Polls from "@/features/poll/Polls";
import { useAppDispatch } from "@/app/hooks";
import  VoteWarning  from "@/features/pollWarning"
const Home: React.FC = (): JSX.Element => {
  const dispatch = useAppDispatch();

  return (
    <main className="contentWrapper">
      <VoteWarning />
      <DashboardComponent />
    </main>
  );
};

export default Home;
