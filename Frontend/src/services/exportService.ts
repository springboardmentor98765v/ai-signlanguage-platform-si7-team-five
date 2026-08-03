import { PracticeSession } from '../types';

export interface ExportReportOptions {
  format: 'csv' | 'excel' | 'pdf';
  includePracticeHistory: boolean;
  includeAccuracyMetrics: boolean;
  dateRange: string;
}

class ExportService {
  async exportReport(data: PracticeSession[], options: ExportReportOptions): Promise<{ filename: string; blobUrl: string }> {
    // Simulates generation processing
    await new Promise((r) => setTimeout(r, 600));

    const timestamp = new Date().toISOString().split('T')[0];

    if (options.format === 'csv') {
      const headers = ['Session ID', 'Date', 'Lesson Name', 'Sign Symbol', 'Accuracy (%)', 'Duration (s)', 'Feedback'];
      const rows = data.map((s) => [
        s.id,
        `"${s.date}"`,
        `"${s.lessonName}"`,
        `"${s.signSymbol}"`,
        s.accuracy,
        s.durationSeconds,
        `"${s.feedback.replace(/"/g, '""')}"`,
      ]);

      const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const blobUrl = URL.createObjectURL(blob);
      const filename = `ASL_Performance_Report_${timestamp}.csv`;

      return { filename, blobUrl };
    }

    if (options.format === 'excel') {
      // Formatted XML-based Spreadsheet / TSV for Excel compatibility
      const headers = ['Session ID', 'Date', 'Lesson Name', 'Sign Symbol', 'Accuracy (%)', 'Duration (s)', 'Feedback'];
      const rows = data.map((s) => [
        s.id,
        s.date,
        s.lessonName,
        s.signSymbol,
        `${s.accuracy}%`,
        `${s.durationSeconds}s`,
        s.feedback,
      ]);

      const excelContent = [headers.join('\t'), ...rows.map((r) => r.join('\t'))].join('\n');
      const blob = new Blob([excelContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
      const blobUrl = URL.createObjectURL(blob);
      const filename = `ASL_Performance_Report_${timestamp}.xls`;

      return { filename, blobUrl };
    }

    // PDF format generation via formatted HTML printable document blob
    const printableHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>ASL Platform Performance Report</title>
          <style>
            body { font-family: system-ui, sans-serif; padding: 32px; color: #111827; }
            h1 { color: #059669; margin-bottom: 4px; }
            .sub { color: #6b7280; font-size: 14px; margin-bottom: 24px; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; }
            th, td { border: 1px solid #e5e7eb; padding: 10px 14px; text-align: left; font-size: 13px; }
            th { background: #f9fafb; font-weight: 700; color: #374151; }
            .badge { background: #ecfdf5; color: #047857; padding: 4px 8px; border-radius: 9999px; font-weight: 600; }
          </style>
        </head>
        <body>
          <h1>SignAI Learn – Performance & Assessment Report</h1>
          <div class="sub">Generated on ${new Date().toLocaleDateString()} | Range: ${options.dateRange}</div>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Lesson / Topic</th>
                <th>Target Sign</th>
                <th>Accuracy Score</th>
                <th>Duration</th>
                <th>Feedback Notes</th>
              </tr>
            </thead>
            <tbody>
              ${data
                .map(
                  (s) => `
                <tr>
                  <td>${s.date}</td>
                  <td><strong>${s.lessonName}</strong></td>
                  <td><span class="badge">${s.signSymbol}</span></td>
                  <td><strong>${s.accuracy}%</strong></td>
                  <td>${s.durationSeconds}s</td>
                  <td>${s.feedback}</td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;

    const blob = new Blob([printableHtml], { type: 'text/html;charset=utf-8;' });
    const blobUrl = URL.createObjectURL(blob);
    const filename = `ASL_Performance_Report_${timestamp}.html`;

    return { filename, blobUrl };
  }
}

export const exportService = new ExportService();
