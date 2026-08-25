import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';
import { Environment } from '../config/environment';

export interface EmailTestRecord {
  title: string;
  file: string;
  browser: string;
  status: 'passed' | 'failed' | 'timedOut' | 'skipped' | 'interrupted';
  duration: number;
  retries: number;
  error?: string;
  screenshot?: string;
}

export interface EmailReportPayload {
  timestamp: string;
  totalDuration: string;
  envName: string;
  uniqueBrowsers: string;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
  retriedTests: number;
  testRecords: EmailTestRecord[];
  htmlReportPath?: string;
  excelReportPath?: string;
  screenshotPaths?: string[];
}

export class EmailService {
  /**
   * Generates a modern, responsive HTML email body with badges, metrics, and scenario details.
   */
  private static generateHtmlBody(payload: EmailReportPayload): string {
    const isAllPassed = payload.failedTests === 0;
    const headerBg = isAllPassed ? '#0f766e' : '#991b1b';
    const headerTitle = isAllPassed
      ? '✅ Test Koşumu Başarıyla Tamamlandı'
      : '🚨 DİKKAT: Test Koşumunda Hatalar Tespit Edildi';

    const testRowsHtml = payload.testRecords.map((t, idx) => {
      const isPass = t.status === 'passed';
      const statusBg = isPass ? '#dcfce7' : '#fee2e2';
      const statusColor = isPass ? '#15803d' : '#b91c1c';
      const statusText = isPass ? 'PASS' : 'FAIL';

      let retryTag = '';
      if (t.retries > 0) {
        retryTag = isPass
          ? '<span style="background: #fef3c7; color: #b45309; padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: bold; margin-left: 6px;">⚡ FLAKY (#1)</span>'
          : `<span style="background: #fee2e2; color: #b91c1c; padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: bold; margin-left: 6px;">🔄 Retry #${t.retries}</span>`;
      }

      return `
        <tr style="border-bottom: 1px solid #e5e7eb;">
          <td style="padding: 10px 12px; font-size: 13px; color: #111827;">#${idx + 1}</td>
          <td style="padding: 10px 12px; font-size: 13px; color: #111827; font-weight: 500;">
            ${t.title} ${retryTag}
          </td>
          <td style="padding: 10px 12px; font-size: 12px; color: #4338ca; font-weight: bold; text-align: center;">
            ${t.browser}
          </td>
          <td style="padding: 10px 12px; text-align: center;">
            <span style="background: ${statusBg}; color: ${statusColor}; padding: 3px 10px; border-radius: 12px; font-size: 11px; font-weight: bold;">
              ${statusText}
            </span>
          </td>
          <td style="padding: 10px 12px; font-size: 12px; color: #6b7280; text-align: center;">
            ${(t.duration / 1000).toFixed(2)}s
          </td>
        </tr>
      `;
    }).join('');

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; }
        .card { max-width: 650px; margin: 0 auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); border: 1px solid #e2e8f0; }
        .header { background: ${headerBg}; color: #ffffff; padding: 24px; text-align: center; }
        .header h1 { margin: 0; font-size: 20px; font-weight: 700; }
        .header p { margin: 6px 0 0 0; font-size: 13px; opacity: 0.9; }
        .content { padding: 20px; }
        .metrics-grid { display: table; width: 100%; margin-bottom: 20px; }
        .metric-cell { display: table-cell; width: 20%; text-align: center; padding: 10px 4px; background: #f8fafc; border-radius: 6px; border: 1px solid #f1f5f9; }
        .metric-val { font-size: 20px; font-weight: bold; }
        .metric-label { font-size: 11px; color: #64748b; margin-top: 2px; }
        .info-table { width: 100%; font-size: 13px; margin-bottom: 20px; border-collapse: collapse; }
        .info-table td { padding: 6px 0; }
        .scenarios-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        .scenarios-table th { background: #f1f5f9; color: #475569; font-size: 12px; text-align: left; padding: 8px 12px; border-bottom: 1px solid #cbd5e1; }
        .footer { background: #f8fafc; padding: 16px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
        .attachments-note { margin-top: 16px; padding: 12px; background: #eff6ff; border-left: 4px solid #3b82f6; border-radius: 4px; font-size: 13px; color: #1e40af; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <h1>${headerTitle}</h1>
          <p>Tarih: ${payload.timestamp} | Süre: ${payload.totalDuration}s | Ortam: <strong>${payload.envName}</strong></p>
        </div>
        <div class="content">
          <div class="metrics-grid">
            <div class="metric-cell"><div class="metric-val" style="color: #3b82f6;">${payload.totalTests}</div><div class="metric-label">Toplam</div></div>
            <div class="metric-cell"><div class="metric-val" style="color: #10b981;">${payload.passedTests}</div><div class="metric-label">Başarılı</div></div>
            <div class="metric-cell"><div class="metric-val" style="color: #ef4444;">${payload.failedTests}</div><div class="metric-label">Hatalı</div></div>
            <div class="metric-cell"><div class="metric-val" style="color: #f59e0b;">${payload.skippedTests}</div><div class="metric-label">Atlanan</div></div>
            <div class="metric-cell"><div class="metric-val" style="color: #8b5cf6;">${payload.retriedTests}</div><div class="metric-label">Flaky/Retry</div></div>
          </div>

          <table class="info-table">
            <tr>
              <td style="color: #64748b; width: 140px;">🌐 <strong>Test Ortamı:</strong></td>
              <td>${payload.envName}</td>
            </tr>
            <tr>
              <td style="color: #64748b;">💻 <strong>Tarayıcı(lar):</strong></td>
              <td><strong style="color: #4338ca;">${payload.uniqueBrowsers}</strong></td>
            </tr>
            <tr>
              <td style="color: #64748b;">⏱️ <strong>Toplam Süre:</strong></td>
              <td>${payload.totalDuration} saniye</td>
            </tr>
          </table>

          <h3 style="font-size: 14px; color: #334155; margin: 16px 0 8px 0;">📋 Test Senaryoları Özeti</h3>
          <table class="scenarios-table">
            <thead>
              <tr>
                <th style="width: 30px;">#</th>
                <th>Test Senaryosu</th>
                <th style="text-align: center; width: 90px;">Tarayıcı</th>
                <th style="text-align: center; width: 70px;">Durum</th>
                <th style="text-align: center; width: 60px;">Süre</th>
              </tr>
            </thead>
            <tbody>
              ${testRowsHtml}
            </tbody>
          </table>

          <div class="attachments-note">
            📎 <strong>E-Posta Ekleri:</strong><br>
            • 📄 <strong>HTML Raporu (${payload.timestamp}.html)</strong>: İndirip tarayıcınızda interaktif açabilirsiniz.<br>
            • 📊 <strong>Excel Raporu (${payload.timestamp}.xlsx)</strong>: Detaylı filtreleme ve yönetici metrikleri içerir.<br>
            ${payload.screenshotPaths && payload.screenshotPaths.length > 0 ? '• 📸 <strong>Hata Ekran Görüntüleri (.png)</strong>: Ekten doğrudan görüntülenebilir.' : ''}
          </div>
        </div>
        <div class="footer">
          Playwright & TypeScript Test Otomasyon Sistemi | Otomatik E-Posta Bildirimi
        </div>
      </div>
    </body>
    </html>
    `;
  }

  /**
   * Sends test report via Email with HTML, Excel, and Screenshot attachments.
   */
  public static async sendTestReport(payload: EmailReportPayload): Promise<void> {
    const smtp = Environment.smtp;
    const isAllPassed = payload.failedTests === 0;

    const subject = isAllPassed
      ? `✅ [${payload.envName}] Test Raporu: ${payload.passedTests}/${payload.totalTests} Başarılı (%100) - ${payload.timestamp}`
      : `🚨 [${payload.envName}] DİKKAT: ${payload.failedTests} Test Hata Aldı! - ${payload.timestamp}`;

    const attachments: nodemailer.SendMailOptions['attachments'] = [];

    // 1. Attach HTML Report
    if (payload.htmlReportPath && fs.existsSync(payload.htmlReportPath)) {
      attachments.push({
        filename: path.basename(payload.htmlReportPath),
        path: payload.htmlReportPath,
        contentType: 'text/html',
      });
    }

    // 2. Attach Excel Report
    if (payload.excelReportPath && fs.existsSync(payload.excelReportPath)) {
      attachments.push({
        filename: path.basename(payload.excelReportPath),
        path: payload.excelReportPath,
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
    }

    // 3. Attach Failure Screenshots (if any)
    if (payload.screenshotPaths && payload.screenshotPaths.length > 0) {
      payload.screenshotPaths.forEach((scPath) => {
        if (fs.existsSync(scPath)) {
          attachments.push({
            filename: path.basename(scPath),
            path: scPath,
            contentType: 'image/png',
          });
        }
      });
    }

    const htmlBody = this.generateHtmlBody(payload);

    // Configure Transporter with clean credentials
    let transporter: nodemailer.Transporter;

    if (smtp.user && smtp.pass) {
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: smtp.user.trim(),
          pass: smtp.pass.replace(/\s+/g, ''),
        },
      });
    } else {
      console.log('ℹ️  SMTP kullanıcı bilgileri tanımlanmadığı için Ethereal Test Sunucusu oluşturuluyor...');
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    }

    try {
      const info = await transporter.sendMail({
        from: smtp.from,
        to: smtp.to,
        subject: subject,
        html: htmlBody,
        attachments: attachments,
      });

      console.log(`📧 Test Sonucu E-Postası Gönderildi! [Kime: ${smtp.to.join(', ')}]`);
      console.log(`📎 Eklenen Dosyalar: ${attachments.map(a => a.filename).join(', ')}`);

      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.log(`🌐 E-Posta Önizleme Bağlantısı: ${previewUrl}`);
      }
    } catch (error) {
      console.error('❌ E-Posta gönderilirken hata oluştu:', error);
    }
  }
}
