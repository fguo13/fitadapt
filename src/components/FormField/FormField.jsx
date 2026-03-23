import styles from './FormField.module.scss';

export default function FormField({
  label,
  id,
  type = 'text',
  placeholder,
  value,
  onChange,
  rightLabel,
  onRightLabelClick,
}) {
  return (
    <div className={styles.field}>
      <div className={styles.labelRow}>
        <label className={styles.label} htmlFor={id}>{label}</label>
        {rightLabel && (
          <span className={styles.rightLabel} onClick={onRightLabelClick}>
            {rightLabel}
          </span>
        )}
      </div>
      <input
        className={styles.input}
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    </div>
  );
}
