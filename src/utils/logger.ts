import * as fs from 'fs';
import * as path from 'path';
import { DateTimeHelper } from './dateTimeHelper';

/**
 * Lightweight, readable Logger utility for test automation steps and diagnostics.
 * Prints color-coded logs to console and writes to reports/logs/YYYY-MM-DD_HH-mm-ss.log
 */
export class Logger {
  private static logFilePath: string | null = null;

  public static init(): void {
    if (this.logFilePath) return;

    const logDir = path.resolve(process.cwd(), 'reports', 'logs');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    const timestamp = DateTimeHelper.getTimestamp();
    this.logFilePath = path.join(logDir, `${timestamp}.log`);
  }

  private static formatTime(): string {
    return new Date().toLocaleTimeString('tr-TR');
  }

  private static writeToFile(line: string): void {
    if (!this.logFilePath) {
      this.init();
    }
    if (this.logFilePath) {
      fs.appendFileSync(this.logFilePath, line + '\n', 'utf-8');
    }
  }

  /**
   * General informational log
   */
  public static info(message: string): void {
    const time = this.formatTime();
    const logLine = `[${time}] [INFO] ${message}`;
    console.log(`\x1b[36mℹ️  ${logLine}\x1b[0m`);
    this.writeToFile(logLine);
  }

  /**
   * Actionable test step log
   */
  public static step(stepNo: number | string, description: string): void {
    const time = this.formatTime();
    const logLine = `[${time}] [STEP ${stepNo}] ${description}`;
    console.log(`\x1b[35m🔹 ${logLine}\x1b[0m`);
    this.writeToFile(logLine);
  }

  /**
   * Successful action or assertion log
   */
  public static success(message: string): void {
    const time = this.formatTime();
    const logLine = `[${time}] [SUCCESS] ${message}`;
    console.log(`\x1b[32m✅ ${logLine}\x1b[0m`);
    this.writeToFile(logLine);
  }

  /**
   * Warning log
   */
  public static warn(message: string): void {
    const time = this.formatTime();
    const logLine = `[${time}] [WARN] ${message}`;
    console.log(`\x1b[33m⚠️  ${logLine}\x1b[0m`);
    this.writeToFile(logLine);
  }

  /**
   * Error log
   */
  public static error(message: string, error?: unknown): void {
    const time = this.formatTime();
    const errorDetails = error instanceof Error ? error.message : error ? String(error) : '';
    const logLine = `[${time}] [ERROR] ${message}${errorDetails ? ` | Details: ${errorDetails}` : ''}`;
    console.log(`\x1b[31m❌ ${logLine}\x1b[0m`);
    this.writeToFile(logLine);
  }
}
