import React from 'react';
import { Check, ChevronDown } from 'react-feather';
import styles from '../../../styles/main.module.css'; // Ensure this path is correct

interface BaseButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

// BaseButton adapted to use home styles
export const BaseButton: React.FC<BaseButtonProps> = ({ children, onClick, className, disabled }) => (
  <button
    className={`${styles.button} ${className} ${disabled ? styles.buttonDisabled : ''}`}
    onClick={onClick}
    disabled={disabled}
  >
    {children}
  </button>
);

interface ButtonOutlinedProps extends BaseButtonProps {}

// ButtonOutlined using BaseButton with outlined styles
export const ButtonOutlined: React.FC<ButtonOutlinedProps> = (props) => (
  <BaseButton {...props} className={`${styles.buttonOutlined} ${props.className}`} />
);

interface ButtonPrimaryProps extends BaseButtonProps {}

// ButtonPrimary using BaseButton with primary styles
export const ButtonPrimary: React.FC<ButtonPrimaryProps> = (props) => (
  <BaseButton {...props} className={`${styles.buttonPrimary} ${props.className}`} />
);

interface ButtonDropdownProps extends BaseButtonProps {}

// ButtonDropdown using ButtonPrimary and adding ChevronDown icon
export const ButtonDropdown: React.FC<ButtonDropdownProps> = ({ children, ...rest }) => (
  <ButtonPrimary {...rest}>
    <div className={styles.rowBetween}>
      {children}
      <ChevronDown size={24} />
    </div>
  </ButtonPrimary>
);

interface ButtonRadioCheckedProps extends BaseButtonProps {
  active?: boolean;
}

// ButtonRadioChecked using ButtonOutlined for unactive state and a custom style for the active state
export const ButtonRadioChecked: React.FC<ButtonRadioCheckedProps> = ({ active, children, ...rest }) => (
  active ? (
    <div className={styles.activeOutlined}>
      <div className={styles.rowBetween}>
        {children}
        <div className={styles.checkboxWrapper}>
          <div className={styles.circle}>
            <Check size={13} />
          </div>
        </div>
      </div>
    </div>
  ) : (
    <ButtonOutlined {...rest}>{children}</ButtonOutlined>
  )
);
