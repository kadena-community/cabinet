import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAppDispatch } from "../../app/hooks";
import { useKadenaReact } from "../../kadena/core";
import { checkIsCoreAccountAsync } from "../bond/bondSlice";
import styles from "../../styles/main.module.css"; // Adjust this path if necessary
import VoteIcon from "../../assets/images/voteIcon.svg";
import SafeIcon from "../../assets/images/safeIcon.svg";
import DashboardIcon from "../../assets/images/dashboardIcon.svg";
import SupportIcon from "../../assets/images/support.svg";
import UserGuideIcon from "../../assets/images/userGuide.svg";
import ManageIcon from "../../assets/images/manageIcon.svg";

const SidebarItems: React.FC<{ onClick?: () => void }> = ({ onClick }) => {
  const router = useRouter();
  const [isCoreMember, setIsCoreMember] = useState(false);
  const dispatch = useAppDispatch();
  const { account } = useKadenaReact();
  const isActive = (pathname: string) => router.pathname === pathname;

  useEffect(() => {
    if (account?.account) {
      dispatch(checkIsCoreAccountAsync(account.account)).then((result) => {
        setIsCoreMember(result.payload as boolean);
      });
    } else {
      setIsCoreMember(false);
    }
  }, [dispatch, account?.account]);

  const handleClick = (callback: () => void) => {
    if (onClick) {
      onClick();
    }
    callback();
  };

  return (
    <div className="flex flex-col p-5">
      <Link href="/" passHref>
        <div
          className={`sidebarItem ${isActive(`/`) ? `bg-k-Green-700` : ``}`}
          onClick={() => handleClick(() => router.push("/"))}
        >
          <span className="sidebarIcon">
            <DashboardIcon />
          </span>
          <span>Dashboard</span>
        </div>
      </Link>
      <Link href="/locks" passHref>
        <div
          className={`sidebarItem ${isActive(`/locks`) ? `bg-k-Green-700` : ``}`}
          onClick={() => handleClick(() => router.push("/locks"))}
        >
          <span className="sidebarIcon">
            <SafeIcon />
          </span>
          <span>Lockup</span>
        </div>
      </Link>
      <Link href="/polls" passHref>
        <div
          className={`sidebarItem ${isActive(`/polls`) ? `bg-k-Green-700` : ``}`}
          onClick={() => handleClick(() => router.push("/polls"))}
        >
          <span className="sidebarIcon">
            <VoteIcon />
          </span>
          <span>Polls</span>
        </div>
      </Link>
      <Link href="https://discord.com/invite/kadena" passHref>
        <div className="sidebarItem" onClick={onClick}>
          <span className="sidebarIcon">
            <SupportIcon />
          </span>
          <span>Support</span>
        </div>
      </Link>
      <Link
        href="https://kadenateam.notion.site/Kadena-Cabinet-User-Guide-094aa79637fe47b1b2905639453ce42d"
        passHref
      >
        <div className="sidebarItem" onClick={onClick}>
          <span className="sidebarIcon">
            <UserGuideIcon />
          </span>
          <span>User Guide</span>
        </div>
      </Link>
     {isCoreMember && (
  <Link href="/manage" passHref>
    <div className="bg-k-Cream-400 ml-[-20px] px-5 rounded-lg shadow-lg w-64 dark:bg-k-Blue-100 float-left h-18">
      <div
        className={`sidebarItem ${isActive(`/manage`) ? `bg-k-Green-700` : ``} flex items-center h-full`}
        onClick={() => handleClick(() => router.push("/manage"))}
      >
        <div className="flex items-center">
          <span className="sidebarIcon">
            <ManageIcon />
          </span>
          <span>Manage</span>
        </div>
      </div>
    </div>
  </Link>
)}

    </div>
  );
};

export default SidebarItems;
