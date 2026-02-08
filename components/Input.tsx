
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

const Input: React.FC<InputProps> = ({ label, className = '', ...props }) => {
  return (
    <div className="flex flex-col space-y-2 w-full">
      <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/40 ml-1">
        {label}
      </label>
      <input
        className={`bg-white/5 border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-[#00ff9c] focus:ring-1 focus:ring-[#00ff9c]/30 transition-all duration-300 text-white placeholder-white/20 ${className}`}
        {...props}
      />
    </div>
  );
};

export default Input;
