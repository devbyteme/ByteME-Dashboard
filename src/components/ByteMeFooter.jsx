import React from 'react';

const ByteMeFooter = ({ className = '' }) => {
  return (
    <footer className={`py-6 mt-auto ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-sm text-slate-600">
            Good times made easy by{' '}
            <span className="font-semibold text-brand-primary">ByteMe</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default ByteMeFooter;
