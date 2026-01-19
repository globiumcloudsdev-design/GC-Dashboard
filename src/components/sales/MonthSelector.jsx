// components/sales/MonthSelector.jsx
import React, { useContext } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { ThemeContext } from '@/context/ThemeContext';

const MonthSelector = ({ 
  currentMonth = '', 
  onMonthChange, 
  theme,
  minMonth = null // optional: "MonthName YYYY" or ISO date string or Date object
}) => {
  const { theme: themeContext } = useContext(ThemeContext);
  const activeTheme = theme || themeContext;

  // Parse current month
  const getCurrentMonthInfo = () => {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December",
    ];
    
    if (!currentMonth) {
      const now = new Date();
      return {
        monthName: months[now.getMonth()],
        year: now.getFullYear(),
        monthIndex: now.getMonth()
      };
    }
    
    const [monthName, year] = currentMonth.split(' ');
    const monthIndex = months.indexOf(monthName);
    
    return {
      monthName,
      year: parseInt(year),
      monthIndex: monthIndex !== -1 ? monthIndex : new Date().getMonth()
    };
  };

  const { monthName, year, monthIndex } = getCurrentMonthInfo();

  // Parse minMonth prop into monthIndex/year for comparisons
  const parseMin = (min) => {
    if (!min) return null;
    if (min instanceof Date) return { monthIndex: min.getMonth(), year: min.getFullYear() };
    try {
      // ISO string?
      const d = new Date(min);
      if (!isNaN(d)) return { monthIndex: d.getMonth(), year: d.getFullYear() };
    } catch (e) {}

    // Try "MonthName YYYY"
    const parts = String(min).split(' ');
    if (parts.length === 2) {
      const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December",
      ];
      const mIdx = months.indexOf(parts[0]);
      const y = parseInt(parts[1]);
      if (mIdx !== -1 && !isNaN(y)) return { monthIndex: mIdx, year: y };
    }
    return null;
  };

  const min = parseMin(minMonth);

  const isAtMin = (() => {
    if (!min) return false;
    if (year < min.year) return true; // current before min year
    if (year === min.year && monthIndex <= min.monthIndex) return true;
    return false;
  })();

  // Navigate to previous month
  const handlePrevMonth = () => {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December",
    ];
    
    let newMonthIndex = monthIndex - 1;
    let newYear = year;
    
    if (newMonthIndex < 0) {
      newMonthIndex = 11;
      newYear = year - 1;
    }
    
    // If min is defined, don't allow navigating before it
    if (min) {
      if (newYear < min.year || (newYear === min.year && newMonthIndex < min.monthIndex)) {
        // clamp to min instead of going earlier
        const newMonth = `${months[min.monthIndex]} ${min.year}`;
        onMonthChange(newMonth);
        return;
      }
    }

    const newMonth = `${months[newMonthIndex]} ${newYear}`;
    onMonthChange(newMonth);
  };

  // Navigate to next month
  const handleNextMonth = () => {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December",
    ];
    
    let newMonthIndex = monthIndex + 1;
    let newYear = year;
    
    if (newMonthIndex > 11) {
      newMonthIndex = 0;
      newYear = year + 1;
    }
    
    const newMonth = `${months[newMonthIndex]} ${newYear}`;
    onMonthChange(newMonth);
  };

  // Jump to current month
  const handleCurrentMonth = () => {
    const now = new Date();
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December",
    ];
    const currentMonth = `${months[now.getMonth()]} ${now.getFullYear()}`;
    onMonthChange(currentMonth);
  };

  return (
    <div
      style={{
        padding: 16,
        borderRadius: 12,
        backgroundColor: activeTheme?.colors?.surface || '#fff',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        border: `1px solid ${activeTheme?.colors?.border || '#e5e7eb'}`,
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              padding: 8,
              borderRadius: 8,
              backgroundColor: '#f0f9ff',
            }}
          >
            <Calendar size={18} color="#3b82f6" />
          </div>
          <div>
            <h3
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: activeTheme?.colors?.text || '#000',
                margin: 0,
              }}
            >
              Month Selector
            </h3>
            <p
              style={{
                fontSize: 12,
                color: activeTheme?.colors?.textSecondary || '#666',
                margin: '2px 0 0 0',
              }}
            >
              Select a month to view data
            </p>
          </div>
        </div>
        
        <button
          onClick={handleCurrentMonth}
          style={{
            padding: '6px 12px',
            fontSize: 12,
            fontWeight: 500,
            backgroundColor: '#3b82f6',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
          }}
        >
          Current
        </button>
      </div>

      {/* Month Navigation */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#f8fafc',
          padding: 12,
          borderRadius: 8,
        }}
      >
        <button
          onClick={handlePrevMonth}
          disabled={isAtMin}
          style={{
            padding: 6,
            borderRadius: 6,
            border: `1px solid ${activeTheme?.colors?.border || '#e5e7eb'}`,
            backgroundColor: isAtMin ? '#f3f4f6' : '#fff',
            cursor: isAtMin ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: isAtMin ? 0.6 : 1,
          }}
        >
          <ChevronLeft size={18} color={isAtMin ? '#9ca3af' : (activeTheme?.colors?.text || '#000')} />
        </button>
        
        <div
          style={{
            textAlign: 'center',
            flex: 1,
            margin: '0 12px',
          }}
        >
          <div
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: activeTheme?.colors?.text || '#000',
              marginBottom: 2,
            }}
          >
            {monthName}
          </div>
          <div
            style={{
              fontSize: 14,
              fontWeight: 500,
              color: activeTheme?.colors?.textSecondary || '#666',
            }}
          >
            {year}
          </div>
        </div>
        
        <button
          onClick={handleNextMonth}
          style={{
            padding: 6,
            borderRadius: 6,
            border: `1px solid ${activeTheme?.colors?.border || '#e5e7eb'}`,
            backgroundColor: '#fff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ChevronRight size={18} color={activeTheme?.colors?.text || '#000'} />
        </button>
      </div>

      {/* Selected Month Info */}
      <div
        style={{
          marginTop: 12,
          padding: 8,
          backgroundColor: '#f0f9ff',
          borderRadius: 6,
          fontSize: 12,
          color: '#1e40af',
          textAlign: 'center',
        }}
      >
        Currently viewing: <strong>{monthName} {year}</strong>
      </div>
    </div>
  );
};

export default MonthSelector;