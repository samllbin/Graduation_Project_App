export function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffMin < 1) {
    return '刚刚';
  }
  if (diffHour < 1) {
    return `${diffMin}分钟前`;
  }
  if (diffDay < 1) {
    return `${diffHour}小时前`;
  }

  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const nowYear = now.getFullYear();

  if (year === nowYear) {
    return `${month}月${day}日`;
  }
  return `${year}年${month}月${day}日`;
}
