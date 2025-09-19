import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

const Button = React.forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  className = '',
  onClick,
  type = 'button',
  ...props
}, ref) => {
  const baseClasses = clsx(
    // Base styles
    'inline-flex items-center justify-center',
    'font-medium',
    'border',
    'rounded-xl',
    'transition-all duration-200 ease-in-out',
    'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white',
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
    'relative overflow-hidden',
    'group',
    
    // Size variants
    {
      'h-8 px-3 text-xs': size === 'sm',
      'h-10 px-4 text-sm': size === 'md',
      'h-12 px-6 text-base': size === 'lg',
      'h-14 px-8 text-lg': size === 'xl'
    },
    
    // Width
    {
      'w-full': fullWidth
    },
    
    // Variant styles
    {
      // Primary - Modern blue with subtle shadow
      'bg-primary-600 text-white border-primary-600 shadow-sm hover:bg-primary-700 hover:shadow-md focus:ring-primary-500 active:bg-primary-800 active:shadow-sm': 
        variant === 'primary',
      
      // Secondary - Clean white with border
      'bg-white text-gray-700 border-gray-200 shadow-sm hover:bg-gray-50 hover:border-gray-300 hover:shadow-md focus:ring-primary-500 active:bg-gray-100': 
        variant === 'secondary',
      
      // Outline - Transparent with colored border
      'bg-transparent text-primary-600 border-primary-200 hover:bg-primary-50 hover:border-primary-300 focus:ring-primary-500 active:bg-primary-100': 
        variant === 'outline',
      
      // Ghost - Minimal hover effect
      'bg-transparent text-gray-600 border-transparent hover:bg-gray-100 hover:text-gray-900 focus:ring-primary-500 active:bg-gray-200': 
        variant === 'ghost',
      
      // Success
      'bg-success-600 text-white border-success-600 shadow-sm hover:bg-success-700 hover:shadow-md focus:ring-success-500 active:bg-success-800': 
        variant === 'success',
      
      // Warning
      'bg-warning-600 text-white border-warning-600 shadow-sm hover:bg-warning-700 hover:shadow-md focus:ring-warning-500 active:bg-warning-800': 
        variant === 'warning',
      
      // Error
      'bg-error-600 text-white border-error-600 shadow-sm hover:bg-error-700 hover:shadow-md focus:ring-error-500 active:bg-error-800': 
        variant === 'error',
      
      // Destructive - For dangerous actions
      'bg-red-600 text-white border-red-600 shadow-sm hover:bg-red-700 hover:shadow-md focus:ring-red-500 active:bg-red-800': 
        variant === 'destructive'
    },
    
    className
  );

  const handleClick = (e) => {
    if (disabled || loading) {
      e.preventDefault();
      return;
    }
    onClick?.(e);
  };

  return (
    <motion.button
      ref={ref}
      type={type}
      className={baseClasses}
      onClick={handleClick}
      disabled={disabled || loading}
      whileHover={!disabled && !loading ? { 
        scale: 1.02,
        transition: { duration: 0.1 }
      } : {}}
      whileTap={!disabled && !loading ? { 
        scale: 0.98,
        transition: { duration: 0.1 }
      } : {}}
      aria-disabled={disabled || loading}
      {...props}
    >
      {/* Ripple effect */}
      <motion.div
        className="absolute inset-0 bg-white opacity-0 group-active:opacity-20"
        initial={{ scale: 0, opacity: 0 }}
        whileTap={{ 
          scale: 1, 
          opacity: 0.2,
          transition: { duration: 0.1 }
        }}
      />
      
      {/* Loading overlay */}
      {loading && (
        <motion.div
          className="absolute inset-0 bg-current opacity-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.1 }}
          transition={{ duration: 0.2 }}
        />
      )}
      
      {/* Loading spinner */}
      {loading && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        </motion.div>
      )}
      
      {/* Content */}
      <motion.div 
        className={clsx('flex items-center justify-center space-x-2', { 
          'opacity-0': loading 
        })}
        initial={{ opacity: 1 }}
        animate={{ opacity: loading ? 0 : 1 }}
        transition={{ duration: 0.2 }}
      >
        {leftIcon && (
          <motion.span 
            className="flex-shrink-0"
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
          >
            {leftIcon}
          </motion.span>
        )}
        <span className="font-medium">{children}</span>
        {rightIcon && (
          <motion.span 
            className="flex-shrink-0"
            initial={{ opacity: 0, x: 4 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
          >
            {rightIcon}
          </motion.span>
        )}
      </motion.div>
    </motion.button>
  );
});

Button.displayName = 'Button';

export default Button;
