import React from 'react';

const ByteMeLogo = ({ 
  size = 'default', 
  variant = 'full', 
  className = '',
  showTagline = false 
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'text-lg';
      case 'large':
        return 'text-3xl';
      default:
        return 'text-xl';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'small':
        return 'w-6 h-6';
      case 'large':
        return 'w-12 h-12';
      default:
        return 'w-8 h-8';
    }
  };

  if (variant === 'icon') {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className={`${getIconSize()} bg-brand-primary rounded-lg flex items-center justify-center shadow-lg`}>
          <span className="text-brand-white font-bold text-sm">B</span>
        </div>
      </div>
    );
  }

  if (variant === 'text') {
    return (
      <div className={`flex items-center ${className}`}>
        <img src="/Main Logo_ByteMe.png" alt="ByteMe Logo" className="w-20 aspect-[551/371] object-contain" />
        <div className="flex flex-col">
          {showTagline && (
            <span className="text-xs text-brand-dark/70 font-medium">
              Digital Dining Solutions
            </span>
          )}
        </div>
      </div>
    );
  }

  // Full variant (default)
  return (
    <div className={`flex items-center ${className}`}>
      <div className={`${getIconSize()} bg-brand-primary rounded-lg flex items-center justify-center shadow-lg mr-3`}>
        <span className="text-brand-white font-bold text-sm">B</span>
      </div>
      <div className="flex flex-col">
        <div className="flex items-baseline">
          <span className={`${getSizeClasses()} font-bold text-brand-dark leading-tight`}>
            Byte
          </span>
          <span className={`${getSizeClasses()} font-bold text-brand-primary leading-tight ml-1`}>
            Me
          </span>
        </div>
        {showTagline && (
          <span className="text-xs text-brand-dark/70 font-medium">
            Digital Dining Solutions
          </span>
        )}
      </div>
    </div>
  );
};

export default ByteMeLogo;
