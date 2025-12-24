import { ReactNode, ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    children: ReactNode;
    isLoading?: boolean;
}

export default function Button({ variant = 'primary', children, isLoading, className = '', ...props }: ButtonProps) {
    const baseStyles = "inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
        primary: "bg-primary text-white hover:bg-primary-hover shadow-lg shadow-orange-500/20",
        secondary: "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50",
        danger: "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200",
        ghost: "text-slate-500 hover:text-slate-900 hover:bg-slate-100/50"
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${className}`}
            disabled={isLoading || props.disabled}
            {...props}
        >
            {isLoading ? (
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
            ) : null}
            {children}
        </button>
    );
}
