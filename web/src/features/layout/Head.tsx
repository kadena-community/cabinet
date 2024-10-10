import React, { useState } from "react";
import { Menu } from "react-feather";
import useScrollPosition from "@react-hook/window-scroll";
import { useKadenaReact } from "../../kadena/core";
import { useLoginModalToggle } from "../wallet/hooks";
import Web3Status from "../components/Web3Status";
import CabinetLogo from "@/assets/images/cabinetLogo.svg"; // Light mode SVG
import { selectIsCoreMember } from "../bond/bondSlice";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  CHAIN_INFO,
  KADENA_CHAIN_ID,
  KADENA_NETWORK_ID,
} from "@/constants/chainInfo";
import GasStation from "@/features/gasStation";
import ActivityBar from "@/features/activityBar";
import SidebarModal from "./SidebarModal"; // Import SidebarModal component
import ThemeToggle from "./ThemeToggler";

export default function Head() {
  const dispatch = useAppDispatch();
  const toggleLoginModal = useLoginModalToggle();
  const { account } = useKadenaReact();
  const scrollY = useScrollPosition(60); // The value here sets when the header style changes
  const isCoreMember = useAppSelector(selectIsCoreMember);
  const [isSidebarOpen, setSidebarOpen] = useState(false); // State to toggle sidebar

  return (
        <div
            className={`headerWrapper headerWrapperWithBorder ${scrollY > 45 ? "shadow-md" : ""} font-kadena`}
        >
            {/* Flex container for the header */}
            <div className="flex flex-col sm:flex-row justify-between items-center w-full px-4 py-2">
                {/* Mobile Menu Icon */}
                <div className="flex items-center w-full md:w-auto mb-2 md:mb-0">
                    <div className="md:hidden">
                        <Menu
                            onClick={() => setSidebarOpen(true)}
                            size={24}
                        />
                    </div>
                    <a href="https://kadena.io/cabinet">
                    <div className="flex h-12 w-auto">
                        <CabinetLogo/>
                    </div>
                    </a>

                </div>
                <div className="flex flex-row items-center justify-between w-full sm:w-auto space-x-2 sm:space-x-4">
                    <p className="font-kadena text-black dark:text-k-Cream-default">
                        {CHAIN_INFO[KADENA_NETWORK_ID].displayName} Chain {KADENA_CHAIN_ID}
                    </p>
                    <ThemeToggle/>
                    <GasStation />
                    {account?.account && <ActivityBar accountId={account.account} />}
                    <Web3Status />
                </div>
            </div>
            {/* Sidebar Modal for Mobile */}
            <SidebarModal
                isOpen={isSidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />
        </div>
    );
}
