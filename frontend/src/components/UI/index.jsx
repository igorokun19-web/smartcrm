import clsx from "clsx";
import { components } from "../../styles/theme";

/**
 * Button Component - Accessible and versatile
 */
export function Button({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  icon: Icon,
  className,
  ...props
}) {
  return (
    <button
      disabled={disabled || loading}
      className={clsx(
        components.button.base,
        components.button.sizes[size],
        components.button.variants[variant],
        loading && "opacity-60 cursor-not-allowed",
        className
      )}
      {...props}
    >
      {Icon && <Icon className="mr-2 h-4 w-4" />}
      {loading ? "Loading..." : children}
    </button>
  );
}

/**
 * Card Component - Container for content
 */
export function Card({
  children,
  hover = false,
  className,
  ...props
}) {
  return (
    <div
      className={clsx(
        components.card.base,
        hover && components.card.hover,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * Input Component - Text input with accessibility
 */
export function Input({
  label,
  error,
  helper,
  required = false,
  className,
  ...props
}) {
  const inputId = props.id || `input-${Math.random()}`;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-semibold text-neutral-700 mb-2"
        >
          {label}
          {required && <span className="text-red-600 ml-1">*</span>}
        </label>
      )}
      <input
        id={inputId}
        className={clsx(
          components.input.base,
          error && "border-red-500 focus:ring-red-500",
          className
        )}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : undefined}
        {...props}
      />
      {error && (
        <p
          id={`${inputId}-error`}
          className="text-red-600 text-sm mt-1"
          role="alert"
        >
          {error}
        </p>
      )}
      {helper && !error && (
        <p className="text-neutral-500 text-sm mt-1">{helper}</p>
      )}
    </div>
  );
}

/**
 * Select Component
 */
export function Select({
  label,
  options,
  error,
  required = false,
  className,
  ...props
}) {
  const selectId = props.id || `select-${Math.random()}`;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={selectId}
          className="block text-sm font-semibold text-neutral-700 mb-2"
        >
          {label}
          {required && <span className="text-red-600 ml-1">*</span>}
        </label>
      )}
      <select
        id={selectId}
        className={clsx(
          components.input.base,
          error && "border-red-500 focus:ring-red-500",
          className
        )}
        aria-invalid={!!error}
        {...props}
      >
        <option value="">בחר אפשרות</option>
        {options?.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-red-600 text-sm mt-1" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * Badge Component - Status indicator
 */
export function Badge({
  children,
  variant = "primary",
  className,
  ...props
}) {
  return (
    <span
      className={clsx(components.badge.base, components.badge.variants[variant], className)}
      {...props}
    >
      {children}
    </span>
  );
}

/**
 * Modal Component - Dialog box
 */
export function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = "md",
}) {
  if (!isOpen) return null;

  const sizes = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
      <div className={clsx("bg-white rounded-2xl shadow-2xl w-full", sizes[size])}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200">
          <h2 className="text-xl font-bold text-neutral-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-neutral-500 hover:text-neutral-700 transition"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 p-6 border-t border-neutral-200">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Table Component
 */
export function Table({ headers, rows, className }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-neutral-200">
      <table className="w-full">
        <thead>
          <tr className={components.table.header}>
            {headers?.map((header) => (
              <th
                key={header}
                className={clsx(components.table.cell, "text-right")}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows?.map((row, idx) => (
            <tr key={idx} className={components.table.row}>
              {row?.map((cell, cellIdx) => (
                <td key={cellIdx} className={clsx(components.table.cell, "text-right")}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Loading Skeleton
 */
export function Skeleton({ className, count = 1 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={clsx(
            "bg-neutral-200 rounded animate-pulse",
            className
          )}
        />
      ))}
    </>
  );
}

/**
 * Empty State
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {Icon && <Icon className="h-12 w-12 text-neutral-400 mb-4" />}
      <h3 className="text-lg font-semibold text-neutral-900 mb-2">
        {title}
      </h3>
      <p className="text-neutral-500 text-sm max-w-sm mb-6">
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
}
