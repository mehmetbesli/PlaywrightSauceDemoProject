import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Optionally load .env only if explicitly present
const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

export type EnvironmentName = 'dev' | 'qa' | 'staging' | 'prod';
export type BrowserType = 'chromium' | 'firefox' | 'webkit' | 'all';

export interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
  to: string[];
}

export interface EnvConfig {
  name: EnvironmentName;
  baseURL: string;
  timeout: number;
  retries: number;
  workers?: number;
}

/**
 * Centralized Multi-Environment Configurations
 * All environment parameters (DEV, QA, STAGING, PROD) are maintained centrally here.
 */
export const ENV_CONFIGS: Record<EnvironmentName, EnvConfig> = {
  dev: {
    name: 'dev',
    baseURL: 'https://sauce-demo.myshopify.com/',
    timeout: 30000,
    retries: 1,
    workers: 2,
  },
  qa: {
    name: 'qa',
    baseURL: 'https://sauce-demo.myshopify.com/',
    timeout: 30000,
    retries: 1,
    workers: 2,
  },
  staging: {
    name: 'staging',
    baseURL: 'https://sauce-demo.myshopify.com/',
    timeout: 30000,
    retries: 1,
    workers: 2,
  },
  prod: {
    name: 'prod',
    baseURL: 'https://sauce-demo.myshopify.com/',
    timeout: 30000,
    retries: 1,
    workers: 2,
  },
};

/**
 * Environment & System Access Manager
 */
export class Environment {
  public static get name(): EnvironmentName {
    const raw = (process.env.ENV || 'qa').toLowerCase();
    return (raw in ENV_CONFIGS ? raw : 'qa') as EnvironmentName;
  }

  public static get current(): EnvConfig {
    return ENV_CONFIGS[this.name];
  }

  public static get baseURL(): string {
    return process.env.BASE_URL || this.current.baseURL;
  }

  public static get defaultTimeout(): number {
    return parseInt(process.env.DEFAULT_TIMEOUT || String(this.current.timeout), 10);
  }

  public static get retries(): number {
    if (process.env.RETRIES !== undefined) {
      return parseInt(process.env.RETRIES, 10);
    }
    return this.isCI ? 2 : (this.current.retries ?? 1);
  }

  public static get workers(): number | string | undefined {
    if (process.env.WORKERS !== undefined) {
      const parsed = parseInt(process.env.WORKERS, 10);
      return isNaN(parsed) ? process.env.WORKERS : parsed;
    }
    return this.isCI ? 2 : (this.current.workers ?? undefined);
  }

  public static get browser(): BrowserType {
    const raw = (process.env.BROWSER || 'chromium').toLowerCase();
    return (['chromium', 'firefox', 'webkit', 'all'].includes(raw) ? raw : 'chromium') as BrowserType;
  }

  public static get isCI(): boolean {
    return !!process.env.CI;
  }

  public static get sendEmail(): boolean {
    return process.env.SEND_EMAIL === 'true';
  }

  public static get smtp(): SmtpConfig {
    const rawTo = process.env.SMTP_TO || 'team-qa@example.com';
    const toList = rawTo.split(',').map(e => e.trim()).filter(Boolean);

    return {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '465', 10),
      secure: process.env.SMTP_SECURE !== undefined ? process.env.SMTP_SECURE === 'true' : true,
      user: (process.env.SMTP_USER || '').trim(),
      pass: (process.env.SMTP_PASS || '').replace(/\s+/g, ''),
      from: process.env.SMTP_FROM || '"Sauce Demo Test Automation" <automation-report@example.com>',
      to: toList,
    };
  }

  public static get(key: string, defaultValue: string = ''): string {
    return process.env[key] || defaultValue;
  }
}
