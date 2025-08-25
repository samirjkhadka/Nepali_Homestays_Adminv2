import React, { ReactNode, useState } from 'react';

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

const Tooltip: React.FC<TooltipProps> = ({ content, children, position = 'top' }) => {
  const [visible, setVisible] = useState(false);

  return (
    <span className="relative inline-block"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
      tabIndex={0}
    >
      {children}
      {visible && (
        <span
          className={`z-50 absolute whitespace-nowrap px-3 py-1 rounded-md shadow-lg text-xs font-medium bg-gray-900 text-white transition-opacity duration-150 opacity-100
            ${position === 'top' ? 'bottom-full left-1/2 -translate-x-1/2 mb-2' : ''}
            ${position === 'bottom' ? 'top-full left-1/2 -translate-x-1/2 mt-2' : ''}
            ${position === 'left' ? 'right-full top-1/2 -translate-y-1/2 mr-2' : ''}
            ${position === 'right' ? 'left-full top-1/2 -translate-y-1/2 ml-2' : ''}
          `}
          role="tooltip"
        >
          {content}
        </span>
      )}
    </span>
  );
};

export default Tooltip; 