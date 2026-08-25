/**
 * DateTimeHelper provides formatted timestamp strings for reports, screenshots, and logs.
 */
export class DateTimeHelper {
  /**
   * Returns current date and time in YYYY-MM-DD_HH-mm-ss format (e.g. 2026-08-25_11-55-30)
   */
  public static getTimestamp(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
  }
}
