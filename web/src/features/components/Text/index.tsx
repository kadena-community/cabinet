import React, { ReactNode } from "react";
import styles from "../../../styles/main.module.css"; // Ensure this path is correct

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode;
  end?: boolean;
}

// Label component
export const Label: React.FC<LabelProps> = ({ children, end }) => {
  return (
    <div className={`${styles.label} ${end ? styles.end : ""}`}>{children}</div>
  );
};

interface TagLabelProps {
  children: React.ReactNode;
  backgroundColor: string;
  color: string;
  padding?: number;
  fontSize?: number;
}

// TagLabel component
export const TagLabel: React.FC<TagLabelProps> = ({
  children,
  backgroundColor,
  color,
  padding,
  fontSize,
}) => {
  const style = {
    backgroundColor: backgroundColor,
    color: color,
    padding: padding ? `${padding}px` : "8px 16px",
    fontSize: fontSize ? `${fontSize}px` : "14px",
  };

  return (
    <div className={styles.tagLabel} style={style}>
      {children}
    </div>
  );
};
