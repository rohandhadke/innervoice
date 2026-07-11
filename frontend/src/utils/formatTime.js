import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import utc from 'dayjs/plugin/utc';

dayjs.extend(relativeTime);
dayjs.extend(utc);

/**
 * Format a UTC timestamp for display:
 * - Less than 2 days old → relative ("2 hours ago", "1 day ago")
 * - 2 days or older → absolute ("Jun 25, 2026 at 10:30 AM")
 */
export function formatTime(timestamp) {
  const local = dayjs.utc(timestamp).local();
  const diffHours = dayjs().diff(local, 'hour');

  if (diffHours < 48) {
    return local.fromNow();
  }
  return local.format('MMM D, YYYY [at] h:mm A');
}
