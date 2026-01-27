# Timezone Utility Documentation

## Overview
Centralized timezone management utility for consistent date and time formatting across the entire application. All times are displayed in **Pakistani timezone (Asia/Karachi)** by default.

## Location
`src/utils/timezone.js`

## Purpose
- **Single source of truth** for timezone handling
- **Easy timezone changes** - modify once, affects everywhere
- **Consistent formatting** across all pages and components
- **Pakistan Standard Time (PKT)** as default timezone

---

## Available Functions

### 1. `formatTime(dateString, options)`
Format time in Pakistani timezone.

**Parameters:**
- `dateString` (string|Date): Date to format
- `options` (object): Optional formatting options

**Returns:** Formatted time string (e.g., "02:30 PM")

**Example:**
```javascript
import { formatTime } from '@/utils/timezone';

const checkInTime = formatTime('2026-01-27T09:30:00Z'); 
// Output: "03:00 PM" (Pakistan time)

// Custom format
const time = formatTime(new Date(), { hour12: false });
// Output: "15:00"
```

---

### 2. `formatDate(dateString, options)`
Format date in Pakistani timezone.

**Parameters:**
- `dateString` (string|Date): Date to format
- `options` (object): Optional formatting options

**Returns:** Formatted date string (e.g., "27/1/2026")

**Example:**
```javascript
import { formatDate } from '@/utils/timezone';

const date = formatDate('2026-01-27T09:30:00Z');
// Output: "27/1/2026"
```

---

### 3. `formatDateTime(dateString, options)`
Format both date and time together.

**Parameters:**
- `dateString` (string|Date): Date to format
- `options` (object): Optional formatting options

**Returns:** Formatted datetime string (e.g., "27 January 2026, 03:00 PM")

**Example:**
```javascript
import { formatDateTime } from '@/utils/timezone';

const datetime = formatDateTime('2026-01-27T09:30:00Z');
// Output: "27 January 2026, 03:00 PM"
```

---

### 4. `formatTimeWithSeconds(dateString)`
Format time with seconds included.

**Returns:** Time with seconds (e.g., "03:00:45 PM")

**Example:**
```javascript
import { formatTimeWithSeconds } from '@/utils/timezone';

const time = formatTimeWithSeconds(new Date());
// Output: "03:00:45 PM"
```

---

### 5. `formatDateShort(dateString)`
Format date in short format.

**Returns:** Short date (e.g., "27/01/2026")

**Example:**
```javascript
import { formatDateShort } from '@/utils/timezone';

const date = formatDateShort('2026-01-27');
// Output: "27/01/2026"
```

---

### 6. `formatDateLong(dateString)`
Format date in long format.

**Returns:** Long date (e.g., "27 January 2026")

**Example:**
```javascript
import { formatDateLong } from '@/utils/timezone';

const date = formatDateLong('2026-01-27');
// Output: "27 January 2026"
```

---

### 7. `calculateWorkingHours(checkInTime, checkOutTime)`
Calculate working hours between check-in and check-out.

**Parameters:**
- `checkInTime` (string|Date): Check-in time
- `checkOutTime` (string|Date): Check-out time (optional, uses current time if not provided)

**Returns:** Working hours as string (e.g., "08:30")

**Example:**
```javascript
import { calculateWorkingHours } from '@/utils/timezone';

const hours = calculateWorkingHours(
  '2026-01-27T09:00:00Z',
  '2026-01-27T17:30:00Z'
);
// Output: "08:30"
```

---

### 8. `getRelativeTime(dateString)`
Get relative time from now.

**Returns:** Relative time (e.g., "2 hours ago", "5 minutes ago")

**Example:**
```javascript
import { getRelativeTime } from '@/utils/timezone';

const relative = getRelativeTime('2026-01-27T12:00:00Z');
// Output: "2 hours ago"
```

---

### 9. `isToday(dateString)`
Check if date is today in Pakistani timezone.

**Returns:** Boolean (true if today)

**Example:**
```javascript
import { isToday } from '@/utils/timezone';

const today = isToday(new Date());
// Output: true
```

---

### 10. `formatDuration(minutes)`
Format duration in hours and minutes.

**Parameters:**
- `minutes` (number): Duration in minutes

**Returns:** Formatted duration (e.g., "2h 30m")

**Example:**
```javascript
import { formatDuration } from '@/utils/timezone';

const duration = formatDuration(150);
// Output: "2h 30m"
```

---

### 11. `toPakistanTime(dateString)`
Convert date to Pakistani timezone Date object.

**Returns:** Date object in Pakistani timezone

**Example:**
```javascript
import { toPakistanTime } from '@/utils/timezone';

const pkDate = toPakistanTime('2026-01-27T09:00:00Z');
// Returns: Date object adjusted to Pakistan time
```

---

### 12. `getTimezone()`
Get current configured timezone.

**Returns:** Timezone string ("Asia/Karachi")

**Example:**
```javascript
import { getTimezone } from '@/utils/timezone';

const tz = getTimezone();
// Output: "Asia/Karachi"
```

---

## Usage Examples

### In Components

```javascript
// In attendance pages
import { formatTime, formatDate } from '@/utils/timezone';

function AttendanceRecord({ record }) {
  return (
    <div>
      <p>Date: {formatDate(record.date)}</p>
      <p>Check-in: {formatTime(record.checkInTime)}</p>
      <p>Check-out: {formatTime(record.checkOutTime)}</p>
    </div>
  );
}
```

### In Tables

```javascript
import { formatTime, formatDate } from '@/utils/timezone';

const columns = [
  {
    header: "Date",
    cell: (row) => formatDate(row.date)
  },
  {
    header: "Check-in",
    cell: (row) => formatTime(row.checkInTime)
  },
  {
    header: "Check-out",
    cell: (row) => formatTime(row.checkOutTime)
  }
];
```

### In Modals

```javascript
import { formatDateTime } from '@/utils/timezone';

function ViewAttendanceModal({ attendance }) {
  return (
    <div>
      <h3>Attendance Details</h3>
      <p>Recorded: {formatDateTime(attendance.createdAt)}</p>
    </div>
  );
}
```

---

## Pages Using Timezone Utility

✅ Updated pages:
1. `/agent/attendance/page.jsx` - Agent attendance page
2. `/dashboard/view-attendance/page.jsx` - Admin attendance page
3. `/dashboard/agents/[id]/page.jsx` - Agent detail page
4. `ViewAttendanceModal.jsx` - Attendance view modal
5. `TodayStatusCard.jsx` - Today's status card
6. `TodayDetailsCard.jsx` - Today's details card
7. `EditAttendanceModal.jsx` - Edit attendance modal

---

## How to Change Timezone

To change the timezone for the entire application, modify one line in `src/utils/timezone.js`:

```javascript
// Current (Pakistan)
const DEFAULT_TIMEZONE = "Asia/Karachi";

// To change to Dubai:
const DEFAULT_TIMEZONE = "Asia/Dubai";

// To change to London:
const DEFAULT_TIMEZONE = "Europe/London";

// To change to New York:
const DEFAULT_TIMEZONE = "America/New_York";
```

**All pages and components will automatically use the new timezone!**

---

## Timezone Reference

Common timezone values:
- **Pakistan**: `Asia/Karachi` (UTC+5)
- **India**: `Asia/Kolkata` (UTC+5:30)
- **Dubai**: `Asia/Dubai` (UTC+4)
- **Saudi Arabia**: `Asia/Riyadh` (UTC+3)
- **UK**: `Europe/London` (UTC+0)
- **USA (East)**: `America/New_York` (UTC-5)
- **USA (West)**: `America/Los_Angeles` (UTC-8)

Full list: [IANA Timezone Database](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)

---

## Benefits

1. **Consistency**: All times displayed in same timezone
2. **Maintainability**: Change timezone in one place
3. **Reliability**: No device timezone confusion
4. **Flexibility**: Easy to switch timezones per client needs
5. **Clarity**: Clear which timezone is being used

---

## Before & After

### Before (Device Timezone)
```javascript
// Different times on different devices
const time = new Date(attendance.checkInTime).toLocaleTimeString();
// Device in USA: "04:00 AM"
// Device in Pakistan: "02:00 PM"
```

### After (Pakistan Timezone)
```javascript
// Same time on all devices
import { formatTime } from '@/utils/timezone';
const time = formatTime(attendance.checkInTime);
// All devices: "02:00 PM" (Pakistan time)
```

---

## Best Practices

1. **Always use timezone utility** for displaying dates/times
2. **Store UTC in database** - Let timezone utility handle display
3. **Don't use native Date methods** - Use utility functions instead
4. **Test across timezones** - Check with VPN or timezone change
5. **Document timezone** - Make it clear which timezone is used

---

## Testing

To test timezone utility:

```javascript
// Test with different dates
import { formatTime, formatDate } from '@/utils/timezone';

console.log(formatTime(new Date())); // Current time in Pakistan
console.log(formatDate(new Date())); // Current date in Pakistan

// Test with UTC date
const utcDate = '2026-01-27T00:00:00Z';
console.log(formatTime(utcDate)); // Should show Pakistan time (05:00 AM)
```

---

## Support

For timezone issues:
- Check date is valid before passing to utility
- Verify timezone string is correct
- Test with different date formats
- Check browser console for errors

---

**Last Updated:** January 27, 2026  
**Version:** 1.0.0  
**Maintainer:** Globium Clouds Development Team
