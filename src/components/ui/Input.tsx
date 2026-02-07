import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes, type ReactNode } from "react";

interface InputBaseProps {
  error?: string;
  icon?: ReactNode;
}

type InputProps = InputBaseProps & Omit<InputHTMLAttributes<HTMLInputElement>, "size">;

const INPUT_CLASSES =
  "w-full bg-transparent border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary outline-none focus:ring-1 transition-colors";

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, icon, className = "", ...rest }, ref) => {
    const borderClass = error
      ? "border-red-500 focus:ring-red-500"
      : "border-border focus:ring-green-primary";

    if (icon) {
      return (
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary">
            {icon}
          </span>
          <input
            ref={ref}
            className={`${INPUT_CLASSES} pl-9 ${borderClass} ${className}`}
            {...rest}
          />
          {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
      );
    }

    return (
      <div>
        <input
          ref={ref}
          className={`${INPUT_CLASSES} ${borderClass} ${className}`}
          {...rest}
        />
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>
    );
  },
);

Input.displayName = "Input";
export default Input;

/* Textarea variant */
type TextareaProps = InputBaseProps & TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ error, className = "", ...rest }, ref) => {
    const borderClass = error
      ? "border-red-500 focus:ring-red-500"
      : "border-border focus:ring-green-primary";

    return (
      <div>
        <textarea
          ref={ref}
          className={`${INPUT_CLASSES} resize-y min-h-[60px] ${borderClass} ${className}`}
          {...rest}
        />
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>
    );
  },
);

Textarea.displayName = "Textarea";
