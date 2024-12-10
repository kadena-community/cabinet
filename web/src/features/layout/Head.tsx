import React, { useEffect, useState } from "react";
import { Menu } from "react-feather";
import useScrollPosition from "@react-hook/window-scroll";
import { useKadenaReact } from "../../kadena/core";
import Web3Status from "../components/Web3Status";
import CabinetLogo from "@/assets/images/cabinetLogo.svg"; // Light mode SVG
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
import {
  selectGasStationEnabled,
  toggleGasStation,
} from "../gasStation/gasSlice";
import { useAddPopup } from "../main/hooks";

export default function Head() {
  const dispatch = useAppDispatch();
  const kda = useKadenaReact();
  const scrollY = useScrollPosition(60); // The value here sets when the header style changes
  const [isSidebarOpen, setSidebarOpen] = useState(false); // State to toggle sidebar
  const gasStationEnabled = useAppSelector(selectGasStationEnabled);
  const addPopup = useAddPopup();
  const popupShownKey = "gasStationPopupShown";

  // Add hasMounted state
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (
      kda.connector?.constructor?.name === "WalletConnect" &&
      gasStationEnabled
    ) {
      // Disable gas station for WalletConnect users if currently enabled
      dispatch(toggleGasStation());

      const popupShown = localStorage.getItem(popupShownKey);

      if (!popupShown) {
        addPopup({
          reqKey: undefined,
          msg: `Gas station disabled due to known issues with your provider.`,
          status: "WARNING",
        });
        localStorage.setItem(popupShownKey, "true");
      }
    }
  }, [kda.connector, dispatch]);

  return (
    <div
      className={`headerWrapper headerWrapperWithBorder ${
        hasMounted && scrollY > 45 ? "shadow-md" : ""
      } font-kadena`}
    >
      {/* Flex container for the header */}
      <div className="flex flex-col sm:flex-row justify-between items-center w-full px-4 py-2">
        {/* Mobile Menu Icon */}
        <div className="flex items-center w-full md:w-auto mb-2 md:mb-0">
          <div className="md:hidden">
            <Menu onClick={() => setSidebarOpen(true)} size={24} />
          </div>
          <a href="https://kadena.io/cabinet">
            <div className="flex h-12 w-auto">
              <CabinetLogo />
            </div>
          </a>
        </div>
        <div className="flex flex-row items-center justify-between w-full sm:w-auto space-x-2 sm:space-x-4">
          <p className="font-kadena text-black dark:text-k-Cream-default">
            {CHAIN_INFO[KADENA_NETWORK_ID].displayName} Chain {KADENA_CHAIN_ID}
          </p>
          <ThemeToggle />
          <GasStation />
          {kda?.account && <ActivityBar accountId={kda.account.account} />}
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
