import React, { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  getLockupsAsync,
  selectBondLockups,
  selectBondLockupTotalItems,
} from "../bond/bondSlice";
import { shortenKAddress } from "../../utils/kadenaHelper";
import styles from "../../styles/main.module.css";
import CopyButton from "../votes/CopyButton";
import { BLOCK_EXPLORER } from "../../constants/chainInfo";
import { FaExternalLinkAlt } from "react-icons/fa";

const AllBondLockupsComponent: React.FC<{ bondId: string }> = ({ bondId }) => {
  const dispatch = useAppDispatch();
  const bondLockups = useAppSelector(selectBondLockups);
  const bondLockupTotalItems = useAppSelector(selectBondLockupTotalItems);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortByAmount, setSortByAmount] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchLockups = () => {
    dispatch(
      getLockupsAsync({
        bondId,
        page,
        pageSize,
        search: searchTerm,
        status: statusFilter || "",
        orderBy: sortByAmount ? "kdalocked" : "date",
        ignoreCache: false,
      }),
    );
  };

  useEffect(() => {
    fetchLockups();
  }, [
    dispatch,
    bondId,
    page,
    pageSize,
    sortByAmount,
    statusFilter,
    searchTerm,
  ]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(1);
  };

  const handleSortToggle = () => {
    setSortByAmount(!sortByAmount);
    setPage(1);
  };

  const handleFilterChange = (filter: string | null) => {
    setStatusFilter(filter);
    setPage(1);
  };

  const handleShowMore = () => {
    setPageSize(pageSize + 10);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Lock":
        return "text-k-Green-default";
      case "Claim":
        return "text-k-Orange-default";
      default:
        return "";
    }
  };

  return (
    <div className="container mx-auto font-kadena">
      <div className="flex flex-wrap justify-between items-center pb-5">
        <input
          id="searchLockups"
          type="text"
          placeholder="Search account"
          value={searchTerm}
          onChange={handleSearchChange}
          className={`${styles.input} mb-4 w-full sm:w-40 font-kadena`}
        />
      </div>
      <div className="flex flex-wrap justify-between items-center pb-5">
        <div className="flex flex-wrap space-x-4 items-center">
          <span className="mr-2 font-kadena">
            Total Lockups: {bondLockupTotalItems}
          </span>
          <button
            className={`${styles.buttonAll} `}
            onClick={() => handleFilterChange(null)}
          >
            All
          </button>
          <button
            className={`${styles.buttonApprove}  bg-k-Green-default hover:bg-k-Green-400 px-4 py-2`}
            onClick={() => handleFilterChange("Lock")}
          >
            Locked
          </button>
          <button
            className={`${styles.buttonAbstain}  modalButton bg-k-Orange-default hover:bg-k-Orange-400 px-4 py-2`}
            onClick={() => handleFilterChange("Claim")}
          >
            Claimed
          </button>
        </div>
        <button
          className={`${styles.buttonApprove} px-4 py-2`}
          onClick={handleSortToggle}
        >
          Sort by {sortByAmount ? "Date" : "Amount"}
        </button>
      </div>
      <div className="space-y-4">
        <div className="flex justify-between mb-2 px-2">
          <span className="flex-1">Account</span>
          <span className="flex-1">Status</span>
          <span className="flex-1">Amount + MAX rewards</span>
          <span className="flex-1">Date</span>
          {/*           <span className="flex-1">Explorer</span>*/}
        </div>
        {bondLockups.length === 0 ? (
          <div className="text-center">No results found</div>
        ) : (
          bondLockups.map((lockup, index) => (
            <div
              key={index}
              className={`innerCard flex flex-wrap sm:flex-row items-center justify-between`}
            >
              <div className="flex-1 px-2 flex items-center">
                <p className={`${styles.cardComment}`}>
                  {shortenKAddress(lockup.account)}
                </p>
                <CopyButton toCopy={lockup.account} iconSize={16} />
              </div>
              <div className="flex-1 px-2">
                <p
                  className={`${styles.cardItem} ${getStatusColor(lockup.type)}`}
                >
                  {lockup.type}ed
                </p>
              </div>
              <div className="flex-1 px-2">
                <p className={`${styles.cardItem}`}>
                  {lockup.amount.toLocaleString()} +{" "}
                  {lockup.rewards.toLocaleString()} KDA
                </p>
              </div>
              <div className="flex-1 px-2">
                <p className={`${styles.cardItem}`}>
                  {new Date(lockup.timestamp).toLocaleString()}
                </p>
              </div>
              {/*              <div className="flex-1 px-2">
                <a
                  href={BLOCK_EXPLORER(lockup.requestKey)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaExternalLinkAlt className="h-6 w-6" />
                </a>
  </div> */}
            </div>
          ))
        )}
      </div>
      {bondLockupTotalItems > pageSize && (
        <div className="flex justify-center mt-4">
          <button className={styles.button} onClick={handleShowMore}>
            Show more
          </button>
        </div>
      )}
    </div>
  );
};

export default AllBondLockupsComponent;
