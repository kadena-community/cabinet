import React from "react";
import { useActivePopups } from "../../main/hooks";
import PopupItem from "./PopupItem";
import styles from "@/styles/main.module.css";

export default function Popups() {
  const activePopups = useActivePopups();

  return (
    <div className={styles.fixedPopupColumn}>
      {activePopups.map((item) => (
        <PopupItem
          key={item.key}
          content={item.content}
          popKey={item.key}
          removeAfterMs={item.removeAfterMs}
        />
      ))}
    </div>
  );
}
