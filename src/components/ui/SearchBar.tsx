import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { useTheme, getDashboardTokens } from '../../providers/ThemeProvider';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  debounceMs?: number;
}

export const SearchBar: React.FC<SearchBarProps> = ({ 
  onSearch, 
  placeholder = "Search...", 
  debounceMs = 300 
}) => {
  const { isDark } = useTheme();
  const C = getDashboardTokens(isDark);
  const [inputValue, setInputValue] = useState('');

  // Local debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(inputValue);
    }, debounceMs);
    return () => clearTimeout(timer);
  }, [inputValue, onSearch, debounceMs]);

  const handleClear = () => {
    setInputValue('');
    onSearch('');
  };

  return (
    <div style={{ flex: 1, minWidth: '220px', maxWidth: '480px', position: 'relative' }}>
      <Search
        size={15}
        style={{
          position: 'absolute', left: '13px', top: '50%',
          transform: 'translateY(-50%)', color: C.onSurfaceVariant, pointerEvents: 'none',
        }}
      />
      <input
        type="search"
        placeholder={placeholder}
        value={inputValue}
        onChange={e => setInputValue(e.target.value)}
        style={{
          width: '100%', height: '42px',
          paddingLeft: '38px', paddingRight: inputValue ? '36px' : '14px',
          backgroundColor: isDark ? `${C.surfaceContainerHigh}` : '#f0eef8',
          border: `1px solid ${C.outlineVariant}55`,
          borderRadius: '10px', fontSize: '13px',
          fontFamily: 'Inter, sans-serif', color: C.onSurface,
          outline: 'none', boxSizing: 'border-box',
          transition: 'border-color 0.2s',
        }}
      />
      {inputValue && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Clear search"
          style={{
            position: 'absolute', right: '10px', top: '50%',
            transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer',
            color: C.onSurfaceVariant, display: 'flex', alignItems: 'center', padding: '2px',
          }}
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
};
