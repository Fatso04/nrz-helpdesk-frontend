 import React from 'react';

const AnimatedBg = () => {
  return (
    <div style={{ 
      position: 'absolute', 
      top: 0, 
      left: 0, 
      right: 0, 
      bottom: 0, 
      background: 'linear-gradient(to right, #ff7e5f, #feb47b)', 
      zIndex: -1,
      animation: 'backgroundAnimation 10s infinite alternate'
    }}>
      {/* Additional animation styles can be added here */}
      <style>
        {`
          @keyframes backgroundAnimation {
            0% { opacity: 0.5; }
            100% { opacity: 1; }
          }
        `}
      </style>
    </div>
  );
};

export default AnimatedBg;
