import React, { useState } from 'react';

const Tooltip = ({ content, children, position = 'top' }) => {
  const [isVisible, setIsVisible] = useState(false);

  const getTooltipStyles = () => {
    const baseStyles = {
      position: 'absolute',
      background: 'rgba(0, 0, 0, 0.8)',
      color: 'white',
      padding: '0.5rem 0.75rem',
      borderRadius: '6px',
      fontSize: '0.75rem',
      whiteSpace: 'nowrap',
      zIndex: 1000,
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? 'scale(1)' : 'scale(0.9)',
      transition: 'all 0.2s ease',
      pointerEvents: 'none'
    };

    switch (position) {
      case 'top':
        return {
          ...baseStyles,
          bottom: '100%',
          left: '50%',
          transform: isVisible ? 'translateX(-50%) scale(1)' : 'translateX(-50%) scale(0.9)',
          marginBottom: '8px'
        };
      case 'bottom':
        return {
          ...baseStyles,
          top: '100%',
          left: '50%',
          transform: isVisible ? 'translateX(-50%) scale(1)' : 'translateX(-50%) scale(0.9)',
          marginTop: '8px'
        };
      case 'left':
        return {
          ...baseStyles,
          right: '100%',
          top: '50%',
          transform: isVisible ? 'translateY(-50%) scale(1)' : 'translateY(-50%) scale(0.9)',
          marginRight: '8px'
        };
      case 'right':
        return {
          ...baseStyles,
          left: '100%',
          top: '50%',
          transform: isVisible ? 'translateY(-50%) scale(1)' : 'translateY(-50%) scale(0.9)',
          marginLeft: '8px'
        };
      default:
        return baseStyles;
    }
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        style={{ display: 'inline-block' }}
      >
        {children}
      </div>
      <div style={getTooltipStyles()}>
        {content}
        <div style={{
          position: 'absolute',
          width: '0',
          height: '0',
          border: '6px solid transparent'
        }} />
      </div>
    </div>
  );
};

export default Tooltip;