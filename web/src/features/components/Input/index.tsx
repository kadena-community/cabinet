import React from 'react';
import { DebounceInput } from 'react-debounce-input';
import styles from '../../../styles/main.module.css';

interface InputProps {
  htmlFor?: string;
  id: string;
  type?: string;
  isSoon?: boolean;
  placeholder: string;
  label: string;
  value?: string;
  defaultValue?: string;
  handleChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  error?: string;
  disabled?: boolean;
}

export function InputWithLabel({
  label,
  isSoon,
  id,
  htmlFor = 'input',
  type = 'text',
  placeholder,
  value,
  defaultValue,
  handleChange,
  error,
  disabled,
}: InputProps) {
  return (
    <div className={styles.inputWrapper}>
      <label className={styles.fieldLabel} htmlFor={htmlFor}>
        {label} {isSoon && `(In progress)`}
      </label>
      <input
        className={styles.input}
        defaultValue={defaultValue}
        name={id}
        id={id}
        type={type}
        disabled={disabled || isSoon}
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
      />
      {error && <p className={styles.errorText}>{error}</p>}
    </div>
  );
}

export function DebouncedInputWithLabel({
  label,
  htmlFor = 'input',
  type = 'text',
  placeholder,
  value,
  handleChange,
  error,
}: InputProps) {
  return (
    <div className={styles.inputWrapper}>
      <label className={styles.fieldLabel} htmlFor={htmlFor}>
        {label}
      </label>
      <DebounceInput
        className={styles.input}
        type={type}
        placeholder={placeholder}
        value={value}
        debounceTimeout={500}
        onChange={handleChange as any}
      />
      {error && <p className={styles.errorText}>{error}</p>}
    </div>
  );
}

export function TextareaWithLabel({
  label,
  id,
  htmlFor = 'input',
  placeholder,
  error,
  value,
  handleChange,
}: InputProps) {
  return (
    <div className={styles.inputWrapper}>
      <label className={styles.fieldLabel} htmlFor={htmlFor}>
        {label}
      </label>
      <textarea
        className={styles.textarea}
        name={id}
        id={id}
        placeholder={placeholder}
        value={value}
        rows={8}
        onChange={handleChange}
      />
      {error && <p className={styles.errorText}>{error}</p>}
    </div>
  );
}
