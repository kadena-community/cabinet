import React, { MouseEventHandler } from "react";
import styles from "../../../styles/main.module.css";

export default function Option({
  link = null,
  clickable = true,
  onClick = undefined,
  color,
  header,
  icon,
  isActive = false,
  id,
}: {
  link?: string | null;
  clickable?: boolean;
  onClick?: undefined | MouseEventHandler<HTMLDivElement>;
  color: string;
  header: React.ReactNode;
  icon: string;
  isActive?: boolean;
  id: string;
}) {
  const content = (
    <div
      id={id}
      onClick={onClick}
      className={`${styles.optionCardClickable} ${clickable && !isActive ? styles.clickable : ""} ${isActive ? styles.active : ""}`}
      data-testid="wallet-modal-option"
    >
      <div className={styles.iconWrapper}>
        <img src={icon} alt={"Icon"} />
      </div>
      <div className={styles.headerText} style={{ color: color }}>
        {isActive ? (
          <div className={styles.circleWrapper}>
            <div className={styles.greenCircle}></div>
          </div>
        ) : (
          ""
        )}
        {header}
      </div>
    </div>
  );

  if (link) {
    return (
      <a href={link} className={styles.externalLink}>
        {content}
      </a>
    );
  }

  return content;
}
