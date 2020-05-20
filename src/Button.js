import React from 'react';

export default function Button({ children, progress, className, ...props }) {
  const progressPercent = progress && `${Math.min(progress.times(100).toNumber(), 100)}%`;
  return (
    <button {...props} className={`${progress ? 'with-progress' : ''} ${className || ''}`}>
      {children}
      {progress && <div className="progress" style={{ width: progressPercent }} />}
    </button>
  );
}
