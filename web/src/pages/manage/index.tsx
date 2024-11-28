import Head from "next/head";
import { useKadenaReact } from "../../kadena/core";
import styles from "../../styles/main.module.css";
import ManageRewardsComponent from "../../features/manageRewards/manageRewardsComponent";
import CreateBondComponent from "@/features/createBond/createBondComponent";
import CreatePollComponent from "@/features/createPoll/createPollComponent";

const Manage: React.FC = (): JSX.Element => {
    const { account } = useKadenaReact();

    return (
        <main className="contentWrapper">
            <ManageRewardsComponent />
            <CreatePollComponent />
            <CreateBondComponent />
        </main>
    );
};

export default Manage;
