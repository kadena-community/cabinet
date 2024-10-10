"use client";

import React, { useEffect, useState, useRef } from "react";
import { useAppSelector, useAppDispatch } from "@/app/hooks";
import { selectMain, setConnectedAccount, updateTransaction, clearPopups, clearTransactions } from "@/features/main/mainSlice";
import ActivityIcon from "@/assets/images/history.svg";
import { XCircle } from "react-feather";
import SuccessIcon from "@/assets/images/shared/check.svg";
import PendingIcon from "@/assets/images/shared/submit.svg";
import ErrorIcon from "@/assets/images/shared/rejected.svg";
import styles from "@/styles/main.module.css";
import { listenQuick, shortenHash } from "@/utils/kadenaHelper";
import { BLOCK_EXPLORER } from "@/constants/chainInfo";


const ActivityBar = ({ accountId }: { accountId: string }) => {
  const [activity, setActivity] = useState<{ popupList: typeof mainState.popupList, transactionList: typeof mainState.transactionList } | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const mainState = useAppSelector(selectMain);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (accountId) {
      dispatch(setConnectedAccount(accountId));
    }
  }, [accountId, dispatch]);

  useEffect(() => {
    const savedPopups = localStorage.getItem(`popupList-${accountId}`);
    const savedTransactions = localStorage.getItem(`transactionList-${accountId}`);
    const popupList = savedPopups ? JSON.parse(savedPopups) : [];
    const transactionList = savedTransactions ? JSON.parse(savedTransactions) : [];

    setActivity({ popupList, transactionList });
  }, [mainState, accountId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setIsSidebarOpen(false);
      }
    };

    if (isSidebarOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSidebarOpen]);

  const handleIconClick = async () => {
    setIsSidebarOpen(!isSidebarOpen);

    if (!isSidebarOpen && activity) {
      const pendingPopups = activity.popupList.filter(popup => {
        if ('txn' in popup.content) {
          return popup.content.txn.reqKey;
        }
        return popup.content.reqKey;
      });

      const reqKeys = pendingPopups.map(popup => {
        if ('txn' in popup.content) {
          return popup.content.txn.reqKey;
        }
        return popup.content.reqKey;
      }).filter(reqKey => reqKey !== undefined) as string[];

      const pollResults = await Promise.all(reqKeys.map(key => listenQuick(key)));

      if (pollResults) {
        const pollResultsMap = Object.fromEntries(reqKeys.map((key, index) => [key, pollResults[index]]));

        const updatedTransactions = activity.transactionList.map(transaction => {
          const pollResult = pollResultsMap[transaction.tx];
          if (pollResult) {
            const newStatus = pollResult.result.status === "success" ? "succeeded" : "failed" as 'succeeded' | 'failed';
            dispatch(updateTransaction({ content: { tx: transaction.tx, status: newStatus } }));
            return { ...transaction, status: newStatus };
          }
          return transaction;
        });

        setActivity({
          popupList: activity.popupList,
          transactionList: updatedTransactions
        });

        localStorage.setItem(`transactionList-${accountId}`, JSON.stringify(updatedTransactions));
      }
    }
  };

  const handleCloseSidebar = (event: React.MouseEvent) => {
    event.stopPropagation();
    setIsSidebarOpen(false);
  };

  const clearPopupsHandler = (event: React.MouseEvent) => {
    event.stopPropagation();
    dispatch(clearPopups());
    setActivity((prev) => (prev ? { ...prev, popupList: [] } : null));
  };

  const clearTransactionsHandler = (event: React.MouseEvent) => {
    event.stopPropagation();
    dispatch(clearTransactions());
    setActivity((prev) => (prev ? { ...prev, transactionList: [] } : null));
  };

  return (
    <>
      <div className="w-6 h-6 cursor-pointer text-k-Green-default" onClick={handleIconClick}>
        <ActivityIcon />
      </div>
      <div
        ref={sidebarRef}
        className={`activitySidebarWrapper overflow-y-auto ${isSidebarOpen ? styles.sidebarOpen : styles.sidebarClosed}`}
      >
        <div className="activityBar">
          <div className="flex justify-between items-center p-4 border-b border-black dark:border-gray-600">
            <h2 className="font-kadena text-lg">Activity</h2>
            <button onClick={handleCloseSidebar}>
              <XCircle className="h-6 w-6" />
            </button>
          </div>
          <div className={styles.activitySidebarContent}>
            {!activity ? (
              <div className="text-center text-xl">No activity yet.</div>
            ) : (
              <>
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg text-kadena text-black dark:text-k-Cream-default">Popups</h3>
                    <div
                      className={styles.button}
                      onClick={clearPopupsHandler}
                    >
                      Clear
                    </div>
                  </div>
                  <ul className="list-none p-0">
                    {activity.popupList.map((popup) => (
                      <li key={popup.key} className="mb-2 flex items-center">
                        <div
                          className={`p-4 rounded-lg flex items-center ${
                            'status' in popup.content && popup.content.status === "SUCCESS" ? styles.successPopup : 'status' in popup.content && popup.content.status === "ERROR" ? styles.errorPopup : styles.pendingPopup
                          } w-full ${styles.limitedWidth}`}
                        >
                          {'status' in popup.content && popup.content.status === "SUCCESS" ? (
                            <div className="h-5 w-5 mr-4">
                              <span><SuccessIcon/></span>
                            </div>
                          ) : 'status' in popup.content && popup.content.status === "ERROR" ? (
                            <div className="h-5 w-5 mr-8">
                              <span><ErrorIcon/></span>
                            </div>
                          ) : (
                            <div className="h-2 mb-4 w-2 mr-6">
                              <span><PendingIcon/></span>
                            </div>
                          )}
                          <p>{'msg' in popup.content ? popup.content.msg : "No message"}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg text-kadena">Transactions</h3>
                    <div className={`${styles.button}`} onClick={clearTransactionsHandler}>
                      Clear
                    </div>
                  </div>
                  <ul className="list-none p-0">
                    {activity.transactionList.map((transaction) => (
                      <li key={transaction.tx} className="mb-2 flex items-center">
                        <a target="_blank" href={BLOCK_EXPLORER(transaction.tx)} className="block w-full">
                          <div
                            className={`p-4 rounded-lg flex items-center ${
                              transaction.status === "succeeded" ? styles.successPopup : transaction.status === "failed" ? styles.errorPopup : styles.pendingPopup
                            } w-full ${styles.limitedWidth}`}
                          >
                            {transaction.status === "succeeded" ? (
                              <div className="h-8 mt-2 w-auto mr-2">
                                <span><SuccessIcon/></span>
                              </div>
                            ) : transaction.status === "failed" ? (
                              <div className="h-5 w-auto mr-8">
                                <span><ErrorIcon/></span>
                              </div>
                            ) : (
                              <div className="h-2 mb-2 w-auto mr-8">
                                <span><PendingIcon/></span>
                              </div>
                            )}
                            <div>
                              <p>
                                <strong>Transaction:</strong> {shortenHash(transaction.tx)}
                              </p>
                              <p>
                                <strong>Status:</strong> {transaction.status}
                              </p>
                            </div>
                          </div>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ActivityBar;
