import React, { forwardRef } from 'react';
import styles from './Input.module.css';

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  ({ label, error, helperText, className = '', ...props }, ref) => {
    return (
      <div className={`${styles.wrapper} ${className}`}>
        {label && <label className={styles.label}>{label}</label>}
        <input
          ref={ref}
          className={`${styles.input} ${error ? styles.inputError : ''}`}
          {...props}
        />
        {error && <p className={styles.errorText}>{error}</p>}
        {helperText && !error && <p className={styles.helperText}>{helperText}</p>}
      </div>
    );
  }
);
TextInput.displayName = 'TextInput';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, error, helperText, className = '', ...props }, ref) => {
    return (
      <div className={`${styles.wrapper} ${className}`}>
        {label && <label className={styles.label}>{label}</label>}
        <textarea
          ref={ref}
          className={`${styles.input} ${styles.textarea} ${error ? styles.inputError : ''}`}
          {...props}
        />
        {error && <p className={styles.errorText}>{error}</p>}
        {helperText && !error && <p className={styles.helperText}>{helperText}</p>}
      </div>
    );
  }
);
TextArea.displayName = 'TextArea';

interface SelectInputProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: { label: string; value: string }[];
}

export const SelectInput = forwardRef<HTMLSelectElement, SelectInputProps>(
  ({ label, error, helperText, options, className = '', ...props }, ref) => {
    return (
      <div className={`${styles.wrapper} ${className}`}>
        {label && <label className={styles.label}>{label}</label>}
        <select
          ref={ref}
          className={`${styles.input} ${styles.select} ${error ? styles.inputError : ''}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className={styles.errorText}>{error}</p>}
        {helperText && !error && <p className={styles.helperText}>{helperText}</p>}
      </div>
    );
  }
);
SelectInput.displayName = 'SelectInput';
