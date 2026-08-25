import { FullConfig, FullResult, Reporter, Suite, TestCase, TestResult } from '@playwright/test/reporter';
import * as ExcelJS from 'exceljs';
import * as fs from 'fs';
import * as path from 'path';
import { DateTimeHelper } from './dateTimeHelper';
import { Environment } from '../config/environment';

interface TestRecord {
  id: string;
  index: number;
  title: string;
  file: string;
  browser: string;
  status: 'passed' | 'failed' | 'timedOut' | 'skipped' | 'interrupted';
  duration: number;
  retries: number;
  screenshot: string;
  date: string;
  error?: string;
}

export default class CustomExcelReporter implements Reporter {
  private testRecords: TestRecord[] = [];
  private startTime: number = Date.now();

  onBegin(config: FullConfig, suite: Suite) {
    this.startTime = Date.now();
    this.testRecords = [];
  }

  onTestEnd(test: TestCase, result: TestResult) {
    const errorMsg = result.errors && result.errors.length > 0
      ? result.errors.map(e => e.message || e.stack || '').join('\n')
      : '-';

    const customScreenshot = test.annotations.find(a => a.type === 'custom_screenshot')?.description || '-';
    const browserName = test.parent.project()?.name || 'chromium';
    const compositeId = `${test.id}-${browserName}`;

    const existingIndex = this.testRecords.findIndex(t => t.id === compositeId);
    const recordIndex = existingIndex >= 0 ? this.testRecords[existingIndex].index : this.testRecords.length + 1;

    const record: TestRecord = {
      id: compositeId,
      index: recordIndex,
      title: test.title,
      file: path.relative(process.cwd(), test.location.file),
      browser: browserName.toUpperCase(),
      status: result.status,
      duration: result.duration,
      retries: result.retry,
      screenshot: customScreenshot,
      date: new Date().toLocaleString('tr-TR'),
      error: errorMsg,
    };

    if (existingIndex >= 0) {
      this.testRecords[existingIndex] = record;
    } else {
      this.testRecords.push(record);
    }
  }

  async onEnd(result: FullResult) {
    const timestamp = DateTimeHelper.getTimestamp();
    const totalDurationSec = ((Date.now() - this.startTime) / 1000).toFixed(2);
    const totalTests = this.testRecords.length;
    const passedTests = this.testRecords.filter(t => t.status === 'passed').length;
    const failedTests = this.testRecords.filter(t => t.status === 'failed' || t.status === 'timedOut').length;
    const skippedTests = this.testRecords.filter(t => t.status === 'skipped').length;
    const retriedTests = this.testRecords.filter(t => t.retries > 0).length;
    const passRate = totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) + '%' : '0%';
    const uniqueBrowsers = Array.from(new Set(this.testRecords.map(t => t.browser))).join(', ') || 'CHROMIUM';

    const envName = Environment.name.toUpperCase();
    const baseUrl = Environment.baseURL;

    const reportDir = path.resolve(process.cwd(), 'reports', 'excel');
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    const excelFileName = `${timestamp}.xlsx`;
    const excelFilePath = path.join(reportDir, excelFileName);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Playwright Automation';
    workbook.created = new Date();

    // ==========================================
    // SHEET 1: Test Özeti (Executive Summary)
    // ==========================================
    const summarySheet = workbook.addWorksheet('Test Özeti', {
      views: [{ showGridLines: true }],
    });

    summarySheet.columns = [
      { width: 26 },
      { width: 35 },
      { width: 6 },
      { width: 24 },
      { width: 20 },
    ];

    // Header Title
    summarySheet.mergeCells('A1:E1');
    const titleCell = summarySheet.getCell('A1');
    titleCell.value = '🎭 PLAYWRIGHT TEST OTOMASYON RAPORU';
    titleCell.font = { name: 'Segoe UI', size: 15, bold: true, color: { argb: 'FFFFFFFF' } };
    titleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1E293B' },
    };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    summarySheet.getRow(1).height = 36;

    // Subtitle
    summarySheet.mergeCells('A2:E2');
    const subTitleCell = summarySheet.getCell('A2');
    subTitleCell.value = `Rapor Tarihi: ${new Date().toLocaleString('tr-TR')} | Süre: ${totalDurationSec}s`;
    subTitleCell.font = { name: 'Segoe UI', size: 10, italic: true, color: { argb: 'FF94A3B8' } };
    subTitleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1E293B' },
    };
    subTitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    summarySheet.getRow(2).height = 20;

    // Blank row
    summarySheet.addRow([]);

    // Information Section Header
    summarySheet.mergeCells('A4:B4');
    const infoHeaderCell = summarySheet.getCell('A4');
    infoHeaderCell.value = '📋 GENEL BİLGİLER';
    infoHeaderCell.font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
    infoHeaderCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF334155' } };
    infoHeaderCell.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };
    summarySheet.getRow(4).height = 24;

    // Metrics Section Header
    summarySheet.mergeCells('D4:E4');
    const metricsHeaderCell = summarySheet.getCell('D4');
    metricsHeaderCell.value = '📊 TEST METRİKLERİ';
    metricsHeaderCell.font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
    metricsHeaderCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF334155' } };
    metricsHeaderCell.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };

    const borderStyle: Partial<ExcelJS.Borders> = {
      top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
    };

    const infoRows = [
      ['Proje Adı', 'Sauce Demo E2E Test Automation'],
      ['Test Ortamı (ENV)', envName],
      ['Hedef URL', baseUrl],
      ['Koşulan Tarayıcı(lar)', uniqueBrowsers],
      ['Toplam Süre', `${totalDurationSec} saniye`],
      ['Rapor Zamanı', timestamp],
      ['Retry Limiti', `${Environment.retries} Tekrar`],
    ];

    const metricRows = [
      ['Toplam Test', totalTests, 'FF3B82F6', 'FFEFF6FF'],
      ['Başarılı (PASS)', passedTests, 'FF10B981', 'FFECFDF5'],
      ['Başarısız (FAIL)', failedTests, 'FFEF4444', 'FFFEF2F2'],
      ['Atlanan (SKIPPED)', skippedTests, 'FFF59E0B', 'FFFFFBEB'],
      ['Tekrar (Flaky/Retry)', retriedTests, 'FF8B5CF6', 'FFF5F3FF'],
      ['Başarı Oranı', passRate, 'FF0284C7', 'FFF0F9FF'],
      ['Test Durumu', failedTests === 0 ? 'TÜMÜ BAŞARILI' : 'HATALAR VAR', failedTests === 0 ? 'FF10B981' : 'FFEF4444', failedTests === 0 ? 'FFECFDF5' : 'FFFEF2F2'],
    ];

    for (let i = 0; i < 7; i++) {
      const rowIndex = 5 + i;
      const row = summarySheet.getRow(rowIndex);
      row.height = 22;

      // Info Table
      const c1 = row.getCell(1);
      c1.value = infoRows[i][0];
      c1.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FF475569' } };
      c1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
      c1.border = borderStyle;

      const c2 = row.getCell(2);
      c2.value = infoRows[i][1];
      c2.font = { name: 'Segoe UI', size: 10, color: { argb: 'FF1E293B' } };
      c2.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } };
      c2.border = borderStyle;

      // Metrics Table
      const c4 = row.getCell(4);
      c4.value = metricRows[i][0];
      c4.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FF475569' } };
      c4.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
      c4.border = borderStyle;

      const c5 = row.getCell(5);
      c5.value = metricRows[i][1];
      c5.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: metricRows[i][2] as string } };
      c5.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: metricRows[i][3] as string } };
      c5.alignment = { horizontal: 'center', vertical: 'middle' };
      c5.border = borderStyle;
    }

    // ==========================================
    // SHEET 2: Test Detayları (Detailed Results)
    // ==========================================
    const detailSheet = workbook.addWorksheet('Test Detayları', {
      views: [{ showGridLines: true }],
    });

    detailSheet.columns = [
      { header: '#', key: 'index', width: 6 },
      { header: 'Test Senaryosu', key: 'title', width: 44 },
      { header: 'Test Dosyası', key: 'file', width: 32 },
      { header: 'Tarayıcı (Browser)', key: 'browser', width: 18 },
      { header: 'Ortam', key: 'env', width: 12 },
      { header: 'Durum', key: 'status', width: 14 },
      { header: 'Tekrar (Retry)', key: 'retries', width: 16 },
      { header: 'Süre (sn)', key: 'duration', width: 12 },
      { header: '📸 Ekran Görüntüsü', key: 'screenshot', width: 38 },
      { header: 'Tarih & Saat', key: 'date', width: 20 },
      { header: 'Hata Detayı', key: 'error', width: 50 },
    ];

    // Style Header Row
    const headerRow = detailSheet.getRow(1);
    headerRow.height = 26;
    headerRow.eachCell((cell) => {
      cell.font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1E293B' },
      };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FF0F172A' } },
        bottom: { style: 'medium', color: { argb: 'FF0F172A' } },
        left: { style: 'thin', color: { argb: 'FF334155' } },
        right: { style: 'thin', color: { argb: 'FF334155' } },
      };
    });

    // Populate Data Rows
    this.testRecords.forEach((record) => {
      const isPass = record.status === 'passed';
      const isFail = record.status === 'failed' || record.status === 'timedOut';
      const statusText = isPass ? 'PASS' : isFail ? 'FAIL' : 'SKIPPED';
      const statusColor = isPass ? 'FF065F46' : isFail ? 'FF991B1B' : 'FF92400E';
      const statusBg = isPass ? 'FFD1FAE5' : isFail ? 'FFFEE2E2' : 'FFFEF3C7';

      let retryText = '-';
      if (record.retries > 0) {
        retryText = isPass ? `⚡ FLAKY (#${record.retries})` : `Retry #${record.retries}`;
      }

      const row = detailSheet.addRow({
        index: record.index,
        title: record.title,
        file: record.file,
        browser: record.browser,
        env: envName,
        status: statusText,
        retries: retryText,
        duration: (record.duration / 1000).toFixed(2),
        screenshot: record.screenshot,
        date: record.date,
        error: record.error,
      });

      row.height = 24;

      row.eachCell((cell, colNumber) => {
        cell.font = { name: 'Segoe UI', size: 10, color: { argb: 'FF1F2937' } };
        cell.border = borderStyle;
        cell.alignment = { vertical: 'middle' };

        // Specific alignments
        if (colNumber === 1 || colNumber === 4 || colNumber === 5 || colNumber === 7 || colNumber === 8 || colNumber === 10) {
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
        } else if (colNumber === 6) {
          // Status column styling
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
          cell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: statusColor } };
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: statusBg } };
        } else if (colNumber === 7 && record.retries > 0) {
          cell.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: 'FFD97706' } };
        } else if (colNumber === 9) {
          // Screenshot column styling
          if (record.screenshot !== '-') {
            cell.font = { name: 'Segoe UI', size: 9, italic: true, color: { argb: 'FFDC2626' } };
            cell.alignment = { horizontal: 'left', vertical: 'middle' };
          } else {
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
          }
        } else if (colNumber === 11 && record.error !== '-') {
          // Error message wrapping
          cell.font = { name: 'Segoe UI', size: 9, color: { argb: 'FFDC2626' } };
          cell.alignment = { wrapText: true, vertical: 'middle' };
        }
      });
    });

    await workbook.xlsx.writeFile(excelFilePath);
    console.log(`📊 Excel Raporu oluşturuldu: reports/excel/${excelFileName}`);
  }
}
