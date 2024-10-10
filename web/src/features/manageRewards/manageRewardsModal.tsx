import React, { useState } from "react";
import styles from "../../styles/main.module.css";
import { Bond } from "../bond/types";
import IManageRewards from "./types";
import { useKadenaReact } from "../../kadena/core";
import { bondAvailableRewards } from "../bond/Bonds";

interface ManageRewardsModalProps {
    bond: Bond;
    isOpen: boolean;
    onClose: () => void;
    onAddRewards: (params: IManageRewards) => void;
    onClaimBackRewards: (params: IManageRewards) => void;
}

const ManageRewardsModal: React.FC<ManageRewardsModalProps> = ({
    bond,
    isOpen,
    onClose,
    onAddRewards,
    onClaimBackRewards,
}) => {
    const { account } = useKadenaReact();
    const [color, setColor] = useState("bg-K-blue-default");
    const [value, setValue] = useState<string>("0");
    const [manageRewardsParams, setManageRewardsParams] =
        useState<IManageRewards>({
            account: account?.account || "",
            bondId: bond.bondId,
            amount: 0,
        });

    const handleColorToggle = (newColor: string) => setColor(newColor);

    const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = event.target.value;
        setValue(newValue);
        setManageRewardsParams((prevParams) => ({
            ...prevParams,
            amount: parseFloat(newValue),
        }));
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = event.target.value;
        setValue(newValue);
        setManageRewardsParams((prevParams) => ({
            ...prevParams,
            amount: parseFloat(newValue),
        }));
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div className={`${styles.modalOverlay} ${!isOpen ? "hidden" : ""}`}>
            <div className={styles.modalContainer}>
                <div className={`modal ${color}`}>
                    <h2 className={styles.modalHeader}>Manage Rewards</h2>
                    <div className={styles.modalBody}>
                        <button
                            onClick={() =>
                                handleColorToggle(styles.buttonApprove)
                            }
                            className={`${styles.button} ${styles.buttonApprove}`}
                        >
                            Add Rewards
                        </button>
                        <button
                            onClick={() =>
                                handleColorToggle(styles.buttonReject)
                            }
                            className={`${styles.button} ${styles.buttonReject}`}
                        >
                            Claim Rewards
                        </button>
                        {color === styles.buttonApprove && (
                            <>
                                <input
                                    type="range"
                                    min="0"
                                    max={account?.balance}
                                    value={value}
                                    step="0.01"
                                    onChange={handleSliderChange}
                                    className={styles.input}
                                />
                                <input
                                    type="number"
                                    value={value}
                                    min="0"
                                    max={account?.balance}
                                    step="0.01"
                                    onChange={handleInputChange}
                                    className={styles.input}
                                />
                            </>
                        )}
                        {color === styles.buttonReject && (
                            <>
                                <input
                                    type="range"
                                    min="0"
                                    max={bondAvailableRewards(bond)}
                                    value={value}
                                    step="0.01"
                                    onChange={handleSliderChange}
                                    className={styles.input}
                                />
                                <input
                                    type="number"
                                    value={value}
                                    min="0"
                                    max={bondAvailableRewards(bond)}
                                    step="0.01"
                                    onChange={handleInputChange}
                                    className={styles.input}
                                />
                            </>
                        )}
                    </div>
                    <div className={styles.modalActions}>
                        {color === styles.buttonApprove && (
                            <button
                                className={styles.button}
                                onClick={() =>
                                    onAddRewards(manageRewardsParams)
                                }
                            >
                                Add
                            </button>
                        )}
                        {color === styles.buttonReject && (
                            <button
                                className={styles.button}
                                onClick={() =>
                                    onClaimBackRewards(manageRewardsParams)
                                }
                            >
                                Claim
                            </button>
                        )}
                        <button className={styles.button} onClick={onClose}>
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManageRewardsModal;
