import React, { useState, useEffect } from "react";
import styles from "../../styles/main.module.css";
import { RootState } from "../../app/store";
import {
    checkIsCoreAccountAsync,
    selectIsCoreMember,
    getAllBondsAsync,
    selectAllBonds,
    selectBondLoading,
    selectBondError,
} from "../bond/bondSlice";
import { useKadenaReact } from "../../kadena/core";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import IManageRewards from "./types";
import ManageRewardsModal from "./manageRewardsModal";
import { Bond } from "../bond/types";
import { useManageRewards } from "@/hooks/useManageRewards";
import LockupOptionsDisplay from "@/features/bond/lockupOptionsDisplay";

export function bondAvailableRewards(bond: Bond) {
    return bond.totalRewards - (bond.lockedRewards + bond.givenRewards);
}

const ManageRewardsComponent: React.FC = () => {
    const dispatch = useAppDispatch();
    const { account } = useKadenaReact();
    const isCoreMember = useAppSelector((state: RootState) =>
        selectIsCoreMember(state),
    );

    useEffect(() => {
        if (account?.account) {
            dispatch(checkIsCoreAccountAsync(account.account));
        }
        dispatch(getAllBondsAsync());
    }, [dispatch, account]);

    const allBonds = useAppSelector(selectAllBonds);
    const loading = useAppSelector(selectBondLoading);
    const error = useAppSelector(selectBondError);
    const [activeBond, setActiveBond] = useState<Bond | null>(null);
    const [isModalOpen, setModalOpen] = useState<boolean>(false);

    const { handleAddRewards, handleClaimBackRewards } = useManageRewards();

    const handleOpenModal = (bond: Bond) => {
        setActiveBond(bond);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setActiveBond(null);
    };

    const handleAddRewardsWithClose = (params: IManageRewards) =>
        handleAddRewards(params, handleCloseModal);
    const handleClaimBackRewardsWithClose = (params: IManageRewards) =>
        handleClaimBackRewards(params, handleCloseModal);

    if (!isCoreMember) {
        return (
            <p className={styles.note}>
                You must be a core member to see this component.
            </p>
        );
    }

    return (
        <div className="container mx-auto">
            <h1 className="font-kadena text-3xl font-semibold">Your Bonds</h1>
            {loading && <p className="text-lg">Loading lockups...</p>}
            {error && (
                <p className="text-lg text-red-500">
                    Error fetching lockups: {error}
                </p>
            )}
            {!loading && !error && allBonds.length > 0 && (
                <ul>
                    {allBonds
                        .filter((bond) => bond.creator === account?.account)
                        .map((bond) => (
                            <li key={bond.bondId} className="card mb-4">
                                <div className="flex mx-auto justify-between">
                                    <div className={`${styles.cardItem} mb-3`}>
                                        <h3 className="text-lg">Id</h3>
                                        <p className="text-xl">{bond.bondId}</p>
                                    </div>

                                    <div className={`${styles.cardItem} mb-3`}>
                                        <h3 className="text-lg">
                                            Available Rewards
                                        </h3>
                                        <p className="text-xl">
                                            {bondAvailableRewards(
                                                bond,
                                            ).toLocaleString("en-US", {
                                                style: "decimal",
                                                maximumFractionDigits: 2,
                                            })}{" "}
                                            KDA
                                        </p>
                                    </div>
                                    <div className={`${styles.cardItem} mb-3`}>
                                        <h3 className="text-lg">Total Polls</h3>
                                        <p className="text-xl">
                                            {bond.totalPolls}
                                        </p>
                                    </div>
                                    <div className={`${styles.cardItem} mb-3`}>
                                        <h3 className="text-lg">
                                            Active Lockups
                                        </h3>
                                        <p className="text-xl">
                                            {bond.activeBonders}
                                        </p>
                                    </div>
                                </div>
                                <p className="text-2xl text-kadena">
                                    Lockup Options
                                </p>
                                <LockupOptionsDisplay bond={bond} />

                                <button
                                    className={styles.button}
                                    onClick={() => handleOpenModal(bond)}
                                >
                                    Manage Rewards
                                </button>
                                {isModalOpen && activeBond === bond && (
                                    <ManageRewardsModal
                                        bond={bond}
                                        isOpen={isModalOpen}
                                        onClose={handleCloseModal}
                                        onAddRewards={handleAddRewardsWithClose}
                                        onClaimBackRewards={
                                            handleClaimBackRewardsWithClose
                                        }
                                    />
                                )}
                            </li>
                        ))}
                </ul>
            )}
            {!loading && !error && allBonds.length === 0 && (
                <p className="text-lg text-gray-400">No bonds available.</p>
            )}
        </div>
    );
};

export default ManageRewardsComponent;
