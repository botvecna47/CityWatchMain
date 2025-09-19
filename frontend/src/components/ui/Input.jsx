import React, { useState } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';

const Input = React.forwardRef(({
  label,
  error,
  success,
  hint,
  leftIcon,
  rightIcon,
  type = 'text',
  size = 'md',
  fullWidth = true,
  disabled = false,
  required = false,
  className = '',
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const isPassword = type === 'password';
  const inputType = isPassword && showPassword ? 'text' : type;
  const hasError = !!error;
  const hasSuccess = !!success && !hasError;

  const inputClasses = clsx(
    // Base styles
    'block w-full',
    'border rounded-xl',
    'bg-white',
    'text-gray-900',
    'placeholder-gray-400',
    'transition-all duration-200 ease-in-out',
    'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white',
    'shadow-sm',
    
    // Size variants
    {
      'h-8 px-3 text-xs': size === 'sm',
      'h-10 px-3 text-sm': size === 'md',
      'h-12 px-4 text-base': size === 'lg'
    },
    
    // State styles
    {
      // Default state
      'border-gray-200 focus:border-primary-500 focus:ring-primary-500 hover:border-gray-300': 
        !hasError && !hasSuccess && !disabled,
      
      // Error state
      'border-error-300 focus:border-error-500 focus:ring-error-500': 
        hasError,
      
      // Success state
      'border-success-300 focus:border-success-500 focus:ring-success-500': 
        hasSuccess,
      
      // Disabled state
      'bg-gray-50 text-gray-500 cursor-not-allowed border-gray-200': 
        disabled
    },
    
    // Icons padding
    {
      'pl-10': leftIcon,
      'pr-10': rightIcon || isPassword,
      'pl-10 pr-10': leftIcon && (rightIcon || isPassword)
    },
    
    className
  );

  const handleFocus = (e) => {
    setIsFocused(true);
    props.onFocus?.(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    props.onBlur?.(e);
  };

  return (
    <div className={clsx('space-y-1', { 'w-full': fullWidth })}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      {/* Input container */}
      <div className="relative">
        {/* Left icon */}
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <div className="text-gray-400">
              {leftIcon}
            </div>
          </div>
        )}
        
        {/* Input field */}
        <motion.input
          ref={ref}
          type={inputType}
          className={inputClasses}
          disabled={disabled}
          onFocus={handleFocus}
          onBlur={handleBlur}
          whileFocus={{ scale: 1.01 }}
          transition={{ duration: 0.1 }}
          {...props}
        />
        
        {/* Right icon or password toggle */}
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          {isPassword ? (
            <button
              type="button"
              className="text-gray-400 hover:text-gray-600 transition-colors"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          ) : rightIcon ? (
            <div className="text-gray-400">
              {rightIcon}
            </div>
          ) : null}
        </div>
        
        {/* Status icons */}
        {(hasError || hasSuccess) && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            {hasError ? (
              <AlertCircle className="w-4 h-4 text-error-500" />
            ) : hasSuccess ? (
              <CheckCircle className="w-4 h-4 text-success-500" />
            ) : null}
          </div>
        )}
      </div>
      
      {/* Hint or error message */}
      {(hint || error || success) && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {error ? (
            <p className="text-sm text-red-600 flex items-center">
              <AlertCircle className="w-3 h-3 mr-1" />
              {error}
            </p>
          ) : success ? (
            <p className="text-sm text-green-600 flex items-center">
              <CheckCircle className="w-3 h-3 mr-1" />
              {success}
            </p>
          ) : (
            <p className="text-sm text-gray-500">
              {hint}
            </p>
          )}
        </motion.div>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
