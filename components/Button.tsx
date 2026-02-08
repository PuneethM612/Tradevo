
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  className = '', 
  ...props 
}) => {
  const baseStyles = "px-8 py-4 text-sm font-bold uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-[#00ff9c] text-black hover:shadow-[0_0_20px_rgba(0,255,156,0.4)]",
    secondary: "bg-white text-black hover:bg-[#00ff9c]",
    outline: "border border-white/10 hover:border-[#00ff9c] hover:text-[#00ff9c]"
  };

  const widthStyle = fullWidth ? "w-full" : "";

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${widthStyle} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
