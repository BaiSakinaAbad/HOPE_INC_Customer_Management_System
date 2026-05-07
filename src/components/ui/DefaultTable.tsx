import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTheme, getDashboardTokens } from '../../providers/ThemeProvider';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

export const DefaultTableContainer: React.FC<{ children: React.ReactNode; pagination?: PaginationProps }> = ({ children, pagination }) => {
  const { isDark } = useTheme();
  const C = getDashboardTokens(isDark);

  return (
    <div style={{
      backgroundColor: C.surfaceContainer, borderRadius: '14px',
      border: `1px solid ${C.outlineVariant}33`, overflow: 'visible',
      boxShadow: isDark ? '0 4px 32px rgba(0,0,0,0.25)' : '0 2px 16px rgba(0,0,0,0.05)',
    }}>
      <div style={{ overflow: 'visible' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
          {children}
        </table>
      </div>

      {pagination && pagination.totalPages > 0 && (
        <div style={{
          padding: '16px 20px',
          borderTop: `1px solid ${C.outlineVariant}33`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '13px',
          color: C.onSurfaceVariant,
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div>
            Showing <strong style={{ color: C.onSurface }}>{Math.min((pagination.currentPage - 1) * pagination.itemsPerPage + 1, pagination.totalItems)}</strong> to <strong style={{ color: C.onSurface }}>{Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)}</strong> of <strong style={{ color: C.onSurface }}>{pagination.totalItems}</strong> entries
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={() => pagination.onPageChange(Math.max(1, pagination.currentPage - 1))}
              disabled={pagination.currentPage === 1}
              style={{
                width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: '6px', border: `1px solid ${C.outlineVariant}55`,
                backgroundColor: 'transparent', color: C.onSurface,
                cursor: pagination.currentPage === 1 ? 'not-allowed' : 'pointer',
                opacity: pagination.currentPage === 1 ? 0.5 : 1,
              }}
            >
              <ChevronLeft size={16} />
            </button>
            
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => {
              const isActive = page === pagination.currentPage;
              return (
                <button
                  key={page}
                  onClick={() => pagination.onPageChange(page)}
                  style={{
                    minWidth: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: '6px',
                    border: isActive ? 'none' : `1px solid ${C.outlineVariant}55`,
                    backgroundColor: isActive ? '#834fff' : 'transparent',
                    color: isActive ? '#fff' : C.onSurface,
                    fontWeight: isActive ? 700 : 500,
                    cursor: 'pointer',
                  }}
                >
                  {page}
                </button>
              );
            })}

            <button
              onClick={() => pagination.onPageChange(Math.min(pagination.totalPages, pagination.currentPage + 1))}
              disabled={pagination.currentPage === pagination.totalPages}
              style={{
                width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: '6px', border: `1px solid ${C.outlineVariant}55`,
                backgroundColor: 'transparent', color: C.onSurface,
                cursor: pagination.currentPage === pagination.totalPages ? 'not-allowed' : 'pointer',
                opacity: pagination.currentPage === pagination.totalPages ? 0.5 : 1,
              }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
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
