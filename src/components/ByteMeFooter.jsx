import React from "react";

const ByteMeFooter = ({ className = "" }) => {
  return (
    <footer className={`py-6 mt-auto ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center space-x-3 text-center">
          <p className="text-sm text-slate-600 m-0">Good times made easy by </p>
          <img
            src="/Secondary Logo_ByteMe.png"
            alt="ByteMe Logo"
            className="w-28"
          />
        </div>
      </div>
    </footer>
  );
};

export default ByteMeFooter;
