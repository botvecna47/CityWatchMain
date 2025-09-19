import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

const Card = React.forwardRef(({
  children,
  variant = 'default',
  padding = 'md',
  className = '',
  hover = false,
  onClick,
  ...props
}, ref) => {
  const baseClasses = clsx(
    // Base styles
    'bg-white',
    'border',
    'rounded-2xl',
    'transition-all duration-300 ease-in-out',
    'relative overflow-hidden',
    
    // Padding variants
    {
      'p-4': padding === 'sm',
      'p-6': padding === 'md',
      'p-8': padding === 'lg',
      'p-10': padding === 'xl'
    },
    
    // Variant styles
    {
      'border-gray-200 shadow-sm': variant === 'default',
      'border-gray-200 shadow-md': variant === 'elevated',
      'border-gray-200 shadow-xl': variant === 'floating',
      'border-primary-200 shadow-md bg-primary-50/30': variant === 'highlighted',
      'border-transparent bg-gradient-to-br from-primary-50 to-primary-100 shadow-md': variant === 'gradient',
      'border-gray-200 shadow-lg backdrop-blur-sm bg-white/80': variant === 'glass'
    },
    
    // Interactive styles
    {
      'cursor-pointer hover:shadow-lg hover:-translate-y-1 hover:border-primary-300': hover && onClick,
      'cursor-default': !onClick
    },
    
    className
  );

  const Component = onClick ? motion.div : 'div';
  const motionProps = onClick ? {
    whileHover: { 
      scale: 1.02, 
      y: -4,
      transition: { duration: 0.2, ease: "easeOut" }
    },
    whileTap: { 
      scale: 0.98,
      transition: { duration: 0.1 }
    },
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3, ease: "easeOut" }
  } : {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3, ease: "easeOut" }
  };

  return (
    <Component
      ref={ref}
      className={baseClasses}
      onClick={onClick}
      {...motionProps}
      {...props}
    >
      {/* Subtle gradient overlay for depth */}
      {variant === 'default' && (
        <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent pointer-events-none" />
      )}
      {children}
    </Component>
  );
});

Card.displayName = 'Card';

// Card sub-components
const CardHeader = React.forwardRef(({ children, className = '', ...props }, ref) => (
  <motion.div
    ref={ref}
    className={clsx('mb-6', className)}
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay: 0.1 }}
    {...props}
  >
    {children}
  </motion.div>
));

CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef(({ children, className = '', size = 'lg', ...props }, ref) => (
  <h3
    ref={ref}
    className={clsx(
      'font-semibold text-gray-900 leading-tight',
      {
        'text-lg': size === 'lg',
        'text-xl': size === 'xl',
        'text-2xl': size === '2xl'
      },
      className
    )}
    {...props}
  >
    {children}
  </h3>
));

CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef(({ children, className = '', ...props }, ref) => (
  <p
    ref={ref}
    className={clsx(
      'text-sm text-gray-600 leading-relaxed mt-2',
      className
    )}
    {...props}
  >
    {children}
  </p>
));

CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef(({ children, className = '', ...props }, ref) => (
  <motion.div
    ref={ref}
    className={clsx('relative z-10', className)}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay: 0.2 }}
    {...props}
  >
    {children}
  </motion.div>
));

CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef(({ children, className = '', ...props }, ref) => (
  <motion.div
    ref={ref}
    className={clsx('mt-6 pt-4 border-t border-gray-200/60', className)}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay: 0.3 }}
    {...props}
  >
    {children}
  </motion.div>
));

CardFooter.displayName = 'CardFooter';

// Attach sub-components to Card
Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Description = CardDescription;
Card.Content = CardContent;
Card.Footer = CardFooter;

export default Card;
