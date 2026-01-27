// Timezone utility for consistent time formatting across the application
// Default timezone: Pakistan (Asia/Karachi)

const DEFAULT_TIMEZONE = "Asia/Karachi";

/**
 * Format time to Pakistani timezone (or configured timezone)
 * @param {string|Date} dateString - Date string or Date object
 * @param {object} options - Optional formatting options
 * @returns {string} Formatted time string
 */
export const formatTime = (dateString, options = {}) => {
  if (!dateString) return "--:--";
  
  const defaultOptions = {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: DEFAULT_TIMEZONE,
    ...options
  };
  
  return new Date(dateString).toLocaleTimeString("en-PK", defaultOptions);
};

/**
 * Format date to Pakistani timezone
 * @param {string|Date} dateString - Date string or Date object
 * @param {object} options - Optional formatting options
 * @returns {string} Formatted date string
 */
export const formatDate = (dateString, options = {}) => {
  if (!dateString) return "--";
  
  const defaultOptions = {
    timeZone: DEFAULT_TIMEZONE,
    ...options
  };
  
  return new Date(dateString).toLocaleDateString("en-PK", defaultOptions);
};

/**
 * Format date and time together
 * @param {string|Date} dateString - Date string or Date object
 * @param {object} options - Optional formatting options
 * @returns {string} Formatted date and time string
 */
export const formatDateTime = (dateString, options = {}) => {
  if (!dateString) return "--";
  
  const defaultOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: DEFAULT_TIMEZONE,
    ...options
  };
  
  return new Date(dateString).toLocaleString("en-PK", defaultOptions);
};

/**
 * Format time with seconds
 * @param {string|Date} dateString - Date string or Date object
 * @returns {string} Formatted time with seconds
 */
export const formatTimeWithSeconds = (dateString) => {
  if (!dateString) return "--:--:--";
  
  return new Date(dateString).toLocaleTimeString("en-PK", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
    timeZone: DEFAULT_TIMEZONE,
  });
};

/**
 * Format date in short format (e.g., 27/01/2026)
 * @param {string|Date} dateString - Date string or Date object
 * @returns {string} Short formatted date
 */
export const formatDateShort = (dateString) => {
  if (!dateString) return "--";
  
  return new Date(dateString).toLocaleDateString("en-PK", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: DEFAULT_TIMEZONE,
  });
};

/**
 * Format date in long format (e.g., 27 January 2026)
 * @param {string|Date} dateString - Date string or Date object
 * @returns {string} Long formatted date
 */
export const formatDateLong = (dateString) => {
  if (!dateString) return "--";
  
  return new Date(dateString).toLocaleDateString("en-PK", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: DEFAULT_TIMEZONE,
  });
};

/**
 * Get current timezone
 * @returns {string} Current timezone
 */
export const getTimezone = () => DEFAULT_TIMEZONE;

/**
 * Convert date to Pakistani timezone Date object
 * @param {string|Date} dateString - Date string or Date object
 * @returns {Date} Date object in Pakistani timezone
 */
export const toPakistanTime = (dateString) => {
  if (!dateString) return null;
  
  const date = new Date(dateString);
  return new Date(date.toLocaleString("en-US", { timeZone: DEFAULT_TIMEZONE }));
};

/**
 * Get relative time (e.g., "2 hours ago", "in 3 days")
 * @param {string|Date} dateString - Date string or Date object
 * @returns {string} Relative time string
 */
export const getRelativeTime = (dateString) => {
  if (!dateString) return "--";
  
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  
  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin} minute${diffMin > 1 ? "s" : ""} ago`;
  if (diffHour < 24) return `${diffHour} hour${diffHour > 1 ? "s" : ""} ago`;
  if (diffDay < 7) return `${diffDay} day${diffDay > 1 ? "s" : ""} ago`;
  
  return formatDate(dateString);
};

/**
 * Check if date is today (in Pakistani timezone)
 * @param {string|Date} dateString - Date string or Date object
 * @returns {boolean} True if date is today
 */
export const isToday = (dateString) => {
  if (!dateString) return false;
  
  const date = toPakistanTime(dateString);
  const today = toPakistanTime(new Date());
  
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

/**
 * Format duration in hours and minutes
 * @param {number} minutes - Duration in minutes
 * @returns {string} Formatted duration (e.g., "2h 30m")
 */
export const formatDuration = (minutes) => {
  if (!minutes || minutes === 0) return "0m";
  
  const hours = Math.floor(minutes / 60);
  const mins = Math.floor(minutes % 60);
  
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
};

/**
 * Calculate working hours between check-in and check-out
 * @param {string|Date} checkInTime - Check-in time
 * @param {string|Date} checkOutTime - Check-out time
 * @returns {string} Formatted working hours (e.g., "08:30")
 */
export const calculateWorkingHours = (checkInTime, checkOutTime) => {
  if (!checkInTime) return "00:00";
  
  const checkIn = new Date(checkInTime);
  const checkOut = checkOutTime ? new Date(checkOutTime) : new Date();
  
  const diffMs = checkOut - checkIn;
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
};

export default {
  formatTime,
  formatDate,
  formatDateTime,
  formatTimeWithSeconds,
  formatDateShort,
  formatDateLong,
  getTimezone,
  toPakistanTime,
  getRelativeTime,
  isToday,
  formatDuration,
  calculateWorkingHours,
};
