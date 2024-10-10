import React, { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import styles from "../../styles/main.module.css";
import {
  getAllBondsAsync,
  selectAllBonds,
  selectBondLoading,
  selectBondError,
  setActiveBond,
  getLockupDensityAsync,
  getLockupSummaryAsync,
} from "./bondSlice";
import { Bond } from "./types";
import { useKadenaReact } from "@/kadena/core";
import CreateLockupComponent from "../lockup/lockupComponent";
import {
  getLockupDetailsAsync,
  selectLockupDetails,
} from "../lockup/lockupSlice";
import Info, { InfoTopics } from "@/features/info";
import BondDetailsModal from "./BondDetailsModal";
import { AppLoader } from "@/features/components/Loader";
import Error from "@/features/components/Error";
import BondLockupDistributionBarChart from "./LockupStatusChart";

interface ValidationErrors {
  [key: string]: string | null;
}

export function bondAvailableRewards(bond: Bond): number {
  return bond.totalRewards - (bond.lockedRewards + bond.givenRewards);
}

const Bonds: React.FC = () => {
  const kda = useKadenaReact();
  const dispatch = useAppDispatch();
  const allBonds = useAppSelector(selectAllBonds);
  const loading = useAppSelector(selectBondLoading);
  const error = useAppSelector(selectBondError);
  const lockups = useAppSelector(selectLockupDetails);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [lockupModalOpen, setLockupModalOpen] = useState(false);
  const [selectedBond, setSelectedBond] = useState<Bond | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [bondedBonds, setBondedBonds] = useState(new Set());
  const [timeRemaining, setTimeRemaining] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    dispatch(getAllBondsAsync());
  }, [dispatch]);

  useEffect(() => {
    if (lockups) {
      const bondedSet = new Set(
        lockups
          .filter((lockup) => lockup.status === "locked")
          .map((lockup) => lockup.bondId)
      );
      setBondedBonds(bondedSet);
    }
  }, [lockups]);

  useEffect(() => {
    if (!lockups && kda.account) {
      dispatch(
        getLockupDetailsAsync({
          account: kda.account.account,
          ignoreCache: false,
        })
      );
    }
  }, [dispatch, kda.account, lockups]);

  useEffect(() => {
    const interval = setInterval(() => {
      const currTime = new Date().getTime();
      const newValidationErrors: ValidationErrors = {};
      const newTimeRemaining: { [key: string]: number } = {};

      allBonds.forEach((bond) => {
        const startTime = Date.parse(bond.startTime);
        const alreadyBonded = bondedBonds.has(bond.bondId);
        let error: string | null = null;
        if (kda.account) {
          if (alreadyBonded) {
            error = "Account already locked";
          } else if (!alreadyBonded && currTime < startTime) {
            const timeLeft = startTime - currTime;
            newTimeRemaining[bond.bondId] = timeLeft;
            error = `Lockup available in ${Math.ceil(timeLeft / 1000)} seconds`;
          }
        }
        newValidationErrors[bond.bondId] = error ? error : null;
      });

      setValidationErrors(newValidationErrors);
      setTimeRemaining(newTimeRemaining);
    }, 1000);

    return () => clearInterval(interval);
  }, [allBonds, bondedBonds, kda.account]);

  useEffect(() => {
    if (selectedBond) {
      dispatch(getLockupDensityAsync(selectedBond.bondId));
      dispatch(getLockupSummaryAsync(selectedBond.bondId));
    }
  }, [dispatch, selectedBond]);

  const handleBondClick = (bond: Bond) => {
    dispatch(setActiveBond(bond));
    setSelectedBond(bond);
    setDetailsModalOpen(true);
  };

  const handleJoinBondClick = (bond: Bond, event: React.MouseEvent) => {
    event.stopPropagation();
    dispatch(setActiveBond(bond));
    setSelectedBond(bond);
    setLockupModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setDetailsModalOpen(false);
  };

  const handleCloseLockupModal = () => {
    setLockupModalOpen(false);
  };

  if (loading)
    return (
      <div>
        <AppLoader size="96px" stroke="#E27B38" />
      </div>
    );

  if (error) return <Error message={error} />;

  return (
    <div className="container mx-auto p-4">
    <div className="flex flex-row justify-start items-center pb-5 relative">
      <h1 className="text-3xl font-semibold mb-4">Available Lockups</h1>
      <div className="relative max-xs:absolute max-xs:bottom-32 max-xs:left-48 bottom-4 left-4">
        <Info topic={InfoTopics.GENERAL_REWARDS} />
      </div>
    </div>


    {allBonds.length > 0 ? (
      <div className="space-y-4">
        <div className="grid grid-cols-3 md:grid-cols-5 mb-2 px-2">
          <span className="col-span-1 mr-2">Active Lockups</span>
          <span className="col-span-1">Available Rewards</span>
          <span className="hidden md:col-span-2 md:block">Status</span>
          <span className="col-span-1 ml-2">Action</span>
        </div>
        {allBonds.map((bond) => (
          <div
            key={bond.bondId}
            className="card grid grid-cols-3 md:grid-cols-5 items-center"
            onClick={() => handleBondClick(bond)}
          >
            <div className="col-span-1 px-2 flex items-center">
              <p className={styles.cardItem}>{bond.activeBonders}</p>
            </div>
            <div className="col-span-1 px-2">
              <p className={styles.cardItem}>
                {bondAvailableRewards(bond).toLocaleString("en-US", {
                  style: "decimal",
                  maximumFractionDigits: 2,
                })}{" "}
                KDA
              </p>
            </div>
            <div className="hidden md:col-span-2 md:flex md:px-2">
              <BondLockupDistributionBarChart bond={bond} />
            </div>
            <div className="col-span-1 px-2">
              <button
                className={`${styles.button} w-full overflow-hidden md:w-auto`}
                onClick={(event) => handleJoinBondClick(bond, event)}
                disabled={validationErrors[bond.bondId] != null || !kda.account}
              >
                {kda.account
                ? validationErrors[bond.bondId] == null
                ? "Lock"
                : validationErrors[bond.bondId]
                : "Connect wallet to lock"}
              </button>
            </div>

          </div>
        ))}
      </div>
    ) : (
      <p>No bonds available.</p>
    )}

    {detailsModalOpen && selectedBond && (
      <BondDetailsModal
        bond={selectedBond}
        isOpen={detailsModalOpen}
        onClose={handleCloseDetailsModal}
      />
    )}
      {lockupModalOpen && selectedBond && (
        <CreateLockupComponent
          bond={selectedBond}
          isOpen={lockupModalOpen}
          onClose={handleCloseLockupModal}
        />
      )}
    </div>
  );
};

export default Bonds;
