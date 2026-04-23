import React, { useState } from 'react';
import { useTheme, getDashboardTokens } from '../../providers/ThemeProvider';

export const DefaultTableContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isDark } = useTheme();
  const C = getDashboardTokens(isDark);

  return (
    <div style={{
      backgroundColor: C.surfaceContainer, borderRadius: '14px',
      border: `1px solid ${C.outlineVariant}33`, overflow: 'hidden',
      boxShadow: isDark ? '0 4px 32px rgba(0,0,0,0.25)' : '0 2px 16px rgba(0,0,0,0.05)',
    }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
          {children}
        </table>
      </div>
    </div>
  );
};

export const DefaultTh: React.FC<React.ThHTMLAttributes<HTMLTableCellElement>> = ({ children, style, ...props }) => {
  const { isDark } = useTheme();
  const C = getDashboardTokens(isDark);

  const thStyle: React.CSSProperties = {
    padding: '12px 16px', textAlign: 'left',
    fontSize: '11px', fontWeight: 700,
    textTransform: 'uppercase', letterSpacing: '0.08em',
    color: C.onSurfaceVariant,
    backgroundColor: isDark ? 'rgba(0,0,0,0.25)' : 'rgba(0,0,0,0.06)',
    borderBottom: `1px solid ${C.outlineVariant}33`,
    whiteSpace: 'nowrap',
    ...style,
  };

  return <th style={thStyle} {...props}>{children}</th>;
};

export const DefaultTd: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = ({ children, style, ...props }) => {
  const { isDark } = useTheme();
  const C = getDashboardTokens(isDark);

  const tdBase: React.CSSProperties = {
    padding: '13px 16px',
    borderBottom: `1px solid ${C.outlineVariant}1a`,
    color: C.onSurface,
    verticalAlign: 'middle',
    fontFamily: 'Inter, sans-serif',
    fontSize: '13px',
    ...style,
  };

  return <td style={tdBase} {...props}>{children}</td>;
};

export const DefaultTr: React.FC<React.HTMLAttributes<HTMLTableRowElement>> = ({ children, style, ...props }) => {
  const { isDark } = useTheme();
  const C = getDashboardTokens(isDark);
  const [rowHovered, setRowHovered] = useState(false);

  return (
    <tr
      onMouseEnter={(e) => {
        setRowHovered(true);
        props.onMouseEnter?.(e);
      }}
      onMouseLeave={(e) => {
        setRowHovered(false);
        props.onMouseLeave?.(e);
      }}
      style={{
        backgroundColor: rowHovered
          ? (isDark ? `${C.surfaceContainerHigh}cc` : '#f5f4ff')
          : 'transparent',
        transition: 'background-color 0.12s ease',
        ...style,
      }}
      {...props}
    >
      {children}
    </tr>
  );
};

export const DefaultTable = {
  Container: DefaultTableContainer,
  Th: DefaultTh,
  Td: DefaultTd,
  Tr: DefaultTr,
};
