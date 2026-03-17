import React from 'react';

interface Props {
  children: React.ReactNode;
  variant?: 'default' | 'outline';
  className?: string;
  onClick?: () => void;
}

export const Badge: React.FC<Props> = ({ children, variant = 'default', className = '', onClick }) => {
  const baseStyles = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";
  const variants = {
    default: "border-transparent bg-bulela-green text-white hover:bg-bulela-green/80",
    outline: "text-foreground border border-input hover:bg-accent hover:text-accent-foreground"
  };

  return (
    <div 
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {children}
    </div>
  );
};
