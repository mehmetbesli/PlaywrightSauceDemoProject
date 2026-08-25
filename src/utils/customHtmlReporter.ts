import { FullConfig, FullResult, Reporter, Suite, TestCase, TestResult } from '@playwright/test/reporter';
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { DateTimeHelper } from './dateTimeHelper';
import { Environment } from '../config/environment';
import { EmailService } from './emailService';

interface TestRecord {
  id: string;
  title: string;
  file: string;
  browser: string;
  status: 'passed' | 'failed' | 'timedOut' | 'skipped' | 'interrupted';
  duration: number;
  retries: number;
  error?: string;
  screenshot?: string;
}

export default class CustomHtmlReporter implements Reporter {
  private testRecords: TestRecord[] = [];
  private startTime: number = Date.now();

  onBegin(config: FullConfig, suite: Suite) {
    this.startTime = Date.now();
    this.testRecords = [];
  }

  onTestEnd(test: TestCase, result: TestResult) {
    const errorMsg = result.errors && result.errors.length > 0
      ? result.errors.map(e => e.message || e.stack || '').join('\n')
      : undefined;

    const customScreenshot = test.annotations.find(a => a.type === 'custom_screenshot')?.description;
    const browserName = test.parent.project()?.name || 'chromium';

    const record: TestRecord = {
      id: `${test.id}-${browserName}`,
      title: test.title,
      file: path.relative(process.cwd(), test.location.file),
      browser: browserName.toUpperCase(),
      status: result.status,
      duration: result.duration,
      retries: result.retry,
      error: errorMsg,
      screenshot: customScreenshot,
    };

    // Update existing record if retried, otherwise add new
    const existingIndex = this.testRecords.findIndex(t => t.id === record.id);
    if (existingIndex >= 0) {
      this.testRecords[existingIndex] = record;
    } else {
      this.testRecords.push(record);
    }
  }

  async onEnd(result: FullResult) {
    const timestamp = DateTimeHelper.getTimestamp();
    const totalDuration = ((Date.now() - this.startTime) / 1000).toFixed(2);
    const totalTests = this.testRecords.length;
    const passedTests = this.testRecords.filter(t => t.status === 'passed').length;
    const failedTests = this.testRecords.filter(t => t.status === 'failed' || t.status === 'timedOut').length;
    const skippedTests = this.testRecords.filter(t => t.status === 'skipped').length;
    const retriedTests = this.testRecords.filter(t => t.retries > 0).length;
    const uniqueBrowsers = Array.from(new Set(this.testRecords.map(t => t.browser))).join(', ') || 'CHROMIUM';

    const envName = Environment.name.toUpperCase();
    const baseUrl = Environment.baseURL;

    const reportDir = path.resolve(process.cwd(), 'reports', 'html');
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    const htmlFileName = `${timestamp}.html`;
    const htmlFilePath = path.join(reportDir, htmlFileName);

    const testRowsHtml = this.testRecords.map((t, idx) => {
      const statusColor = t.status === 'passed' ? '#10b981' : '#ef4444';
      const statusBadge = t.status === 'passed' ? 'PASS' : 'FAIL';

      let retryBadge = '';
      if (t.retries > 0) {
        if (t.status === 'passed') {
          retryBadge = `
            <span style="background: #f59e0b; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold; margin-left: 8px;">
              ⚡ FLAKY (Passed on Retry #${t.retries})
            </span>
          `;
        } else {
          retryBadge = `
            <span style="background: #ef4444; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold; margin-left: 8px;">
              🔄 Retry #${t.retries}
            </span>
          `;
        }
      }

      const screenshotBlock = t.screenshot ? `
        <div style="margin-top: 8px; font-size: 13px; color: #dc2626;">
          📸 <strong>Hata Ekran Görüntüsü:</strong> <span style="font-family: monospace; background: #fee2e2; padding: 2px 6px; border-radius: 4px;">${t.screenshot}</span>
        </div>
      ` : '';

      const errorBlock = t.error ? `
        <div style="margin-top: 10px; padding: 12px; background: #1e1e2e; color: #f87171; border-radius: 6px; font-family: monospace; font-size: 13px; white-space: pre-wrap; word-break: break-word;">
          <strong>Error Details:</strong><br>${t.error.replace(/</g, '&lt;').replace(/>/g, '&gt;')}
        </div>
      ` : '';

      return `
        <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
            <div style="font-weight: 600; font-size: 15px; color: #111827; display: flex; align-items: center; flex-wrap: wrap;">
              #${idx + 1} - ${t.title} ${retryBadge}
            </div>
            <div style="display: flex; gap: 8px; align-items: center;">
              <span style="background: #e0e7ff; color: #3730a3; padding: 3px 10px; border-radius: 16px; font-size: 11px; font-weight: bold;">
                🌐 ${t.browser}
              </span>
              <span style="background: ${statusColor}; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold;">
                ${statusBadge}
              </span>
            </div>
          </div>
          <div style="margin-top: 8px; font-size: 13px; color: #6b7280; display: flex; gap: 20px; flex-wrap: wrap;">
            <span>📁 <strong>File:</strong> ${t.file}</span>
            <span>⏱️ <strong>Duration:</strong> ${(t.duration / 1000).toFixed(2)}s</span>
            ${t.retries > 0 ? `<span>🔄 <strong>Retries:</strong> ${t.retries}</span>` : ''}
          </div>
          ${screenshotBlock}
          ${errorBlock}
        </div>
      `;
    }).join('');

    const htmlContent = `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Playwright Test Report - ${timestamp}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #f3f4f6;
      color: #1f2937;
      margin: 0;
      padding: 30px;
    }
    .container {
      max-width: 1050px;
      margin: 0 auto;
    }
    .header {
      background: #1e293b;
      color: white;
      padding: 24px;
      border-radius: 12px;
      margin-bottom: 24px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    .stats {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 14px;
      margin-bottom: 24px;
    }
    .stat-card {
      background: white;
      padding: 16px;
      border-radius: 10px;
      text-align: center;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    .stat-value {
      font-size: 26px;
      font-weight: bold;
      margin-top: 4px;
    }
    @media (max-width: 768px) {
      .stats {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 24px;">🎭 Playwright Test Automation Report</h1>
      <p style="margin: 10px 0 0 0; color: #94a3b8; font-size: 14px; display: flex; flex-wrap: wrap; gap: 16px;">
        <span>📅 Test Tarihi: <strong>${timestamp}</strong></span>
        <span>⏱️ Toplam Süre: <strong>${totalDuration}s</strong></span>
        <span>🌐 Ortam: <strong style="color: #38bdf8;">${envName}</strong></span>
        <span>💻 Tarayıcı(lar): <strong style="color: #c084fc;">${uniqueBrowsers}</strong></span>
      </p>
      <p style="margin: 6px 0 0 0; color: #94a3b8; font-size: 13px;">
        🔗 Hedef URL: <span style="color: #cbd5e1;">${baseUrl}</span>
      </p>
    </div>

    <div class="stats">
      <div class="stat-card">
        <div style="color: #6b7280; font-size: 13px;">Toplam Test</div>
        <div class="stat-value" style="color: #3b82f6;">${totalTests}</div>
      </div>
      <div class="stat-card">
        <div style="color: #6b7280; font-size: 13px;">Başarılı (Pass)</div>
        <div class="stat-value" style="color: #10b981;">${passedTests}</div>
      </div>
      <div class="stat-card">
        <div style="color: #6b7280; font-size: 13px;">Hatalı (Fail)</div>
        <div class="stat-value" style="color: #ef4444;">${failedTests}</div>
      </div>
      <div class="stat-card">
        <div style="color: #6b7280; font-size: 13px;">Atlanan (Skipped)</div>
        <div class="stat-value" style="color: #f59e0b;">${skippedTests}</div>
      </div>
      <div class="stat-card">
        <div style="color: #6b7280; font-size: 13px;">Tekrar (Flaky/Retry)</div>
        <div class="stat-value" style="color: #8b5cf6;">${retriedTests}</div>
      </div>
    </div>

    <h2 style="font-size: 18px; margin-bottom: 16px; color: #374151;">📋 Test Senaryoları</h2>
    ${testRowsHtml}
  </div>
</body>
</html>`;

    fs.writeFileSync(htmlFilePath, htmlContent, 'utf-8');

    // Print Failure Screenshots summary at end of run if any failed
    const failedScreenshots = this.testRecords.filter(t => t.screenshot).map(t => t.screenshot as string);
    if (failedScreenshots.length > 0) {
      failedScreenshots.forEach(s => {
        console.log(`📸 Hata Ekran Görüntüsü kaydedildi: ${s}`);
      });
    }

    console.log(`📄 HTML Raporu oluşturuldu: reports/html/${htmlFileName}`);

    // Check if Email Notification is requested
    if (Environment.sendEmail) {
      let excelFilePath: string | undefined = path.join(process.cwd(), 'reports', 'excel', `${timestamp}.xlsx`);
      
      // If exact matching timestamp file doesn't exist, pick the most recent excel file
      if (!fs.existsSync(excelFilePath)) {
        const excelDir = path.join(process.cwd(), 'reports', 'excel');
        if (fs.existsSync(excelDir)) {
          const files = fs.readdirSync(excelDir).filter(f => f.endsWith('.xlsx')).sort().reverse();
          if (files.length > 0) {
            excelFilePath = path.join(excelDir, files[0]);
          }
        }
      }

      await EmailService.sendTestReport({
        timestamp,
        totalDuration,
        envName,
        uniqueBrowsers,
        totalTests,
        passedTests,
        failedTests,
        skippedTests,
        retriedTests,
        testRecords: this.testRecords,
        htmlReportPath: htmlFilePath,
        excelReportPath: excelFilePath,
        screenshotPaths: failedScreenshots,
      });
    }

    // Automatically open the report in the default browser on Windows
    if (process.platform === 'win32') {
      exec(`start "" "${htmlFilePath}"`);
    }
  }
}
