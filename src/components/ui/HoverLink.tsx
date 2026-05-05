import React, { useState } from 'react';

interface HoverLinkProps {
  children: React.ReactNode;
  color: string;
  hoverColor: string;
  style?: React.CSSProperties;
}

export const HoverLink: React.FC<HoverLinkProps> = ({ children, color, hoverColor, style }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <span
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        ...style,
        color: hovered ? hoverColor : color,
        cursor: 'pointer',
        transition: 'color 0.2s ease',
      }}
    >
      {children}
    </span>
  );
};